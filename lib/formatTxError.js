/**
 * Map wagmi/viem-style errors to short, user-facing messages.
 * Falls back to a generic message when the cause is unknown.
 */
export function formatTxErrorMessage(error, strings) {
  if (!error) return strings.txErrors.generic;

  const name = error.name || "";
  const code = error.code;
  const short = error.shortMessage || "";
  const msg = (error.message || "").toLowerCase();
  const combined = `${short} ${msg}`.toLowerCase();

  if (name === "UserRejectedRequestError" || code === 4001 || combined.includes("user rejected")) {
    return strings.txErrors.userRejected;
  }
  if (
    combined.includes("insufficient funds") ||
    combined.includes("insufficient balance") ||
    combined.includes("exceeds the balance")
  ) {
    return strings.txErrors.insufficientFunds;
  }
  if (combined.includes("gas") && combined.includes("required exceeds")) {
    return strings.txErrors.gas;
  }
  if (combined.includes("network") || combined.includes("timeout") || combined.includes("failed to fetch")) {
    return strings.txErrors.network;
  }

  if (short && short.length < 200) return short;
  if (error.message && error.message.length < 200) return error.message;
  return strings.txErrors.generic;
}
