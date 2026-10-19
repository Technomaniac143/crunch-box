// Notification logic — independent from order retrieval.
// Only works while this page is open. Background/web-push is a later integration task.

let ctx: AudioContext | null = null;

/** Must be called from a user gesture once so browsers allow audio. */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx && AC) ctx = new AC();
  ctx?.resume();
}

export function playNewOrderChime() {
  if (!ctx) unlockAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  [880, 1175, 880, 1175].forEach((freq, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    const t = now + i * 0.18;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(ctx!.destination);
    o.start(t);
    o.stop(t + 0.17);
  });
  if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
}
