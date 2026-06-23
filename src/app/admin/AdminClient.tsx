"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type AdminMovie = {
  id: string;
  title: string;
  aliases: string[] | null;
  language: string;
  clip: string;
  status: string | null;
  youtube_url: string | null;
  screenshots: string[] | null;
};

const isPlaceholder = (clip: string) => !clip || clip.startsWith("#");

// AdminClient — read-only clip/movie verification (dev only)
export default function AdminClient() {
  const [movies, setMovies] = useState<AdminMovie[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("all");
  const [status, setStatus] = useState("all");
  const [clip, setClip] = useState("all"); // all | has | placeholder

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setErr("Supabase not configured (check dev/web/.env.local).");
      setMovies([]);
      return;
    }
    sb.from("movies")
      .select("*")
      .order("status", { ascending: true })
      .order("title", { ascending: true })
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setMovies((data as AdminMovie[]) || []);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!movies) return [];
    return movies.filter((m) => {
      if (lang !== "all" && m.language !== lang) return false;
      if (status !== "all" && (m.status || "") !== status) return false;
      if (clip === "has" && isPlaceholder(m.clip)) return false;
      if (clip === "placeholder" && !isPlaceholder(m.clip)) return false;
      if (q) {
        const hay = `${m.title} ${m.id} ${(m.aliases || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [movies, q, lang, status, clip]);

  const counts = useMemo(() => {
    const all = movies || [];
    return {
      total: all.length,
      withClip: all.filter((m) => !isPlaceholder(m.clip)).length,
      pending: all.filter((m) => m.status === "pending").length,
    };
  }, [movies]);

  return (
    <>
      <h1 className="h1">Clip <em>check</em> 🛠️</h1>
      <p className="sub">
        Dev-only. {counts.total} movies · {counts.withClip} with real clips · {counts.pending} pending.
      </p>

      {err && <div className="notice notice-bad">{err}</div>}

      <div className="card">
        <input
          className="input"
          placeholder="Search title, id, alias…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="chip-row" style={{ marginTop: 12 }}>
          {["all", "hindi", "tamil", "malayalam"].map((l) => (
            <button key={l} className={`chip ${lang === l ? "on" : ""}`} onClick={() => setLang(l)}>
              {l === "all" ? "All langs" : l}
            </button>
          ))}
        </div>
        <div className="chip-row" style={{ marginTop: 10 }}>
          {["all", "approved", "pending"].map((s) => (
            <button key={s} className={`chip ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>
              {s === "all" ? "Any status" : s}
            </button>
          ))}
        </div>
        <div className="chip-row" style={{ marginTop: 10 }}>
          {[
            { id: "all", label: "Any clip" },
            { id: "has", label: "Has clip" },
            { id: "placeholder", label: "Placeholder only" },
          ].map((c) => (
            <button key={c.id} className={`chip ${clip === c.id ? "on" : ""}`} onClick={() => setClip(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {movies === null && <div className="card">Loading movies…</div>}
      {movies !== null && filtered.length === 0 && (
        <div className="card">No movies match.</div>
      )}

      {filtered.map((m) => (
        <div className="card" key={m.id}>
          {isPlaceholder(m.clip) ? (
            <div className="clip" style={{ background: m.clip || "#222" }}>
              no clip yet
            </div>
          ) : (
            <video
              className="clip"
              src={m.clip}
              controls
              muted
              playsInline
              preload="metadata"
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <span className="label" style={{ fontSize: 18 }}>{m.title}</span>
            <span className={m.status === "approved" ? "tag-ok" : "sub"}>{m.status || "—"}</span>
          </div>

          <div className="admin-meta">
            <div><span className="k">id</span> {m.id}</div>
            <div><span className="k">language</span> {m.language}</div>
            <div><span className="k">aliases</span> {(m.aliases || []).join(", ") || "—"}</div>
            <div>
              <span className="k">youtube</span>{" "}
              {m.youtube_url ? (
                <a className="link" href={m.youtube_url} target="_blank" rel="noreferrer">
                  {m.youtube_url}
                </a>
              ) : (
                "—"
              )}
            </div>
            {m.screenshots && m.screenshots.length > 0 && (
              <div><span className="k">screenshots</span> {m.screenshots.length}</div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
