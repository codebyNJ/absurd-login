"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import VideoGate from "@/app/_components/VideoGate";
import LifeScore from "@/app/_components/LifeScore";
import {
  SIGNUP_VIDEO,
  punishmentVideo,
  randDecoy,
  penaltyFor,
  loadState,
  saveState,
  addToBoard,
  type Saved,
} from "@/lib/absurd";

function randPos() {
  return {
    top: 20 + Math.random() * (window.innerHeight - 120),
    left: 20 + Math.random() * (window.innerWidth - 180),
  };
}

// A button that runs away until `ready`, then behaves.
function TeleportButton({
  ready,
  onClick,
  children,
}: {
  ready: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  if (ready) {
    return (
      <button onClick={onClick} className="rounded bg-black px-5 py-2 font-semibold text-white">
        {children}
      </button>
    );
  }
  return (
    <button
      onMouseEnter={() => setPos(randPos())}
      onFocus={() => setPos(randPos())}
      onClick={(e) => {
        e.preventDefault();
        setPos(randPos());
      }}
      style={pos ? { position: "fixed", top: pos.top, left: pos.left, zIndex: 50 } : undefined}
      className="rounded bg-neutral-400 px-5 py-2 font-semibold text-white"
    >
      {children}
    </button>
  );
}

export default function Gauntlet() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<Saved>({ account: null, failCount: 0, sentence: 0, videos: 0, runStart: 0 });
  const [cookiesOk, setCookiesOk] = useState(false);
  const [served, setServed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    if (!s.runStart) s.runStart = Date.now(); // start the clock the moment they enter
    saveState(s);
    setState(s);
    setMounted(true);
  }, []);

  function bumpVideos() {
    setState((prev) => {
      const next = { ...prev, videos: (prev.videos || 0) + 1 };
      saveState(next);
      return next;
    });
  }

  useEffect(() => {
    if (state.account) {
      // On brand: whisper the password to anyone who opens devtools.
      console.log("%c🤫 psst — your password is: " + state.account.password, "font-size:16px;color:#e11");
    }
  }, [state.account]);

  function persist(next: Saved) {
    setState(next);
    saveState(next);
  }
  function popToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }

  if (!mounted) return null;

  const serving = state.sentence > 0;

  return (
    <main className="relative min-h-screen bg-white px-6 py-10 text-[#222]">
      <div className="mx-auto max-w-xl space-y-6">
        {toast && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow">
            {toast}
          </div>
        )}

        {serving ? (
          <Serving
            index={served}
            total={state.sentence}
            onOne={() => {
              const last = served + 1 >= state.sentence;
              setState((prev) => {
                const next = { ...prev, videos: (prev.videos || 0) + 1, sentence: last ? 0 : prev.sentence };
                saveState(next);
                return next;
              });
              if (last) {
                setServed(0);
                popToast("Sentence served. Try again.");
              } else {
                setServed(served + 1);
              }
            }}
          />
        ) : !state.account ? (
          <Signup
            onToast={popToast}
            onVideo={bumpVideos}
            onDone={(username, password) => {
              persist({ ...state, account: { username, password }, failCount: 0, sentence: 0 });
              popToast("Account created. Now log in with the password you just set. Try to remember it.");
            }}
          />
        ) : (
          <Login
            expected={state.account?.password || ""}
            onWrong={() => {
              const failCount = state.failCount + 1;
              const sentence = penaltyFor(failCount);
              persist({ ...state, failCount, sentence });
              setServed(0);
              popToast(`Wrong. That's ${sentence} video(s).`);
            }}
            onRight={() => {
              addToBoard({
                name: state.account?.username || "anonymous",
                ms: Date.now() - (state.runStart || Date.now()),
                fails: state.failCount,
                videos: state.videos || 0,
                at: Date.now(),
              });
              router.push("/welcome");
            }}
          />
        )}
      </div>

      {!cookiesOk && <CookieBanner onAccept={() => setCookiesOk(true)} onToast={popToast} />}
    </main>
  );
}

function Serving({ index, total, onOne }: { index: number; total: number; onOne: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 pt-6">
      <h1 className="text-xl font-semibold text-red-600">Serving your sentence</h1>
      <VideoGate
        key={index}
        videoId={punishmentVideo(index)}
        reveal={randDecoy()}
        label={`Punishment video ${index + 1} of ${total}`}
        onComplete={onOne}
      />
    </div>
  );
}

