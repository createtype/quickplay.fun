"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/data/movies";
import { createRoom, FRIENDS_COUNTS } from "@/lib/rooms";

const LANGS: { id: Language; label: string }[] = [
  { id: "hindi", label: "Hindi" },
  { id: "tamil", label: "Tamil" },
  { id: "malayalam", label: "Malayalam" },
];

type Step = "pick" | "solo" | "friends";

// Home — mode-first, progressive
export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pick");
  const [selected, setSelected] = useState<Language[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roundCount, setRoundCount] = useState<number>(FRIENDS_COUNTS[0]);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  // Open straight to the friends step when linked with #friends (e.g. "start your own room").
  useEffect(() => {
    if (window.location.hash === "#friends") setStep("friends");
  }, []);

  function toggle(id: Language) {
    setErr("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  function startSolo() {
    if (selected.length === 0) {
      setErr("Pick at least one language to play.");
      return;
    }
    router.push(`/play?langs=${selected.join(",")}`);
  }

  async function startFriends() {
    setErr("");
    if (!roomName.trim()) {
      setErr("Give your room a name.");
      return;
    }
    if (selected.length === 0) {
      setErr("Pick at least one language.");
      return;
    }
    setCreating(true);
    const room = await createRoom(roomName.trim(), selected, roundCount);
    setCreating(false);
    if (!room) {
      setErr("Couldn't create a room. Try again in a sec.");
      return;
    }
    router.push(`/room/${room.id}`);
  }

  function back() {
    setErr("");
    setStep("pick");
  }

  return (
    <>
      <h1 className="h1">
        Guess the <em>Movie</em> 🎬
      </h1>
      <p className="sub">One-second clip. Name the film. Brag about it.</p>

      {step === "pick" && (
        <div className="enter">
          <button className="mode-btn mode-solo" onClick={() => { setErr(""); setStep("solo"); }}>
            <span className="mb-emoji">▶️</span>
            <span className="mb-title">Play Solo</span>
            <span className="mb-sub">Jump in. 4 clips, just you.</span>
          </button>
          <button className="mode-btn mode-friends" onClick={() => { setErr(""); setStep("friends"); }}>
            <span className="mb-emoji">👥</span>
            <span className="mb-title">Play with Friends</span>
            <span className="mb-sub">Share a link. Same clips. Live scores.</span>
          </button>
        </div>
      )}

      {step === "solo" && (
        <div className="enter">
          <div className="card">
            <span className="label">Which movies?</span>
            <p className="sub" style={{ margin: "6px 0 14px" }}>Pick one or more.</p>
            <div className="chip-row">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  className={`chip ${selected.includes(l.id) ? "on" : ""}`}
                  onClick={() => toggle(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          {err && <div className="notice notice-bad">{err}</div>}
          <div className="actions">
            <button className="btn btn-primary" onClick={startSolo}>
              Let&apos;s go ▶️
            </button>
            <button className="back" onClick={back}>← Back</button>
          </div>
        </div>
      )}

      {step === "friends" && (
        <div className="enter">
          <div className="card">
            <span className="label">Room name</span>
            <input
              className="input"
              style={{ marginTop: 12 }}
              placeholder="e.g. Friday Movie Night"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <span className="label" style={{ display: "block", marginTop: 18 }}>
              Which movies?
            </span>
            <div className="chip-row" style={{ marginTop: 12 }}>
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  className={`chip ${selected.includes(l.id) ? "on" : ""}`}
                  onClick={() => toggle(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <span className="label" style={{ display: "block", marginTop: 18 }}>
              How many clips?
            </span>
            <div className="chip-row" style={{ marginTop: 12 }}>
              {FRIENDS_COUNTS.map((n) => (
                <button
                  key={n}
                  className={`chip ${roundCount === n ? "on" : ""}`}
                  onClick={() => setRoundCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {err && <div className="notice notice-bad">{err}</div>}
          <div className="actions">
            <button className="btn btn-cyan" disabled={creating} onClick={startFriends}>
              {creating ? "Creating room…" : "Create room 🎉"}
            </button>
            <button className="back" onClick={back}>← Back</button>
          </div>
        </div>
      )}

      <div className="foot">
        <div className="foot-links">
          <a className="suggest-link" href="/submit">🎬 Suggest a movie</a>
          <a className="suggest-link" href="/idea">💡 Got an idea?</a>
        </div>
        <p style={{ margin: "14px 0 0" }}>Built for movie nerds. No signup, just play.</p>
      </div>
    </>
  );
}
