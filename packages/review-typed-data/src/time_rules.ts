const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export function parseUnixSeconds(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export function isExpired(unixSeconds: number, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return unixSeconds < nowSeconds;
}

export function isLongDeadline(unixSeconds: number, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return unixSeconds - nowSeconds > ONE_YEAR_SECONDS;
}
