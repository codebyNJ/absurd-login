"use client";

import { useState } from "react";
import { lifeScore, lifeVerdict, ACCEPT_MIN, ACCEPT_MAX } from "@/lib/absurd";

const REGRET_TILES = ["🍕", "📉", "💸", "😴", "📱", "🥲", "🛒", "☎️", "🫠"];

export default function LifeScore({ onPass }: { onPass: (score: number) => void }) {
  const [caffeine, setCaffeine] = useState(3);
  const [tabs, setTabs] = useState(12);
  const [willToLive, setWillToLive] = useState(50);
  const [regretSel, setRegretSel] = useState<boolean[]>(Array(9).fill(false));
  const [passed, setPassed] = useState(false);

  const regret = regretSel.filter(Boolean).length;
  const score = lifeScore({ caffeine, tabs, regret, willToLive });
  const verdict = lifeVerdict(score);

  const message =
    verdict === "low"
      ? "Suspiciously well-adjusted. Denied."
      : verdict === "high"
        ? "Deeply alarming. Also denied."
        : "Acceptable levels of despair. Proceed.";

  if (passed) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
        Life Score locked in at <span className="font-mono font-bold">{score}</span>. Regrettable.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-neutral-300 p-4">
      <h2 className="text-lg font-semibold">Mandatory Life Score Assessment</h2>

      <label className="block text-sm">
        Caffeine intake today: <b>{caffeine}</b> mug(s)
        <input type="range" min={0} max={10} value={caffeine} onChange={(e) => setCaffeine(+e.target.value)} className="w-full" />
      </label>

      <label className="block text-sm">
        Browser tabs currently open: <b>{tabs}</b>
        <input type="range" min={0} max={50} value={tabs} onChange={(e) => setTabs(+e.target.value)} className="w-full" />
      </label>

      <label className="block text-sm">
        Will to live: <b>{willToLive}%</b>
        <input type="range" min={0} max={100} value={willToLive} onChange={(e) => setWillToLive(+e.target.value)} className="w-full" />
      </label>

      <div className="text-sm">
        <div className="mb-1">Select all squares containing regret:</div>
        <div className="grid grid-cols-3 gap-2">
          {REGRET_TILES.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRegretSel((s) => s.map((v, j) => (j === i ? !v : v)))}
              className={`flex h-14 items-center justify-center rounded border text-2xl transition ${
                regretSel[i] ? "border-blue-500 bg-blue-100" : "border-neutral-300 bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          Score: <span className="font-mono font-bold">{score}</span>{" "}
          <span className="text-neutral-500">
            (accepted band: {ACCEPT_MIN}–{ACCEPT_MAX})
          </span>
          <div className={verdict === "ok" ? "text-green-600" : "text-red-600"}>{message}</div>
        </div>
        <button
          type="button"
          disabled={verdict !== "ok"}
          onClick={() => {
            setPassed(true);
            onPass(score);
          }}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit score
        </button>
      </div>
    </div>
  );
}
