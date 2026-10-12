export function money(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return sign + "₹" + Math.abs(n).toLocaleString("en-IN");
}

export const formatRupees = money;

export function pluralize(count, singular, plural = singular + "s") {
  return `${count} ${count === 1 ? singular : plural}`;
}
