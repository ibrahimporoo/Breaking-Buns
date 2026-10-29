let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!context) {
    const Constructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!Constructor) return null;
    context = new Constructor();
  }

  return context;
}

/** Browsers only allow sound after a click, so call this from a button handler first. */
export async function unlockAlertSound(): Promise<boolean> {
  const audio = getContext();
  if (!audio) return false;

  if (audio.state === "suspended") await audio.resume();

  return audio.state === "running";
}

export function isAlertSoundReady(): boolean {
  return context?.state === "running";
}

function tone(audio: AudioContext, frequency: number, start: number, length: number) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + length + 0.05);
}

/** A friendly three-note chime so a new order is hard to miss in a busy kitchen. */
export function playNewOrderChime() {
  const audio = getContext();
  if (!audio || audio.state !== "running") return;

  const now = audio.currentTime;
  tone(audio, 784, now, 0.18);
  tone(audio, 988, now + 0.2, 0.18);
  tone(audio, 1319, now + 0.4, 0.3);
}
