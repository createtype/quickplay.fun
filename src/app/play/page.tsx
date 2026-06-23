"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pickRounds, type Language, type Movie } from "@/data/movies";
import GameRounds, { type Outcome } from "@/app/GameRounds";

const ROUND_COUNT = 4; // solo is fixed at 4

// Solo — play a random set, then go to result
function Solo() {
  const router = useRouter();
  const params = useSearchParams();

  const langs = useMemo(
    () => (params.get("langs") || "").split(",").filter(Boolean) as Language[],
    [params]
  );
  const [movies, setMovies] = useState<Movie[] | null>(null);

  // load random round set
  useEffect(() => {
    if (langs.length === 0) {
      setMovies([]);
      return;
    }
    pickRounds(langs, ROUND_COUNT).then(setMovies);
  }, [langs]);

  function finish(outcomes: Outcome[]) {
    sessionStorage.setItem("qp_outcomes", JSON.stringify(outcomes));
    router.push("/result");
  }

  // Empty/error states (only once we know the fetch result, not while loading).
  if (langs.length === 0 || (movies !== null && movies.length === 0)) {
    return (
      <div className="card enter">
        <span className="label">No clips found 🎬</span>
        <p className="sub" style={{ margin: "8px 0 14px" }}>
          Go back and pick a language to play.
        </p>
        <a className="btn btn-primary" href="/" style={{ textDecoration: "none" }}>
          ← Home
        </a>
      </div>
    );
  }

  // Render immediately: the 3-2-1 countdown plays while movies load,
  // so there's no separate "loading" screen. movies?? [] keeps it loading
  // (GameRounds holds at "GO!") until they arrive.
  return <GameRounds movies={movies ?? []} onFinish={finish} />;
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <Solo />
    </Suspense>
  );
}
