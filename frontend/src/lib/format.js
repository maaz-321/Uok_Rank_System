import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

export function toDate(value) {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(date) ? date : null;
}

export function formatDate(value, pattern = "dd MMM yyyy") {
  const date = toDate(value);
  return date ? format(date, pattern) : "—";
}

export function formatRelative(value) {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDistanceToNowStrict(date)} ago`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-PK").format(Number(value) || 0);
}

export function slugify(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeFileName(value = "document") {
  return value.replace(/[^a-z0-9._-]+/gi, "_");
}

export function computePercentage(obtained, total) {
  const o = Number(obtained);
  const t = Number(total);
  if (!t || Number.isNaN(o) || Number.isNaN(t)) return 0;
  return Math.round((o / t) * 10000) / 100;
}

export function titleCase(value = "") {
  return value
    .toString()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
