# 404: The Login You Deserve

**Live demo → https://absurd-login.vercel.app/** (tip: the `404` on the first page is the login button)

A deliberately **user-hostile** login system. It is engineered to punish anyone who tries to use it. The whole thing is the joke.

Built with Next.js (App Router), fully client-side — no backend, no database. State lives in `localStorage`; the video gate uses the raw YouTube IFrame API.

## The flow

1. **`/` — the trap.** A pixel-faithful Google *"404. That's an error."* page. The `404.` looks like plain heading text (no button, default cursor) but is secretly the login portal.
2. **Cookie ambush.** "Reject all" refuses to work; "Accept all" runs from your cursor until it gives up.
3. **Forced signup:**
   - A username + **a password you will never use** (login ignores it).
   - **Life Score quiz** — caffeine/tabs/will-to-live sliders + a "select all squares containing regret" captcha. Score must land in an arbitrary band; too well-adjusted = denied.
   - **Unskippable onboarding video** — seek, pause, mute, or switch tabs and it slams back to `0:00`. The real password flashes on screen for ~2.5s near the end.
   - **T&C trap** that yanks you back to the top, and a **reverse captcha** ("I am a robot").
   - A **Create account** button that teleports until every gate is green.
4. **Login.** Hardcoded password. Wrong once = 1 punishment video, twice = 2, thrice = 3… (punishment videos flash *fake* passwords). The counter is persisted, so refreshing doesn't save you.
5. **`/welcome` — the payoff.** A blank page: *"There was nothing here anyway."*

## Run it

```bash
npm install
npm run dev
```

- **`/login?dev`** shortens each video to ~6s so you can demo the whole gauntlet without sitting through full Rickrolls.
- Two on-brand escapes are left in as easter eggs: the password is `console.log`'d in devtools, and `?dev` exists.

## Structure

- `lib/absurd.ts` — all config + pure logic (password, decoys, life-score formula, sentence math, storage)
- `app/_components/VideoGate.tsx` — the unskippable player
- `app/_components/LifeScore.tsx` — the absurd quiz
- `app/page.tsx` / `app/login/page.tsx` / `app/welcome/page.tsx` — the pages
