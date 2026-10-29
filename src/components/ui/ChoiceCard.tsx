import Icon, { type IconName } from "@/components/ui/Icon";

type ChoiceCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description: string;
  icon: IconName;
  disabled?: boolean;
  disabledReason?: string;
};

export default function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  disabled = false,
  disabledReason,
}: ChoiceCardProps) {
  return (
    <label
      className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
        checked ? "border-accent bg-accent/10" : "border-white/10 hover:border-white/25"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          checked ? "bg-accent text-white" : "bg-white/6 text-ink"
        }`}
      >
        <Icon name={icon} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-serif text-lg text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-muted">
          {disabled && disabledReason ? disabledReason : description}
        </span>
      </span>
    </label>
  );
}
