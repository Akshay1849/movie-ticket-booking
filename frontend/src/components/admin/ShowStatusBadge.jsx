export default function ShowStatusBadge({ status }) {
  const cancelled = status === "CANCELLED";
  return <span className={`show-status-badge ${cancelled ? "show-status-cancelled" : "show-status-active"}`}>{cancelled ? "Cancelled" : "Active"}</span>;
}
