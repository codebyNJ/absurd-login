"use client";

import Link from "next/link";
import { resetState } from "@/lib/absurd";

// The payoff for all that suffering: nothing.
export default function Welcome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-2xl font-medium text-[#222]">You’re in.</h1>
      <p className="mt-3 text-sm text-[#777]">There was nothing here anyway.</p>
      <Link
        href="/"
        onClick={() => resetState()}
        className="mt-8 text-xs text-[#aaa] underline underline-offset-4"
      >
        log out (and forget this ever happened)
      </Link>
    </main>
  );
}
