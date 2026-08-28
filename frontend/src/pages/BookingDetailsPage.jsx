import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/api";
import BookingStatusBadge from "../components/BookingStatusBadge";
import CancelBookingModal from "../components/CancelBookingModal";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatDateTime, formatMoney, formatShowTime } from "../utils/formatters";
import "../booking-customer.css";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({ loading: true, error: "", booking: null });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadBooking = useCallback(async () => {
    setState((curr) => ({ ...curr, loading: true, error: "" }));
    try {
      const { data } = await api.get(`/bookings/${id}`);
      setState({ loading: false, error: "", booking: data.booking });
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: `/my-bookings/${id}` } } });
        return;
      }
      const message = error.response?.status === 404
        ? "Booking not found or you do not have permission to view it."
        : error.response?.data?.message || "Unable to load booking details.";
      setState({ loading: false, error: message, booking: null });
    }
  }, [id, logout, navigate]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    setCancelError("");

    try {
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      setState((curr) => ({ ...curr, booking: data.booking }));
      setFeedback("Your booking has been cancelled. Reserved seats have been released.");
      setCancelModalOpen(false);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: `/my-bookings/${id}` } } });
        return;
      }
      const message = error.response?.data?.message || "Unable to cancel booking.";
      setCancelError(message);
      if (error.response?.status === 409) {
        // Status may have already changed
        await loadBooking();
      }
    } finally {
      setCancelling(false);
    }
  };

  if (state.loading) {
    return (
      <main className="page-shell">
        <Loading label="Loading your ticket details" />
      </main>
    );
  }

  if (state.error || !state.booking) {
    return (
      <main className="page-shell">
        <div className="ticket-topbar">
          <Link to="/my-bookings" className="back-link">
            ← Back to My bookings
          </Link>
        </div>
        <div className="error-state" role="alert">
          {state.error || "Booking not found."}
        </div>
      </main>
    );
  }

  const { booking } = state;
  const isCancelled = booking.status === "CANCELLED";

  return (
    <main className="page-shell ticket-page">
      <div className="ticket-topbar">
        <Link to="/my-bookings" className="back-link">
          ← Back to My bookings
        </Link>
      </div>

      {feedback && (
        <div className="admin-feedback" role="status" style={{ marginBottom: "20px" }}>
          {feedback}
        </div>
      )}

      <article className="ticket-container">
        {isCancelled && (
          <div className="ticket-cancelled-banner">
            <span>⚠️</span>
            <span>This booking is cancelled. Reserved seats have been released back to availability.</span>
          </div>
        )}

        <header className="ticket-header">
          <div className="ticket-header-main">
            <span className="eyebrow">Vasundhara Theatre 70MM</span>
            <h1>{booking.show?.movie?.title || "Film Ticket"}</h1>
            <p className="mono-subtle">Booking ref: {booking.bookingReference}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </header>

        <section className="ticket-movie-panel">
          <div className="ticket-poster-wrap">
            {booking.show?.movie?.posterUrl ? (
              <img
                src={booking.show.movie.posterUrl}
                alt={booking.show.movie.title}
                className="ticket-poster"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.classList.add("poster-missing");
                }}
              />
            ) : (
              <div className="customer-card-poster-fallback">V</div>
            )}
          </div>

          <div className="ticket-movie-info">
            <strong>{booking.show?.movie?.title}</strong>
            <p>{booking.show?.screen?.theatre?.name || "Vasundhara Theatre 70MM"}</p>

            <div className="ticket-meta-grid">
              <div>
                <span>Screen</span>
                <b>{booking.show?.screen?.name || "Screen 1"}</b>
              </div>
              <div>
                <span>Show Date</span>
                <b>{formatDate(booking.show?.showDate)}</b>
              </div>
              <div>
                <span>Show Time</span>
                <b>{formatShowTime(booking.show?.startTime)}</b>
              </div>
              <div>
                <span>Seats</span>
                <b>{booking.seats?.map((s) => s.seatCode).join(", ")}</b>
              </div>
            </div>
          </div>
        </section>

        <section className="ticket-seats-section">
          <h3>Reserved Seats & Pricing Breakdown</h3>
          <div className="ticket-seats-table">
            <div className="ticket-seats-head">
              <span>Seat</span>
              <span>Category</span>
              <span>Row / No.</span>
              <span style={{ textAlign: "right" }}>Price</span>
            </div>
            {booking.seats?.map((seat) => (
              <div key={seat.seatId} className="ticket-seats-row">
                <strong>{seat.seatCode}</strong>
                <span>{seat.category === "BALCONY" ? "Balcony" : "First Class"}</span>
                <small>
                  {seat.row ? `Row ${seat.row}` : ""}
                  {seat.seatNumber ? `, Seat ${seat.seatNumber}` : ""}
                </small>
                <span className="seat-amount">{formatMoney(seat.price)}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="ticket-summary-footer">
          <div className="ticket-created-date">
            <span>Booked on </span>
            <strong>{formatDateTime(booking.createdAt)}</strong>
          </div>
          <div className="ticket-total-display">
            <span>Total amount</span>
            <strong>{formatMoney(booking.totalAmount)}</strong>
          </div>
        </footer>
      </article>

      <div className="ticket-actions-bar">
        {!isCancelled && (
          <button
            type="button"
            className="button button-danger"
            onClick={() => {
              setCancelError("");
              setCancelModalOpen(true);
            }}
          >
            Cancel booking
          </button>
        )}

        <Link to="/" className="button button-small">
          Browse more films
        </Link>
      </div>

      <CancelBookingModal
        booking={booking}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
        submitting={cancelling}
        error={cancelError}
      />
    </main>
  );
}
