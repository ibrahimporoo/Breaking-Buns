import Icon, { type IconName } from "@/components/ui/Icon";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: IconName;
};

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
        <Icon name={icon} className="size-5" />
      </span>
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="font-serif text-2xl text-ink">{value}</p>
      </div>
    </div>
  );
}
