"use client";

import { useEffect, useRef, useState } from "react";
import { isCorrect } from "@/lib/match";
import type { Movie } from "@/data/movies";

export type Outcome = { title: string; guess: string; correct: boolean; clip: string };

// Fixed for all users.
export const ROUND_SECONDS = 20;
const CLIP_MS = 1200; // show the 1s clip (+ small buffer) before the answer screen
const LOAD_TIMEOUT_MS = 6000; // give up waiting for buffer, play anyway

type Phase = "loading" | "ready" | "clip" | "answer";

const isPlaceholder = (clip: string) => clip.startsWith("#");

// GameRounds — quiz-style round loop for solo + friends
export default function GameRounds({
  movies,
  onFinish,
}: {
  movies: Movie[];
  onFinish: (outcomes: Outcome[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [count, setCount] = useState(3);
  const [loaded, setLoaded] = useState(false);
  const [guess, setGuess] = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [clipBlocked, setClipBlocked] = useState(false); // autoplay denied (Low Power Mode)
  const outcomes = useRef<Outcome[]>([]);
  const clipRef = useRef<HTMLVideoElement>(null);

  const current = movies[index];

  function advance(correct: boolean) {
    const movie = movies[index];
    outcomes.current.push({ title: movie.title, guess: guess.trim(), correct, clip: movie.clip });
    if (index + 1 >= movies.length) {
      onFinish(outcomes.current);
    } else {
      setIndex((i) => i + 1);
      setGuess("");
      setTimeLeft(ROUND_SECONDS);
      setCount(3);
      setLoaded(false);
      setClipBlocked(false);
      setPhase("loading"); // each round: load → countdown → clip
    }
  }

  function submit() {
    if (!current) return;
    advance(isCorrect(guess, current.title, current.aliases));
  }

  // anti-cheat: block context menu during gameplay
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  // LOADING: preload this round's clip, then start the countdown.
  // Placeholder clips have nothing to buffer; a timeout guards a stalled network.
  useEffect(() => {
    if (phase !== "loading" || !current) return;
    if (isPlaceholder(current.clip)) {
      setLoaded(true);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setLoaded(true);
    };
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.playsInline = true;
    v.src = current.clip;
    v.addEventListener("canplaythrough", finish, { once: true });
    v.load();
    // Register playback intent within the start-tap gesture window so later
    // programmatic .play() on the clip is allowed even without a fresh tap.
    v.play().then(() => v.pause()).catch(() => {});
    const timer = setTimeout(finish, LOAD_TIMEOUT_MS);
    return () => {
      done = true;
      clearTimeout(timer);
      v.removeEventListener("canplaythrough", finish);
      v.src = "";
    };
  }, [phase, index, current]);

  // Move loading → ready once the clip is buffered.
  useEffect(() => {
    if (phase === "loading" && loaded) setPhase("ready");
  }, [phase, loaded]);

  // READY countdown (every round): 3 → 2 → 1 → GO. Ticks on count alone so a
  // re-render mid-countdown can't restart the timer (no double-flash).
  useEffect(() => {
    if (phase !== "ready" || count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  // Leave the ready screen at GO.
  useEffect(() => {
    if (phase === "ready" && count <= 0) setPhase("clip");
  }, [phase, count]);

  // clip phase → answer phase after the clip plays. Keyed on index so each
  // round gets one fresh CLIP_MS timer. Skipped while clipBlocked (autoplay
  // denied) so the clip waits for the tap instead of auto-advancing unseen.
  useEffect(() => {
    if (phase !== "clip" || !current || clipBlocked) return;
    const t = setTimeout(() => setPhase("answer"), CLIP_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, clipBlocked]);

  // Explicitly play each clip (the autoPlay attribute is unreliable on mobile).
  // If play is rejected (iOS Low Power Mode blocks autoplay), flag it so we show
  // a tap-to-reveal prompt instead of a broken-looking play button.
  useEffect(() => {
    if (phase !== "clip") return;
    const p = clipRef.current?.play();
    if (p && typeof p.then === "function") {
      p.catch(() => setClipBlocked(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  // playClip — used by the tap-to-reveal fallback
  function playClip() {
    setClipBlocked(false);
    clipRef.current?.play().catch(() => {});
  }

  // countdown — only runs in the answer phase
  useEffect(() => {
    if (phase !== "answer" || !current) return;
    if (timeLeft <= 0) {
      advance(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, current]);

  // LOADING PHASE — buffer the clip before the countdown (every round).
  if (phase === "loading") {
    return (
      <div className="ready-screen enter">
        <p className="ready-title">Loading clip… 🎬</p>
        <p className="ready-sub">Getting clip {index + 1} of {movies.length} ready.</p>
        <div className="ready-stage">
          <div className="ready-disc">
            <div className="loader-ring" aria-label="Loading" />
          </div>
        </div>
      </div>
    );
  }

  // READY PHASE — arcade get-ready countdown (every round).
  if (phase === "ready") {
    return (
      <div className="ready-screen enter">
        <p className="ready-title">Get ready! 🎬</p>
        <p className="ready-sub">Each clip flashes for just 1 second. Watch closely.</p>
        <div className="ready-stage">
          <div className="ready-disc">
            <div
              key={count}
              className={`ready-count ${count <= 0 ? "go" : ""}`}
            >
              {count > 0 ? count : "GO!"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  // CLIP PHASE — just the clip, full focus, no input
  if (phase === "clip") {
    return (
      <div className="enter">
        <p className="progress">
          🎬 Clip {index + 1} of {movies.length}
        </p>
        <p className="watch-cue">Watch closely… 👀</p>
        {isPlaceholder(current.clip) ? (
          <div className="clip" style={{ background: current.clip }}>
            1-sec clip
          </div>
        ) : (
          <div className="clip-wrap">
            <video
              ref={clipRef}
              key={current.id}
              className="clip"
              src={current.clip}
              autoPlay
              muted
              playsInline
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
            />
            {clipBlocked && (
              <button className="clip-reveal" onClick={playClip}>
                <span className="clip-reveal-emoji">👆</span>
                Tap to reveal the clip
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ANSWER PHASE — clip gone, type the guess
  const low = timeLeft <= 5;
  return (
    <div className="enter">
      <p className="progress">
        🎬 Clip {index + 1} of {movies.length}
      </p>
      <div className="timer">
        <span>{timeLeft}s</span>
        <span className="timer-bar">
          <span
            className={`timer-fill ${low ? "low" : ""}`}
            style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
          />
        </span>
      </div>
      <div className="answer-prompt">Which movie was that? 🎬</div>
      <input
        className="input"
        placeholder="Type the movie name…"
        value={guess}
        autoFocus
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <button className="btn btn-primary" onClick={submit}>
        Submit guess
      </button>
      <button className="btn btn-ghost" onClick={() => advance(false)}>
        Skip
      </button>
    </div>
  );
}
