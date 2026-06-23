"use client";

import { useRef, useState } from "react";
import { submitSuggestion } from "@/lib/suggestions";

// IdeaPage — public feature/feedback suggestion box
export default function IdeaPage() {
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null); // bots fill hidden fields

  async function send() {
    setErr("");
    if (honeypot.current?.value) return; // silently drop bots
    if (!body.trim()) return setErr("Write your idea first.");
    setBusy(true);
    const res = await submitSuggestion({ body, name });
    setBusy(false);
    if (!res.ok) return setErr(res.error || "Couldn't send. Try again.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="enter">
        <h1 className="h1">Got it! 🙌</h1>
        <div className="card">
          <p style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
            Thanks for the idea, we read every one and it helps shape what we build next.
          </p>
          <a className="btn btn-primary" href="/" style={{ textDecoration: "none" }}>
            Back to playing ▶️
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="enter">
      <h1 className="h1">
        Got an <em>idea?</em> 💡
      </h1>
      <p className="sub">
        Tell us what would make quickplay.fun better, a feature, a fix, anything.
      </p>

      <div className="card">
        <span className="label">Your idea</span>
        <textarea
          className="input"
          style={{ marginTop: 10, minHeight: 130, resize: "vertical" }}
          placeholder="I wish the game would…"
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <span className="label" style={{ display: "block", marginTop: 16 }}>
          Your name <span style={{ color: "var(--muted)", fontWeight: 500 }}>(optional)</span>
        </span>
        <input
          className="input"
          style={{ marginTop: 10 }}
          placeholder="So we can thank you"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {/* honeypot: hidden from humans, bots tend to fill it */}
        <input
          ref={honeypot}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        />
      </div>

      {err && <div className="notice notice-bad">{err}</div>}
      <div className="actions">
        <button className="btn btn-primary" disabled={busy} onClick={send}>
          {busy ? "Sending…" : "Send idea 💡"}
        </button>
        <a className="btn btn-ghost" href="/" style={{ textDecoration: "none" }}>
          Cancel
        </a>
      </div>
    </div>
  );
}
