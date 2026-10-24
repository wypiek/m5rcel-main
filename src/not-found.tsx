import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Block404 } from "@/components/clover/404-block";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Block404
        title="m5rcel"
        description={
          <>
            this page <strong>doesn&apos;t exist</strong>. maybe it wandered off into some old corner of
            the internet. head back <strong>home</strong>.
          </>
        }
        actionLabel="back home"
        href="/"
      />
    </main>
  </StrictMode>,
);
