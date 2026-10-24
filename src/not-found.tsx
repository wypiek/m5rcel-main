import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Starfield } from "@/components/bio/starfield";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Starfield />
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
    <div aria-hidden className="grain pointer-events-none fixed inset-0 z-30 opacity-[0.07] mix-blend-overlay" />
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[380px] rounded-[28px] border border-white/10 bg-white/[0.035] p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
        <p className="font-mono text-6xl font-semibold tracking-tight text-white [text-shadow:0_0_24px_rgba(255,255,255,0.45)]">404</p>
        <p className="mt-4 font-mono text-xs text-white/45">$ cd {location.pathname}</p>
        <p className="font-mono text-xs text-white/45">no such file or directory</p>
        <a
          href="/"
          className="mt-7 inline-flex h-10 items-center rounded-full border border-white/15 bg-white/[0.06] px-6 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.45)]"
        >
          back to m5rcel
        </a>
      </div>
    </main>
  </StrictMode>,
);
