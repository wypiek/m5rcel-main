/** Dark background with drifting violet, amber and magenta light cut by diagonal shadow bands. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#07050c]">
      <div className="drift-a absolute -top-[30%] -left-[20%] size-[75vmax] rounded-full bg-[#5b21b6] opacity-55 blur-[120px]" />
      <div className="drift-b absolute -top-[35%] left-[30%] size-[55vmax] rounded-full bg-[#b45309] opacity-45 blur-[120px]" />
      <div className="drift-c absolute -right-[25%] -bottom-[35%] size-[65vmax] rounded-full bg-[#86198f] opacity-40 blur-[130px]" />
      {/* diagonal shadow bands */}
      <div className="absolute top-1/2 left-1/2 h-[46vmax] w-[220vmax] -translate-x-[40%] -translate-y-[10%] rotate-[-38deg] bg-black/80 blur-2xl" />
      <div className="absolute top-0 left-1/2 h-[18vmax] w-[220vmax] -translate-x-[55%] -translate-y-[60%] rotate-[-38deg] bg-black/60 blur-3xl" />
      <div className="grain absolute inset-0 opacity-[0.08] mix-blend-overlay" />
    </div>
  );
}
