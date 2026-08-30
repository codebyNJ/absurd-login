"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBoard, clearBoard, resetState, fmtTime, type LeaderRow } from "@/lib/absurd";

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderRow[]>([]);

  useEffect(() => {
    const refresh = () => setRows(loadBoard());
    refresh();
    window.addEventListener("storage", refresh); // updates when the demo runs in another tab
    const id = window.setInterval(refresh, 1500); // and same-tab
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(id);
    };
  }, []);

  const sorted = [...rows].sort((a, b) => a.ms - b.ms);
  const mostPunished = rows.reduce<LeaderRow | null>((m, r) => (!m || r.videos > m.videos ? r : m), null);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">🏆 Hall of Shame</h1>
        <p className="mt-1 text-sm text-neutral-400">Those who escaped the login. Fastest suffering on top.</p>

        {sorted.length === 0 ? (
          <p className="mt-10 text-center text-neutral-500">No survivors yet. Send in a victim.</p>
        ) : (
          <table className="mt-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-700 text-left text-neutral-400">
                <th className="py-2">#</th>
                <th className="py-2">Name</th>
                <th className="py-2">Escape time</th>
                <th className="py-2">Wrong guesses</th>
                <th className="py-2">Videos endured</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.at} className={`border-b border-neutral-800 ${i === 0 ? "text-yellow-300" : ""}`}>
                  <td className="py-2 font-mono">{i + 1}</td>
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2 font-mono">{fmtTime(r.ms)}</td>
                  <td className="py-2 font-mono">{r.fails}</td>
                  <td className="py-2 font-mono">{r.videos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {mostPunished && mostPunished.videos > 0 && (
          <p className="mt-4 text-sm text-red-400">
            Most punished: <b>{mostPunished.name}</b> endured {mostPunished.videos} video(s). We’re sorry.
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="rounded bg-white px-4 py-2 font-semibold text-black">
            Send in a new victim
          </Link>
          <button
            onClick={() => {
              resetState();
              window.location.href = "/";
            }}
            className="rounded border border-neutral-600 px-4 py-2"
          >
            Reset current player
          </button>
          <button
            onClick={() => {
              if (confirm("Wipe the entire Hall of Shame?")) {
                clearBoard();
                setRows([]);
              }
            }}
            className="rounded border border-red-800 px-4 py-2 text-red-300"
          >
            Reset board
          </button>
        </div>
      </div>
    </main>
  );
}
