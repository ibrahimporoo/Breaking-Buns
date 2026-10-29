export type FieldErrors = Partial<Record<string, string[]>>;

export type ActionFailure = {
  ok: false;
  error: string;
  fieldErrors?: FieldErrors;
  code?: string;
  totalCents?: number;
};

export type ActionResult<T = undefined> = { ok: true; data: T } | ActionFailure;

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  error: string,
  extra: Omit<ActionFailure, "ok" | "error"> = {},
): ActionFailure {
  return { ok: false, error, ...extra };
}
