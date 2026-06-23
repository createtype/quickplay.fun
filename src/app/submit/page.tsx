"use client";

import { useState } from "react";
import type { Language } from "@/data/movies";
import { submitMovie } from "@/lib/submissions";

const LANGS: { id: Language; label: string }[] = [
  { id: "hindi", label: "Hindi" },
  { id: "tamil", label: "Tamil" },
  { id: "malayalam", label: "Malayalam" },
];

type Source = "youtube" | "screenshots";

// SubmitPage — public "add a missing movie" form
export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<Language | null>(null);
  const [aliases, setAliases] = useState("");
  const [source, setSource] = useState<Source>("youtube");
  const [youtube, setYoutube] = useState("");
  const [shots, setShots] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setErr("");
    if (!title.trim()) return setErr("Enter the movie title.");
    if (!language) return setErr("Pick a language.");
    if (source === "youtube" && !youtube.trim())
      return setErr("Paste a YouTube link.");
    if (source === "screenshots" && !shots.trim())
      return setErr("Add at least one screenshot URL.");

    setBusy(true);
    const res = await submitMovie({
      title,
      language,
      aliases: aliases.split(",").map((a) => a.trim()).filter(Boolean),
      youtubeUrl: source === "youtube" ? youtube : undefined,
      screenshots:
        source === "screenshots"
          ? shots.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
          : undefined,
      submittedBy: name,
    });
    setBusy(false);
    if (!res.ok) return setErr(res.error || "Couldn't submit. Try again.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="enter">
        <h1 className="h1">Nice one! 🎉</h1>
        <div className="card">
          <p style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
            Your movie is in the queue for review. Once it&apos;s approved it&apos;ll
            start popping up in games.
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
        Suggest a <em>movie</em> 🎬
      </h1>
      <p className="sub">
        Know a film we should add? Send it over and we&apos;ll get it in the game.
      </p>

      <div className="card">
        <span className="label">Movie title</span>
        <input
          className="input"
          style={{ marginTop: 10 }}
          placeholder="e.g. Baahubali"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <span className="label" style={{ display: "block", marginTop: 16 }}>
          Other spellings <span style={{ color: "var(--muted)", fontWeight: 500 }}>(optional)</span>
        </span>
        <input
          className="input"
          style={{ marginTop: 10 }}
          placeholder="Bahubali, Baahubali The Beginning"
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
        />
      </div>

      <div className="card">
        <span className="label">Language</span>
        <div className="chip-row" style={{ marginTop: 12 }}>
          {LANGS.map((l) => (
            <button
              key={l.id}
              className={`chip ${language === l.id ? "on" : ""}`}
              onClick={() => setLanguage(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="label">Where can we find it?</span>
        <div className="chip-row" style={{ marginTop: 12 }}>
          <button
            className={`chip ${source === "youtube" ? "on" : ""}`}
            onClick={() => setSource("youtube")}
          >
            YouTube link
          </button>
          <button
            className={`chip ${source === "screenshots" ? "on" : ""}`}
            onClick={() => setSource("screenshots")}
          >
            Screenshots
          </button>
        </div>

        {source === "youtube" ? (
          <input
            className="input"
            style={{ marginTop: 12 }}
            placeholder="https://youtube.com/watch?v=…"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
          />
        ) : (
          <textarea
            className="input"
            style={{ marginTop: 12, minHeight: 90, resize: "vertical" }}
            placeholder="Paste screenshot image URLs, one per line"
            value={shots}
            onChange={(e) => setShots(e.target.value)}
          />
        )}
      </div>

      <div className="card">
        <span className="label">Your name <span style={{ color: "var(--muted)", fontWeight: 500 }}>(optional)</span></span>
        <input
          className="input"
          style={{ marginTop: 10 }}
          placeholder="So we can credit you"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {err && <div className="notice notice-bad">{err}</div>}
      <div className="actions">
        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? "Sending…" : "Suggest this movie 🎬"}
        </button>
        <a className="btn btn-ghost" href="/" style={{ textDecoration: "none" }}>
          Cancel
        </a>
      </div>
    </div>
  );
}
