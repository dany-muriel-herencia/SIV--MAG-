export function extractErrorMessage(err: unknown, fallback: string): string | null {
  if (!err) return null;
  if (Array.isArray(err)) {
    const found = err.find((e) => e !== null);
    if (!found) return null;
    const e = found as { error?: { message?: string }; message?: string };
    return e?.error?.message || e?.message || fallback;
  }
  const e = err as { error?: { message?: string }; message?: string };
  return e?.error?.message || e?.message || fallback;
}
