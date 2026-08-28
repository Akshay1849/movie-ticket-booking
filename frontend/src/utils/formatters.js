export function formatShowTime(value) {
  if (!value) return "";
  const isoTime = typeof value === "string" ? value.match(/^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/) : null;
  return isoTime?.[1] || (typeof value === "string" ? value.slice(0, 5) : "");
}

export function formatMoney(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
}

export function formatDateTime(value) {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

