export default function BookingFilters({
  filters,
  onChange,
  onClear,
  onRefresh,
  shows = [],
  disabled,
}) {
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
    (filters.status && filters.status !== "ALL") ||
    filters.date ||
    filters.showId
  );

  return (
    <section className="booking-controls" aria-label="Booking filters">
      <label className="booking-search-label">
        Search Booking
        <input
          type="search"
          placeholder="Booking reference (e.g. VT-...)"
          value={filters.search}
          disabled={disabled}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </label>

      <label>
        Status
        <select
          value={filters.status}
          disabled={disabled}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </label>

      <label>
        Show date
        <input
          type="date"
          value={filters.date}
          disabled={disabled}
          onChange={(event) => {
            const newDate = event.target.value;
            onChange({ ...filters, date: newDate, showId: "" });
          }}
        />
      </label>

      {shows.length > 0 && (
        <label>
          Show
          <select
            value={filters.showId || ""}
            disabled={disabled}
            onChange={(event) => onChange({ ...filters, showId: event.target.value })}
          >
            <option value="">All shows on date</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.movie?.title} · {show.startTime?.slice(11, 16) || show.startTime?.slice(0, 5) || "Show"}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="booking-filter-actions">
        {onRefresh && (
          <button
            type="button"
            className="admin-action-button"
            onClick={onRefresh}
            disabled={disabled}
            title="Refresh bookings list"
          >
            ↻ Refresh
          </button>
        )}
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters"
            onClick={onClear}
            disabled={disabled}
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