function Login({ expected, onWrong, onRight }: { expected: string; onWrong: () => void; onRight: () => void }) {
  // Uncontrolled + read from the DOM on submit, so a password manager / autofill
  // that doesn't trigger React onChange can't leave us comparing a stale value.
  const ref = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const val = (ref.current?.value ?? "").trim();
        if (val.toLowerCase() === expected.trim().toLowerCase()) onRight();
        else onWrong();
      }}
      className="space-y-4 pt-6"
    >
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="text-sm text-neutral-500">Use the password you set. If you remember it.</p>
      <input
        ref={ref}
        type="password"
        name="pw"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="password"
        className="w-full rounded border border-neutral-300 px-3 py-2"
      />
      <button type="submit" className="rounded bg-black px-5 py-2 font-semibold text-white">
        Log in
      </button>
    </form>
  );
}

function Signup({
  onDone,
  onToast,
  onVideo,
}: {
  onDone: (username: string, password: string) => void;
  onToast: (m: string) => void;
  onVideo: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [lifePassed, setLifePassed] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [robot, setRobot] = useState(false);

  // T&C trap
  const tncRef = useRef<HTMLDivElement>(null);
  const bounces = useRef(0);
  const [tncBottom, setTncBottom] = useState(false);
  const [tncChecked, setTncChecked] = useState(false);

  const ready = !!username && !!password && lifePassed && videoWatched && robot && tncChecked;

  return (
    <div className="space-y-6 pt-2">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-neutral-500">Nobody has an account. That is the point.</p>

      <div className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="w-full rounded border border-neutral-300 px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="choose a password (you'll need it)"
          className="w-full rounded border border-neutral-300 px-3 py-2"
        />
      </div>

      {!lifePassed ? (
        <LifeScore onPass={() => setLifePassed(true)} />
      ) : (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Life Score accepted.
        </div>
      )}

      {lifePassed &&
        (!videoWatched ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-neutral-600">Watch this. Every second. We’ll remind you of your password once.</p>
            <VideoGate
              videoId={SIGNUP_VIDEO}
              reveal={password}
              label="Onboarding video (mandatory)"
              onComplete={() => {
                setVideoWatched(true);
                onVideo();
              }}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            Onboarding complete. Hope you were paying attention.
          </div>
        ))}

      {videoWatched && (
        <>
          {/* T&C trap: scroll to the bottom, except it keeps yanking you back up. */}
          <div className="space-y-2">
            <div
              ref={tncRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 6) {
                  if (bounces.current < 3) {
                    bounces.current += 1;
                    el.scrollTop = 0;
                    onToast("Read it again.");
                  } else {
                    setTncBottom(true);
                  }
                }
              }}
              className="h-32 overflow-y-scroll rounded border border-neutral-300 p-3 text-xs text-neutral-500"
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <p key={i} className="mb-2">
                  {i + 1}. By continuing you forfeit your time, your patience, and any lingering
                  belief that software respects you. This clause is identical to the previous one and
                  the next one. Keep scrolling.
                </p>
              ))}
              <p className="font-semibold text-neutral-700">You reached the bottom. Congratulations, nobody cares.</p>
            </div>
            <label className={`flex items-center gap-2 text-sm ${tncBottom ? "" : "opacity-40"}`}>
              <input
                type="checkbox"
                disabled={!tncBottom}
                checked={tncChecked}
                onChange={(e) => setTncChecked(e.target.checked)}
              />
              I have read all zero words I retained of the Terms.
            </label>
          </div>

          {/* Reverse captcha */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={robot} onChange={(e) => setRobot(e.target.checked)} />
            To continue, confirm: <b>I am a robot.</b> 🤖
          </label>
        </>
      )}

      <div className="pt-2">
        <TeleportButton ready={ready} onClick={() => onDone(username, password)}>
          Create account
        </TeleportButton>
        {!ready && <p className="mt-2 text-xs text-neutral-400">Finish everything above. The button is shy.</p>}
      </div>
    </div>
  );
}

function CookieBanner({ onAccept, onToast }: { onAccept: () => void; onToast: (m: string) => void }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const dodges = useRef(0);
  const [caught, setCaught] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-neutral-300 bg-neutral-100 px-6 py-4 text-sm">
      <span>🍪 We use every cookie imaginable. Consent is mandatory.</span>
      <div className="flex gap-2">
        <button
          onClick={() => onToast("Rejecting is not one of your options.")}
          className="rounded border border-neutral-400 px-3 py-1"
        >
          Reject all
        </button>
        <button
          onMouseEnter={() => {
            if (!caught) {
              dodges.current += 1;
              if (dodges.current >= 5) setCaught(true);
              else setPos(randPos());
            }
          }}
          onClick={onAccept}
          style={pos && !caught ? { position: "fixed", top: pos.top, left: pos.left, zIndex: 50 } : undefined}
          className="rounded bg-black px-3 py-1 font-semibold text-white"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
