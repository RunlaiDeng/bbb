/** Normalize RPC / ABI values to bigint for arithmetic & viem formatters */
export function toBigIntSafe(value, fallback = 0n) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(Math.trunc(value));
  if (typeof value === "string" && value.trim() !== "") {
    try {
      return BigInt(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}
