export default function BookingStatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();
  const statusClasses = {
    CONFIRMED: "status-pill status-live",
    PENDING: "status-pill status-soon",
    CANCELLED: "status-pill status-cancelled",
  };
  const className = statusClasses[normalized] || "status-pill";
  const label = normalized ? normalized.charAt(0) + normalized.slice(1).toLowerCase() : "Unknown";

  return <span className={className}>{label}</span>;
}
