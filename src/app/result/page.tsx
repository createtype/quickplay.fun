"use client";

import { useEffect, useState } from "react";
import { rankTitle } from "@/lib/score";
import { makeSlug } from "@/lib/shareSlug";
import { personalBlob, shareOrDownload, isMobile } from "@/lib/shareCard";

type Outcome = { title: string; guess: string; correct: boolean; clip?: string };

const isPlaceholder = (clip?: string) => !clip || clip.startsWith("#");

// Result — score card + review
export default function ResultPage() {
  const [outcomes, setOutcomes] = useState<Outcome[] | null>(null);
  const [sharing, setSharing] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("qp_outcomes");
    setOutcomes(raw ? JSON.parse(raw) : []);
    setMobile(isMobile());
  }, []);

  if (outcomes === null) return <div className="card">Loading…</div>;

  if (outcomes.length === 0) {
    return (
      <div className="card enter">
        <span className="label">No game found 🎬</span>
        <p className="sub" style={{ margin: "8px 0 14px" }}>
          Start a round and your score card shows up here.
        </p>
        <a className="btn btn-primary" href="/" style={{ textDecoration: "none" }}>
          Play a game ▶️
        </a>
      </div>
    );
  }

  const correct = outcomes.filter((o) => o.correct).length;
  const rank = rankTitle(correct, outcomes.length);

  const total = outcomes.length;

  async function share() {
    if (sharing) return;
    setSharing(true);
    const name = sessionStorage.getItem("qp_name") || "";
    const url = `${window.location.origin}/s/${makeSlug(correct, total, name)}`;
    const caption = `I'm a ${rank.emoji} ${rank.title}! Nailed ${correct}/${total} clips on Guess the Movie. Beat me →`;
    const blob = await personalBlob({ emoji: rank.emoji, title: rank.title, correct, total, name });
    await shareOrDownload(blob, "quickplay-score.png", caption, url);
    setSharing(false);
  }

  return (
    <div className="enter">
      <div className="result-hero">
        <div className="result-emoji">{rank.emoji}</div>
        <div className="result-title">{rank.title}</div>
        <div className="result-score">
          You nailed <b>{correct}/{outcomes.length}</b> clips
        </div>
      </div>

      {!showAnswers ? (
        <button className="btn btn-ghost" onClick={() => setShowAnswers(true)}>
          👀 Show me the answers
        </button>
      ) : (
      <div className="card">
        <span className="label">The reveal 🎬</span>
        <p className="sub" style={{ margin: "6px 0 14px" }}>Here&apos;s what each clip was.</p>
        <div className="reveal-list">
          {outcomes.map((o, i) => (
            <div className="reveal-row" key={i}>
              {isPlaceholder(o.clip) ? (
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
        <button className="btn btn-primary" onClick={share} disabled={sharing}>
          {sharing ? "Making card…" : mobile ? "Share my score 🔥" : "Download score card ⬇️"}
        </button>
        <a className="btn btn-ghost" href="/" style={{ textDecoration: "none" }}>
          Play again
        </a>
      </div>
    </div>
  );
}
