import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Backdrop } from "@/components/bio/backdrop";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Backdrop />
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[400px] rounded-[26px] border border-white/10 bg-black/30 p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <p className="text-7xl font-bold tracking-tight text-white [text-shadow:0_0_26px_rgba(255,255,255,0.45)]">404</p>
        <p className="mt-3 text-[15px] font-medium text-white/70">this page wandered off somewhere.</p>
        <a
          href="/"
          className="mt-7 inline-flex h-10 items-center rounded-full border border-white/15 bg-white/[0.08] px-6 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.45)]"
        >
          back to m5rcel
        </a>
      </div>
    </main>
  </StrictMode>,
);
