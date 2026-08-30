// The one place all the cruelty is configured. No backend, no DB — just spite.

// The ONE true password. Revealed only via an overlay near the end of the signup video.
// (Also whispered in the console for anyone who opens devtools. On brand.)
export const PASSWORD = "hunter2";

// Fake passwords flashed during punishment videos to send you down the wrong path.
export const DECOYS = [
  "password",
  "letmein",
  "admin",
  "trustno1",
  "iloveyou",
  "correcthorse",
  "qwerty",
  "hunter3", // so close
];

// ponytail: one known-good embeddable video (the Rickroll). Add more IDs to vary the suffering.
export const SIGNUP_VIDEO = "dQw4w9WgXcQ";
export const PUNISHMENT_VIDEOS = ["dQw4w9WgXcQ"];

export function randDecoy(): string {
  return DECOYS[Math.floor(Math.random() * DECOYS.length)];
}

export function punishmentVideo(index: number): string {
  return PUNISHMENT_VIDEOS[index % PUNISHMENT_VIDEOS.length];
}

// ---- Life Score: a nonsense metric you must land inside an arbitrary band ----

export interface LifeAnswers {
  caffeine: number; // 0-10 mugs
  tabs: number; // 0-50 browser tabs open
  regret: number; // 0-9 squares of regret selected
  willToLive: number; // 0-100 %
}

// Deterministic gibberish. More will-to-live drops your score, so being well-adjusted
// gets you rejected for being suspicious.
export function lifeScore(a: LifeAnswers): number {
  return Math.round((a.caffeine * 3 + a.tabs * 2 + a.regret * 4) / (a.willToLive + 1));
}

export const ACCEPT_MIN = 7;
export const ACCEPT_MAX = 20;

export type Verdict = "low" | "ok" | "high";
export function lifeVerdict(score: number): Verdict {
  if (score < ACCEPT_MIN) return "low";
  if (score > ACCEPT_MAX) return "high";
  return "ok";
}

// ---- Sentence math: wrong once => 1 video, twice => 2 videos, ... ----
export function penaltyFor(failCount: number): number {
  return failCount;
}

// ---- Persistence (survives refresh, so refreshing never saves you) ----

export interface Saved {
  account: { username: string } | null;
  failCount: number;
  sentence: number;
  videos: number; // total videos endured this run
  runStart: number; // ms timestamp when they entered the gauntlet
}

const KEY = "absurd:v1";
const DEFAULTS: Saved = { account: null, failCount: 0, sentence: 0, videos: 0, runStart: 0 };

export function loadState(): Saved {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveState(s: Saved): void {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

// ---- Leaderboard: the Hall of Shame (local to this browser — one booth laptop) ----

export interface LeaderRow {
  name: string;
  ms: number; // time to escape
  fails: number; // wrong password guesses
  videos: number; // videos endured
  at: number; // finished-at timestamp
}

export const BOARD_KEY = "absurd:leaderboard";
const LAST_KEY = "absurd:lastrun";

export function loadBoard(): LeaderRow[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToBoard(row: LeaderRow): void {
  if (typeof window === "undefined") return;
  const board = loadBoard();
  board.push(row);
  localStorage.setItem(BOARD_KEY, JSON.stringify(board));
  localStorage.setItem(LAST_KEY, JSON.stringify(row));
}

export function clearBoard(): void {
  if (typeof window !== "undefined") localStorage.removeItem(BOARD_KEY);
}

export function getLastRun(): LeaderRow | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(LAST_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function fmtTime(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
