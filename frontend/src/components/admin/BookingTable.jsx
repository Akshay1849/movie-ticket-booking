import { formatDateTime, formatMoney, formatShowTime } from "../../utils/formatters";
import BookingStatusBadge from "./BookingStatusBadge";

export default function BookingTable({ bookings, onView, onStatusChange, busyId }) {
  return (
    <div className="booking-admin-table-wrap">
      <div className="booking-admin-table">
        <div className="booking-admin-table-head">
          <span>Booking Ref</span>
          <span>Customer</span>
          <span>Film / Show</span>
          <span>Seats</span>
          <span>Total</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {bookings.map((booking) => {
          const busy = busyId === booking.id;
          const seatCount = booking.seats?.length || 0;

          return (
            <article
              key={booking.id}
              className={`booking-admin-row ${
                booking.status === "CANCELLED"
                  ? "booking-row-cancelled"
                  : booking.status === "PENDING"
                  ? "booking-row-pending"
                  : ""
              }`}
            >
              <div className="booking-ref-cell">
                <span className="mobile-label">Booking Ref</span>
                <strong>{booking.bookingReference}</strong>
                <small title={booking.createdAt}>
                  {formatDateTime(booking.createdAt)}
                </small>
              </div>

              <div className="booking-customer-cell">
                <span className="mobile-label">Customer</span>
                <span className="customer-email">{booking.customer?.email || "Guest"}</span>
                {booking.customer?.mobile && (
                  <small className="customer-phone">{booking.customer.mobile}</small>
                )}
              </div>

              <div className="booking-show-cell">
                <span className="mobile-label">Film / Show</span>
                <div className="booking-film-snippet">
                  {booking.show?.movie?.posterUrl ? (
                    <img
                      src={booking.show.movie.posterUrl}
                      alt=""
                      className="booking-row-poster"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.classList.add("poster-missing");
                      }}
                    />
                  ) : (
                    <span className="booking-row-poster-fallback">V</span>
                  )}
                  <div>
                    <strong>{booking.show?.movie?.title || "Movie"}</strong>
                    <small>
                      {booking.show?.showDate} · {formatShowTime(booking.show?.startTime)}
                    </small>
                    <em>{booking.show?.screen?.name || "Screen 1"}</em>
                  </div>
                </div>
              </div>

              <div className="booking-seats-cell">
                <span className="mobile-label">Seats</span>
                <div className="seat-chip-list">
                  {booking.seats?.map((seat) => (
                    <span key={seat.seatId} className="seat-chip">
                      {seat.seatCode}
                    </span>
                  ))}
                </div>
                <small>{seatCount} seat{seatCount === 1 ? "" : "s"}</small>
              </div>

              <div className="booking-amount-cell">
                <span className="mobile-label">Total</span>
                <strong>{formatMoney(booking.totalAmount)}</strong>
              </div>

              <div className="booking-status-cell">
                <span className="mobile-label">Status</span>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="booking-admin-actions">
                <button
                  type="button"
                  className="admin-action-button"
                  onClick={() => onView(booking)}
                >
                  View
                </button>

                {booking.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      className="admin-action-button action-confirm"
                      disabled={busy}
                      onClick={() => onStatusChange(booking, "CONFIRMED")}
                    >
                      {busy ? "Updating..." : "Confirm"}
                    </button>
                    <button
                      type="button"
                      className="admin-action-button action-muted"
                      disabled={busy}
                      onClick={() => onStatusChange(booking, "CANCELLED")}
                    >
                      {busy ? "Updating..." : "Cancel"}
                    </button>
                  </>
                )}

                {booking.status === "CONFIRMED" && (
                  <button
                    type="button"
                    className="admin-action-button action-muted"
                    disabled={busy}
                    onClick={() => onStatusChange(booking, "CANCELLED")}
                  >
                    {busy ? "Updating..." : "Cancel"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
