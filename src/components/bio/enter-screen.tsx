import { useEffect, useState } from "react";
import { motion } from "motion/react";

const BOOT = [
  { text: "$ ssh guest@m5rcel.みんな", delay: 0 },
  { text: "connecting to poland... ok", delay: 420 },
  { text: "loading profile ████████████ 100%", delay: 820 },
  { text: "welcome, guest.", delay: 1250 },
];

/** "click to enter" splash with a short fake terminal boot. Clicking also unlocks audio. */
export function EnterScreen({ onEnter }: { onEnter: () => void }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const timers = BOOT.map((line, i) => setTimeout(() => setShown(i + 1), line.delay));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [onEnter]);

  const ready = shown === BOOT.length;

  return (
    <motion.button
      type="button"
      onClick={onEnter}
      aria-label="Enter site"
      className="fixed inset-0 z-40 flex cursor-pointer flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="w-[min(340px,calc(100vw-48px))] space-y-1.5 text-left font-mono text-[12px] text-white/45">
        {BOOT.slice(0, shown).map((line, i) => (
          <motion.p key={line.text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
            <span className={i === BOOT.length - 1 ? "text-white/80" : undefined}>{line.text}</span>
          </motion.p>
        ))}
      </div>

      <motion.p
        className="mt-10 font-mono text-sm tracking-[0.35em] text-white uppercase"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: [0.35, 1, 0.35] } : { opacity: 0 }}
        transition={ready ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        click to enter
      </motion.p>
    </motion.button>
  );
}
