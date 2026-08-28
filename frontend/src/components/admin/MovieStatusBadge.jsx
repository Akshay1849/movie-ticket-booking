export default function MovieStatusBadge({ status, isActive }) {
  return <div className="movie-badges"><span className={`movie-status-badge ${status === "NOW_SHOWING" ? "movie-status-now" : "movie-status-upcoming"}`}>{status === "NOW_SHOWING" ? "Now showing" : "Upcoming"}</span><span className={`movie-activity-badge ${isActive ? "movie-active" : "movie-inactive"}`}>{isActive ? "Active" : "Inactive"}</span></div>;
}
