# Tailwind CSS v4 guidelines for this project

Follow these rules in every component. They match the Tailwind IntelliSense "canonical class" and "CSS conflict" checks.

## 1. Use canonical class forms

Tailwind v4 accepts any number or fraction, so arbitrary values are only for things the scale cannot express.

| Avoid | Use |
| --- | --- |
| `w-[75%]`, `h-[83.33%]` | `w-3/4`, `h-5/6` (fractions) |
| `min-h-[26rem]`, `max-w-[22rem]` | `min-h-104`, `max-w-88` (1 unit = 0.25rem) |
| `h-[3px]`, `size-[18px]` | `h-0.75`, `size-4.5` |
| `z-[60]` | `z-60` |
| `aspect-[5/4]` | `aspect-5/4` |
| `ring-[10px]` | `ring-10` |
| `duration-[2s]` | `duration-2000` |
| `border-white/[0.04]` | `border-white/4` |
| `outline-none` (to hide focus rings) | `outline-hidden` |
| `[scrollbar-width:none]` | `scrollbar-none` |
| `bg-gradient-to-r`, `flex-shrink-0` | `bg-linear-to-r`, `shrink-0` |

Arbitrary values stay only when no scale value exists (for example `text-[2.9rem]`, `grid-cols-[16rem_1fr]`, `w-[calc(100%-1.5rem)]`).

## 2. Never put two utilities for the same property on one element

`cn()` joins strings; it does not resolve conflicts. A later class does not reliably win.

- Wrong: `className="pt-20"` plus `className="pt-0"`, or `h-11` plus `h-9`.
- Right: give the component a prop (`flushTop`, `size="sm"`) and pick the class with a ternary or a lookup table.
- Do not pass layout or display classes from outside when the component already sets that property (wrap it in a `div` instead).
- Colors that change by state use a ternary: `error ? "border-danger/70" : "border-white/10"`.

## 3. Colors and shadows come from theme tokens

All brand values live in `@theme` in `src/app/globals.css` (`canvas`, `surface`, `accent`, `ink`, `line`, `plate`, `danger`, `star`, `paper-*`, shadows `accent`, `plate`, `hero`, `form`). Never write a hex color or a raw box-shadow in a component. If a new color is needed, add a token first.

## 4. Other habits

- Mobile first: base classes are for mobile, add `sm:`, `lg:`, `xl:` upwards.
- Keep class lists in a stable order: layout, box, typography, color, effects, state variants.
- Repeated class groups become a component or a constant in `src/components/ui/styles.ts`.
