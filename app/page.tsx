import Link from "next/link";

// Google-style 404. The "404" is an invisible portal to the login. Nothing hints at it.
export default function NotFoundHome() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#222] antialiased">
      <div className="mx-auto max-w-xl">
        <img
          alt=""
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='80'><g fill='none' stroke='%23bbb' stroke-width='4'><rect x='30' y='20' width='40' height='34' rx='4'/><circle cx='42' cy='37' r='4' fill='%23bbb'/><circle cx='58' cy='37' r='4' fill='%23bbb'/><line x1='40' y1='20' x2='40' y2='8'/><circle cx='40' cy='6' r='3' fill='%23bbb'/></g></svg>"
          className="mb-6 h-20 w-24 opacity-70"
        />
        {/* The invisible button: looks like plain heading text, no affordance, default cursor. */}
        <Link
          href="/login"
          className="cursor-default select-none text-3xl font-medium text-[#222] no-underline"
          draggable={false}
        >
          404.
        </Link>{" "}
        <span className="text-3xl font-normal text-[#777]">That’s an error.</span>

        <p className="mt-5 text-sm leading-6 text-[#555]">
          The requested URL <code className="text-[#c7254e]">/</code> was not found on this server.{" "}
          <span className="text-[#777]">That’s all we know.</span>
        </p>
      </div>
    </main>
  );
}
