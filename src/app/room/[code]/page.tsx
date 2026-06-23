"use client";

import { use, useEffect, useRef, useState } from "react";
import {
  getRoom,
  joinRoom,
  finishPlayer,
  listPlayers,
  subscribePlayers,
  type Player,
  type Room,
} from "@/lib/rooms";
import { getMoviesByIds, type Movie } from "@/data/movies";
import { isExpired } from "@/lib/roomExpiry";
import { rankTitle } from "@/lib/score";
import { personalBlob, leaderboardBlob, shareOrDownload, isMobile } from "@/lib/shareCard";
import { makeSlug } from "@/lib/shareSlug";
import { unlockMediaPlayback } from "@/lib/mediaUnlock";
import GameRounds, { type Outcome } from "@/app/GameRounds";

type Phase = "loading" | "lobby" | "playing" | "done";

// shuffle — per-player order (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// RoomPage — lobby → play → leaderboard
export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const [phase, setPhase] = useState<Phase>("loading");
  const [room, setRoom] = useState<Room | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [me, setMe] = useState<Player | null>(null);
  const [myOutcomes, setMyOutcomes] = useState<Outcome[] | null>(null);
  const [err, setErr] = useState("");
  const [sharing, setSharing] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const joining = useRef(false);

  // mobile (share sheet) vs desktop/Mac (download/copy) for button labels
  useEffect(() => {
    setMobile(isMobile());
  }, []);

  // load room + subscribe to leaderboard
  useEffect(() => {
    let cancelled = false;
    let unsub = () => {};
    (async () => {
      const r = await getRoom(code);
      if (cancelled) return;
      if (!r) {
        setErr("Room not found.");
        setPhase("lobby");
        return;
      }
      const roomPlayers = await listPlayers(code);
      if (cancelled) return;
      if (r.created_at && isExpired(r.created_at, roomPlayers)) {
        setErr("This room link has expired.");
        setPhase("lobby");
        return;
      }
      setRoom(r);
      // Same shared set (fair leaderboard) but shuffled per player so friends
      // in the same room aren't on the same clip at once (no copying/spoilers).
      setMovies(shuffle(await getMoviesByIds(r.movie_ids)));
      if (cancelled) return;
      setName(sessionStorage.getItem("qp_name") || "");
      setPlayers(roomPlayers);
      unsub = subscribePlayers(code, async () => {
        setPlayers(await listPlayers(code));
      });
      setPhase("lobby");
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, [code]);

  async function join() {
    setErr("");
    if (!name.trim()) {
      setErr("Enter your name.");
      return;
    }
    if (joining.current) return;
    unlockMediaPlayback(); // inside the tap, so clips can autoplay on mobile
    joining.current = true;
    const player = await joinRoom(code, name.trim());
    joining.current = false;
    if (!player) {
      setErr("Couldn't join. Try again.");
      return;
    }
    sessionStorage.setItem("qp_name", name.trim());
    setMe(player);
    setPhase("playing");
  }

  async function finishGame(outcomes: Outcome[]) {
    const correct = outcomes.filter((o) => o.correct).length;
    setMyOutcomes(outcomes);
    if (me) await finishPlayer(me.id, correct);
    setPhase("done");
  }

  function shareLink() {
    const url = `${window.location.origin}/room/${code}`;
    const text = `Join my Guess the Movie game on quickplay.fun!`;
    // Mobile: native share sheet. Desktop/Mac: copy the link.
    if (isMobile() && navigator.share) {
      navigator.share({ text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`);
      alert("Room link copied to clipboard!");
    }
  }

  if (phase === "loading") return <div className="card enter">Loading room…</div>;

  // LOBBY
  if (phase === "lobby") {
    return (
      <div className="enter">
        <h1 className="h1">
          {room ? room.host_name : <>Room <em>{code}</em></>}
        </h1>
        {room && <p className="sub">Room code <em>{code}</em></p>}
        {err && <div className="notice notice-bad">{err}</div>}

        {room && (
          <>
            <div className="card">
              <span className="label">Enter your name to play</span>
              <input
                className="input"
                style={{ marginTop: 12 }}
                placeholder="e.g. Riya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") join(); }}
              />
              <button className="btn btn-primary" onClick={join}>
                Join &amp; play ▶️
              </button>
              <button className="btn btn-ghost" onClick={shareLink}>
                Share room link
              </button>
            </div>

            <div className="card">
              <span className="label">Players ({players.length})</span>
              <div style={{ marginTop: 10 }}>
                {players.length === 0 && (
                  <p className="sub" style={{ margin: 0 }}>
                    No one yet. Share the link to get the party started 🎉
                  </p>
                )}
                {players.map((p) => (
                  <div className="review-row" key={p.id}>
                    <span>{p.name}</span>
                    <span className={p.finished ? "tag-ok" : "sub"}>
                      {p.finished ? `${p.score}/${room.round_count}` : "in lobby"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // PLAYING
  if (phase === "playing" && room) {
    return (
      <GameRounds movies={movies} onFinish={finishGame} />
    );
  }

  // DONE — individual card + group leaderboard
  const correct = myOutcomes ? myOutcomes.filter((o) => o.correct).length : 0;
  const total = room?.round_count ?? 5;
  const rank = rankTitle(correct, total);
  const sorted = [...players].sort((a, b) => b.score - a.score);

  async function shareCard() {
    if (sharing) return;
    setSharing(true);
    const myName = me?.name || sessionStorage.getItem("qp_name") || "";
    const url = `${window.location.origin}/s/${makeSlug(correct, total, myName)}`;
    const caption = `I'm a ${rank.emoji} ${rank.title}! Nailed ${correct}/${total} clips on Guess the Movie. Beat me →`;
    const blob = await personalBlob({ emoji: rank.emoji, title: rank.title, correct, total, name: myName });
    await shareOrDownload(blob, "quickplay-score.png", caption, url);
    setSharing(false);
  }

  async function shareBoard() {
    if (sharing) return;
    setSharing(true);
    const url = `${window.location.origin}/room/${code}`;
    const rows = sorted.map((p) => ({
      name: p.name,
      score: p.finished ? p.score : 0,
      total,
      you: !!(me && p.id === me.id),
    }));
    const blob = await leaderboardBlob(rows);
    await shareOrDownload(blob, "quickplay-leaderboard.png", "Our Guess the Movie scores! Join us →", url);
    setSharing(false);
  }

  return (
    <div className="enter">
      <div className="result-hero">
        <div className="result-emoji">{rank.emoji}</div>
        <div className="result-title">{rank.title}</div>
        <div className="result-score">
          You nailed <b>{correct}/{room?.round_count}</b> clips
        </div>
      </div>

      <div className="card">
        <span className="label">Leaderboard</span>
        <div style={{ marginTop: 10 }}>
          {sorted.map((p, i) => (
            <div className="review-row" key={p.id}>
              <span>
                {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""}
                {p.name}
                {me && p.id === me.id ? " (you)" : ""}
              </span>
              <span className={p.finished ? "tag-ok" : "sub"}>
                {p.finished ? `${p.score}/${room?.round_count}` : "playing…"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {myOutcomes && myOutcomes.length > 0 && !showAnswers && (
        <button className="btn btn-ghost" onClick={() => setShowAnswers(true)}>
          👀 Show me the answers
        </button>
      )}

      {myOutcomes && myOutcomes.length > 0 && showAnswers && (
        <div className="card">
          <span className="label">The reveal 🎬</span>
          <p className="sub" style={{ margin: "6px 0 14px" }}>Here&apos;s what each clip was.</p>
          <div className="reveal-list">
            {myOutcomes.map((o, i) => (
              <div className="reveal-row" key={i}>
                {!o.clip || o.clip.startsWith("#") ? (
                  <div className="reveal-clip" style={{ background: o.clip || "#222" }} />
                ) : (
                  <video
                    className="reveal-clip"
                    src={o.clip}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    controlsList="nodownload"
                    onClick={(e) => {
                      const v = e.currentTarget;
                      if (v.paused) v.play(); else v.pause();
                    }}
                  />
                )}
                <div className="reveal-info">
                  <span className="reveal-title">{o.title}</span>
                  <span className={o.correct ? "tag-ok" : "tag-bad"}>
                    {o.correct ? "✓ Got it" : "✗ Missed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn btn-primary" onClick={shareCard} disabled={sharing}>
          {sharing ? "Making card…" : mobile ? "Share my card 🔥" : "Download my card ⬇️"}
        </button>
        <button className="btn btn-cyan" onClick={shareBoard} disabled={sharing}>
          {mobile ? "Share leaderboard 🏆" : "Download leaderboard 🏆"}
        </button>
        <a className="btn btn-ghost" href="/#friends" style={{ textDecoration: "none" }}>
          Start your own room 🎉
        </a>
        <a className="back" href="/" style={{ textDecoration: "none" }}>
          Home
        </a>
      </div>
    </div>
  );
}
