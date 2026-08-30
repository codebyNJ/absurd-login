"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load the IFrame API once, shared across gates.
let ytReady: Promise<any> | null = null;
function loadYT(): Promise<any> {
  if (ytReady) return ytReady;
  ytReady = new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytReady;
}

// ponytail: dev bypass so nobody has to demo three full Rickrolls. Append ?dev to the URL.
function isDev(): boolean {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).has("dev");
}

export default function VideoGate({
  videoId,
  reveal,
  label,
  onComplete,
}: {
  videoId: string;
  reveal: string; // password (real or decoy) flashed near the end
  label: string;
  onComplete: () => void;
}) {
  const holderId = useRef(`yt-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef<any>(null);
  const progressRef = useRef(0); // furthest legit seconds watched
  const guardUntilRef = useRef(0); // ignore state events briefly after a reset
  const flashedRef = useRef(false);
  const doneRef = useRef(false);
  const startedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [pct, setPct] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  function popToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600);
  }

  function hardReset(reason: string) {
    const p = playerRef.current;
    if (!p) return;
    guardUntilRef.current = Date.now() + 1200;
    progressRef.current = 0;
    setPct(0);
    p.seekTo(0, true);
    p.playVideo();
    popToast(reason);
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }

  useEffect(() => {
    let poll: number | undefined;
    let cancelled = false;

    loadYT().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(holderId.current, {
        videoId,
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, fs: 0, playsinline: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: any) => {
            if (Date.now() < guardUntilRef.current) return;
            if (e.data === YT.PlayerState.ENDED) return finish();
            if (e.data === YT.PlayerState.PAUSED && startedRef.current) hardReset("Paused? Back to the start.");
          },
        },
      });
    });

    poll = window.setInterval(() => {
      const p = playerRef.current;
      if (!p || !startedRef.current || doneRef.current) return;
      if (typeof p.getCurrentTime !== "function") return;

      const dur = p.getDuration?.() || 0;
      const t = p.getCurrentTime?.() || 0;
      const required = isDev() ? Math.min(6, Math.max(1, dur - 1)) : Math.max(1, dur - 1.5);

      // Muting the player counts as cheating.
      if (p.isMuted?.() || p.getVolume?.() === 0) {
        hardReset("Unmute it. From the top.");
        return;
      }
      // Seeking ahead counts as cheating.
      if (t > progressRef.current + 1.5) {
        hardReset("No skipping. From the top.");
        return;
      }
      progressRef.current = Math.max(progressRef.current, t);
      setPct(dur ? Math.min(100, (progressRef.current / dur) * 100) : 0);

      // Flash the "password" near the end, once.
      if (!flashedRef.current && dur && progressRef.current >= dur * 0.8) {
        flashedRef.current = true;
        setFlash(true);
        window.setTimeout(() => setFlash(false), 2600);
      }

      if (progressRef.current >= required) finish();
    }, 350);

    const onHidden = () => {
      if (document.hidden && startedRef.current && !doneRef.current) hardReset("Left the tab? From the top.");
    };
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onHidden);
      try {
        playerRef.current?.destroy?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  function begin() {
    const p = playerRef.current;
    if (!p) return;
    startedRef.current = true;
    p.unMute?.();
    p.setVolume?.(100);
    p.playVideo?.();
    setStarted(true);
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-2 text-sm font-medium text-neutral-500">{label}</div>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <div id={holderId.current} className="absolute inset-0 h-full w-full" />

        {/* Transparent shield: blocks all clicks so they can't pause/seek the player. */}
        <div className="absolute inset-0 z-10 cursor-not-allowed" />

        {/* Start gate (user gesture so audio is allowed). */}
        {!started && (
          <button
            onClick={begin}
            disabled={!ready}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 text-lg font-semibold text-white disabled:cursor-wait disabled:opacity-70"
          >
            {ready ? "▶ Begin your sentence" : "loading…"}
          </button>
        )}

        {/* The flashed "password". */}
        {flash && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded bg-black/70 px-4 py-2 text-center text-white">
              <div className="text-xs uppercase tracking-widest text-neutral-300">🤫 the password is</div>
              <div className="font-mono text-2xl">{reveal}</div>
            </div>
          </div>
        )}

        {/* Toast. */}
        {toast && (
          <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow">
            {toast}
          </div>
        )}

        {/* Progress bar. */}
        <div className="absolute bottom-0 left-0 z-20 h-1.5 w-full bg-white/20">
          <div className="h-full bg-red-500 transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-neutral-400">
        Seeking, pausing, muting, or leaving the tab restarts it.
      </div>
    </div>
  );
}
