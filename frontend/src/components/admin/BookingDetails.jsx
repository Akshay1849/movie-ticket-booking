import { useEffect, useState } from "react";
import api from "../../api/api";
import Loading from "../Loading";
import { formatDateTime, formatMoney, formatShowTime } from "../../utils/formatters";
import BookingStatusBadge from "./BookingStatusBadge";

export default function BookingDetails({ bookingId, onClose, onStatusChange, busyId }) {
  const [state, setState] = useState({ loading: true, error: "", booking: null });

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    setState({ loading: true, error: "", booking: null });

    api.get(`/admin/bookings/${bookingId}`)
      .then(({ data }) => {
        if (active) setState({ loading: false, error: "", booking: data.booking });
      })
      .catch((error) => {
        if (active) {
          const message = error.response?.data?.message || "Unable to load booking details.";
          setState({ loading: false, error: message, booking: null });
        }
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  if (!bookingId) return null;

  const { loading, error, booking } = state;
  const busy = busyId === bookingId;

  return (
    <div className="booking-modal-backdrop" onClick={onClose}>
      <section
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="booking-modal-heading">
          <div>
            <span className="eyebrow">Vasundhara Theatre / Booking</span>
            <h2 id="booking-details-title">
              {booking ? booking.bookingReference : "Booking Details"}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close booking details"
          >
            ×
          </button>
        </div>

        {loading && <Loading label="Loading booking details" />}

        {error && (
          <div className="admin-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && booking && (
          <div className="booking-modal-body">
            <div className="booking-detail-summary-bar">
              <div>
                <span>Status</span>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div>
                <span>Booked on</span>
                <strong>{formatDateTime(booking.createdAt)}</strong>
              </div>
              <div>
                <span>Total Amount</span>
                <strong className="booking-highlight-amount">
                  {formatMoney(booking.totalAmount)}
                </strong>
              </div>
            </div>

            <div className="booking-modal-grid">
              <section className="booking-detail-card">
                <h3>Customer Details</h3>
                <div className="booking-field-list">
                  <div>
                    <label>Email</label>
                    <span>{booking.customer?.email || "—"}</span>
                  </div>
                  <div>
                    <label>Mobile</label>
                    <span>{booking.customer?.mobile || "—"}</span>
                  </div>
                  <div>
                    <label>Customer ID</label>
                    <span className="mono-subtle">{booking.customer?.id || "—"}</span>
                  </div>
                </div>
              </section>

              <section className="booking-detail-card">
                <h3>Show & Film</h3>
                <div className="booking-film-detail">
                  {booking.show?.movie?.posterUrl ? (
                    <img
                      src={booking.show.movie.posterUrl}
                      alt={booking.show.movie.title}
                      className="booking-poster"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.classList.add("poster-missing");
                      }}
                    />
                  ) : (
                    <div className="booking-poster-fallback">V</div>
                  )}
                  <div>
                    <strong>{booking.show?.movie?.title || "Movie"}</strong>
                    <p>{booking.show?.screen?.theatre?.name || "Vasundhara Theatre 70MM"}</p>
                    <p className="booking-screen-tag">{booking.show?.screen?.name || "Screen 1"}</p>
                    <small>
                      {booking.show?.showDate} · {formatShowTime(booking.show?.startTime)}
                    </small>
                  </div>
                </div>
              </section>
            </div>

            <section className="booking-detail-card booking-seats-card">
              <div className="booking-seats-header">
                <div>
                  <h3>Reserved Seats & Pricing Snapshot</h3>
                  <p className="booking-card-subtitle">
                    Individual price snapshot at time of booking
                  </p>
                </div>
                <div className="seat-chips-summary">
                  {booking.seats?.map((seat) => (
                    <span key={seat.seatId} className="seat-chip">
                      {seat.seatCode}
                    </span>
                  ))}
                </div>
              </div>

              <div className="booking-seats-table">
                <div className="booking-seats-table-head">
                  <span>Seat</span>
                  <span>Category</span>
                  <span>Row / No.</span>
                  <span>Price Snapshot</span>
                </div>
                {booking.seats?.map((seat) => (
                  <div key={seat.seatId} className="booking-seats-table-row">
                    <strong>{seat.seatCode}</strong>
                    <span>{seat.category === "BALCONY" ? "Balcony" : "First Class"}</span>
                    <small>
                      {seat.row ? `Row ${seat.row}` : ""}
                      {seat.seatNumber ? `, Seat ${seat.seatNumber}` : ""}
                    </small>
                    <strong className="seat-price">{formatMoney(seat.price)}</strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="booking-modal-actions">
              {booking.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    className="button button-small"
                    disabled={busy}
                    onClick={() => {
                      onStatusChange(booking, "CONFIRMED");
                      onClose();
                    }}
                  >
                    {busy ? "Updating..." : "Confirm Booking"}
                  </button>
                  <button
                    type="button"
                    className="admin-action-button action-muted"
                    disabled={busy}
                    onClick={() => {
                      onStatusChange(booking, "CANCELLED");
                      onClose();
                    }}
                  >
                    {busy ? "Updating..." : "Cancel Booking"}
                  </button>
                </>
              )}

              {booking.status === "CONFIRMED" && (
                <button
                  type="button"
                  className="admin-action-button action-muted"
                  disabled={busy}
                  onClick={() => {
                    onStatusChange(booking, "CANCELLED");
                    onClose();
                  }}
                >
                  {busy ? "Updating..." : "Cancel Booking"}
                </button>
              )}

              <button type="button" className="text-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
