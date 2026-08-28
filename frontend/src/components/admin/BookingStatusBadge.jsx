export default function BookingStatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();
  const statusClasses = {
    CONFIRMED: "booking-status-badge booking-status-confirmed",
    PENDING: "booking-status-badge booking-status-pending",
    CANCELLED: "booking-status-badge booking-status-cancelled",
  };
  const className = statusClasses[normalized] || "booking-status-badge";
  const label = normalized ? normalized.charAt(0) + normalized.slice(1).toLowerCase() : "Unknown";

  return <span className={className}>{label}</span>;
}
