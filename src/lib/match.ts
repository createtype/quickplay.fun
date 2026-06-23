// Fuzzy title matching for movie guesses.

const MATCH_THRESHOLD = 0.62;

// normalize
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// levenshtein
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

// ratio
function ratio(a: string, b: string): number {
  if (!a && !b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// tokenSetRatio
function tokenSetRatio(a: string, b: string): number {
  const sortJoin = (s: string) =>
    s.split(" ").filter(Boolean).sort().join(" ");
  return ratio(sortJoin(a), sortJoin(b));
}

// bestScore
function bestScore(guess: string, candidate: string): number {
  const g = normalize(guess);
  const c = normalize(candidate);
  return Math.max(ratio(g, c), tokenSetRatio(g, c));
}

// isCorrect — checks guess against title + aliases
export function isCorrect(
  guess: string,
  title: string,
  aliases: string[] = []
): boolean {
  if (!guess.trim()) return false;
  const candidates = [title, ...aliases];
  return candidates.some((c) => bestScore(guess, c) >= MATCH_THRESHOLD);
}
