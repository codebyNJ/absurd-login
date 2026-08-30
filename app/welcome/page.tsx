"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLastRun, resetState, fmtTime, type LeaderRow } from "@/lib/absurd";

// The payoff: nothing — plus a printable trophy for your suffering.
export default function Welcome() {
  const [run, setRun] = useState<LeaderRow | null>(null);
  useEffect(() => setRun(getLastRun()), []);

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-[#222]">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-medium print:hidden">You’re in.</h1>
        <p className="mt-2 text-sm text-[#777] print:hidden">There was nothing here anyway.</p>

        {/* Certificate — the only thing that prints */}
        <div className="mx-auto mt-8 max-w-md border-4 border-double border-neutral-800 p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Certificate of Suffering</div>
          <div className="mt-4 text-base">This certifies that</div>
          <div className="mt-1 text-2xl font-bold">{run?.name || "a nameless victim"}</div>
          <div className="mt-3 text-sm leading-6">
            successfully logged in after enduring <b>{run?.videos ?? 0}</b> video(s) and{" "}
            <b>{run?.fails ?? 0}</b> failed attempt(s), in a grueling{" "}
            <b>{run ? fmtTime(run.ms) : "—"}</b>.
          </div>
          <div className="mt-6 text-xs text-neutral-500">
            They will never forget their password. That was the point.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm print:hidden">
          <button onClick={() => window.print()} className="rounded bg-black px-4 py-2 font-semibold text-white">
            Print your certificate
          </button>
          <Link href="/leaderboard" className="rounded border border-neutral-300 px-4 py-2">
            Hall of Shame
          </Link>
          <Link href="/" onClick={() => resetState()} className="rounded border border-neutral-300 px-4 py-2">
            New victim (log out)
          </Link>
        </div>
      </div>
    </main>
  );
}
