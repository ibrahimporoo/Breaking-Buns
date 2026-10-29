import Icon from "@/components/ui/Icon";
import { MAX_QUANTITY } from "@/lib/cart";

type QuantityStepperProps = {
  name: string;
  quantity: number;
  onChange: (quantity: number) => void;
};

const buttonClass =
  "flex size-8 items-center justify-center rounded-full border border-white/15 text-ink transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40";

export default function QuantityStepper({ name, quantity, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={`Remove one ${name}`}
        className={buttonClass}
      >
        <Icon name={quantity === 1 ? "trash" : "minus"} className="size-4" />
      </button>
      <span className="min-w-5 text-center text-sm font-medium text-ink" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        aria-label={`Add one more ${name}`}
        className={buttonClass}
      >
        <Icon name="plus" className="size-4" />
      </button>
    </div>
  );
}
