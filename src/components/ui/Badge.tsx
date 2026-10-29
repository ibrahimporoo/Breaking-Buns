const TONES = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  accent: "bg-accent/15 text-accent",
  neutral: "bg-white/10 text-ink-muted",
} as const;

export type BadgeTone = keyof typeof TONES;

type BadgeProps = {
  tone: BadgeTone;
  children: string;
};

export default function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
