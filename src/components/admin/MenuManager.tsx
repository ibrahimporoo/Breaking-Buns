"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  deleteMenuItemAction,
  renameCategoryAction,
  saveMenuItemAction,
  toggleCategoryAction,
  toggleItemAvailabilityAction,
  type MenuItemFormInput,
} from "@/app/actions/menu";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import TextAreaField from "@/components/ui/TextAreaField";
import TextField from "@/components/ui/TextField";
import Toggle from "@/components/ui/Toggle";
import { formatMoney } from "@/lib/format";
import { centsToInput } from "@/lib/money";

export type AdminCategory = { id: string; name: string; isActive: boolean };

export type AdminItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
};

type Editor = { mode: "new"; categoryId: string } | { mode: "edit"; item: AdminItem };

type Run = (task: () => Promise<{ ok: boolean; error?: string }>) => void;

const selectClass =
  "mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/4 px-3.5 text-sm text-ink focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent/25";

type ItemEditorProps = {
  editor: Editor;
  categories: readonly AdminCategory[];
  run: Run;
  busy: boolean;
  onClose: () => void;
};

function ItemEditor({ editor, categories, run, busy, onClose }: ItemEditorProps) {
  const existing = editor.mode === "edit" ? editor.item : null;
  const [categoryId, setCategoryId] = useState(
    existing?.categoryId ?? (editor.mode === "new" ? editor.categoryId : ""),
  );
  const [isAvailable, setAvailable] = useState(existing?.isAvailable ?? true);
  const [isFeatured, setFeatured] = useState(existing?.isFeatured ?? false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: MenuItemFormInput = {
      id: existing?.id,
      categoryId,
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      price: String(data.get("price") ?? ""),
      imageUrl: String(data.get("imageUrl") ?? ""),
      isAvailable,
      isFeatured,
    };

    run(async () => {
      const result = await saveMenuItemAction(input);
      if (result.ok) onClose();
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-accent/40 bg-surface p-5">
      <h3 className="font-serif text-xl text-ink">{existing ? "Edit dish" : "Add a dish"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="name" label="Name" defaultValue={existing?.name} required />
        <TextField
          id="price"
          label="Price (USD)"
          inputMode="decimal"
          defaultValue={existing ? centsToInput(existing.priceCents) : ""}
          placeholder="11.99"
          required
        />
      </div>
      <TextAreaField id="description" label="Description" defaultValue={existing?.description} />
      <TextField
        id="imageUrl"
        label="Photo link (https://…)"
        defaultValue={existing?.imageUrl ?? ""}
        placeholder="https://"
      />
      <div>
        <label htmlFor="item-category" className="block text-sm font-medium text-ink/85">
          Category
        </label>
        <select
          id="item-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className={selectClass}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id} className="bg-surface">
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <Toggle
        id="available"
        label="Available to order"
        description="Turn off when the dish is sold out."
        checked={isAvailable}
        onChange={setAvailable}
      />
      <Toggle
        id="featured"
        label="Show on the home page"
        description="Featured dishes appear in the home page carousel."
        checked={isFeatured}
        onChange={setFeatured}
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save dish"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function MenuManager({
  categories,
  items,
}: {
  categories: readonly AdminCategory[];
  items: readonly AdminItem[];
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const run: Run = (task) => {
    setError("");
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      router.refresh();
    });
  };

  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("category") ?? "");

    run(async () => {
      const result = await createCategoryAction(name);
      if (result.ok) form.reset();
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    });
  };

  const rename = (category: AdminCategory) => {
    const name = window.prompt("New category name", category.name);
    if (!name || name === category.name) return;

    run(async () => {
      const result = await renameCategoryAction(category.id, name);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={addCategory} className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <TextField id="category" label="New category" placeholder="e.g. Shakes" />
        </div>
        <Button type="submit" disabled={isPending}>
          Add category
        </Button>
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.categoryId === category.id);

        return (
          <section key={category.id} aria-labelledby={`cat-${category.id}`} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id={`cat-${category.id}`} className="flex items-center gap-3 font-serif text-2xl text-ink">
                {category.name}
                {!category.isActive && <Badge tone="neutral">Hidden</Badge>}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setEditor({ mode: "new", categoryId: category.id })}>
                  Add dish
                </Button>
                <Button size="sm" variant="outline" onClick={() => rename(category)}>
                  Rename
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    run(async () => {
                      const result = await toggleCategoryAction(category.id, !category.isActive);
                      return result.ok ? { ok: true } : { ok: false, error: result.error };
                    })
                  }
                >
                  {category.isActive ? "Hide" : "Show"}
                </Button>
                {categoryItems.length === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() =>
                      run(async () => {
                        const result = await deleteCategoryAction(category.id);
                        return result.ok ? { ok: true } : { ok: false, error: result.error };
                      })
                    }
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {editor?.mode === "new" && editor.categoryId === category.id && (
              <ItemEditor
                key="new"
                editor={editor}
                categories={categories}
                run={run}
                busy={isPending}
                onClose={() => setEditor(null)}
              />
            )}

            <ul className="space-y-3">
              {categoryItems.map((item) =>
                editor?.mode === "edit" && editor.item.id === item.id ? (
                  <li key={item.id}>
                    <ItemEditor
                      editor={editor}
                      categories={categories}
                      run={run}
                      busy={isPending}
                      onClose={() => setEditor(null)}
                    />
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-plate">
                      {item.imageUrl && (
                        <SafeImage src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-ink">
                        <span className="font-medium">{item.name}</span>
                        {item.isFeatured && <Badge tone="accent">Featured</Badge>}
                        {!item.isAvailable && <Badge tone="danger">Sold out</Badge>}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-muted">{formatMoney(item.priceCents)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          run(async () => {
                            const result = await toggleItemAvailabilityAction(item.id, !item.isAvailable);
                            return result.ok ? { ok: true } : { ok: false, error: result.error };
                          })
                        }
                      >
                        {item.isAvailable ? "Mark sold out" : "Back in stock"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditor({ mode: "edit", item })}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => {
                          if (!window.confirm(`Delete "${item.name}"? Past orders keep their history.`)) return;
                          run(async () => {
                            const result = await deleteMenuItemAction(item.id);
                            return result.ok ? { ok: true } : { ok: false, error: result.error };
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
