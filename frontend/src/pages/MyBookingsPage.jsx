import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/api";
import BookingStatusBadge from "../components/BookingStatusBadge";
import CancelBookingModal from "../components/CancelBookingModal";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatDateTime, formatMoney, formatShowTime } from "../utils/formatters";
import "../booking-customer.css";

export default function MyBookingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({ loading: true, error: "", bookings: [] });
  const [filter, setFilter] = useState("ALL");
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadBookings = useCallback(async () => {
    setState((curr) => ({ ...curr, loading: true, error: "" }));
    try {
      const { data } = await api.get("/bookings/my");
      setState({ loading: false, error: "", bookings: data.bookings || [] });
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/my-bookings" } } });
        return;
      }
      setState({ loading: false, error: "Unable to load your bookings.", bookings: [] });
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const counts = useMemo(() => {
    const list = state.bookings;
    return {
      ALL: list.length,
      ACTIVE: list.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length,
      CONFIRMED: list.filter((b) => b.status === "CONFIRMED").length,
      PENDING: list.filter((b) => b.status === "PENDING").length,
      CANCELLED: list.filter((b) => b.status === "CANCELLED").length,
    };
  }, [state.bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") return state.bookings;
    if (filter === "ACTIVE") {
      return state.bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
    }
    return state.bookings.filter((b) => b.status === filter);
  }, [filter, state.bookings]);

  const handleCancel = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);
    setCancelError("");

    try {
      await api.patch(`/bookings/${cancellingBooking.id}/cancel`);
      setFeedback(`Booking ${cancellingBooking.bookingReference} has been cancelled.`);
      setCancellingBooking(null);
      await loadBookings();
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/my-bookings" } } });
        return;
      }
      const message = error.response?.data?.message || "Unable to cancel booking.";
      setCancelError(message);
      if (error.response?.status === 409) {
        await loadBookings();
      }
    } finally {
      setCancelling(false);
    }
  };

  if (state.loading) {
    return (
      <main className="page-shell bookings-page">
        <Loading label="Finding your tickets" />
      </main>
    );
  }

  return (
    <main className="page-shell bookings-page">
      <div className="page-intro">
        <span className="eyebrow">Your cinema history</span>
        <h1>My bookings</h1>
        <p>Every ticket, reservation, and memory ready when you are.</p>
      </div>

      {feedback && (
        <div className="admin-feedback" role="status" style={{ marginBottom: "20px" }}>
          {feedback}
        </div>
      )}

      {state.error && (
        <div className="error-state" role="alert">
          {state.error}
        </div>
      )}

      {!state.error && state.bookings.length === 0 && (
        <div className="empty-state large-empty">
          <h2>No bookings yet</h2>
          <p>You haven&apos;t booked any movies yet. Your next favourite film is waiting on the programme.</p>
          <Link className="button" to="/">Browse films</Link>
        </div>
      )}

      {!state.error && state.bookings.length > 0 && (
        <>
          <div className="booking-filter-tabs" role="tablist" aria-label="Filter bookings by status">
            <button
              type="button"
              className={`filter-tab ${filter === "ALL" ? "active" : ""}`}
              onClick={() => setFilter("ALL")}
            >
              All <span className="tab-count">{counts.ALL}</span>
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === "ACTIVE" ? "active" : ""}`}
              onClick={() => setFilter("ACTIVE")}
            >
              Active <span className="tab-count">{counts.ACTIVE}</span>
            </button>
            {counts.PENDING > 0 && (
              <button
                type="button"
                className={`filter-tab ${filter === "PENDING" ? "active" : ""}`}
                onClick={() => setFilter("PENDING")}
              >
                Pending <span className="tab-count">{counts.PENDING}</span>
              </button>
            )}
            <button
              type="button"
              className={`filter-tab ${filter === "CONFIRMED" ? "active" : ""}`}
              onClick={() => setFilter("CONFIRMED")}
            >
              Confirmed <span className="tab-count">{counts.CONFIRMED}</span>
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === "CANCELLED" ? "active" : ""}`}
              onClick={() => setFilter("CANCELLED")}
            >
              Cancelled <span className="tab-count">{counts.CANCELLED}</span>
            </button>
          </div>

          {!filteredBookings.length ? (
            <div className="empty-state large-empty">
              <h2>No bookings match this filter</h2>
              <p>Try switching to another tab to view your bookings.</p>
              <button type="button" className="button" onClick={() => setFilter("ALL")}>
                Show all bookings
              </button>
            </div>
          ) : (
            <div className="customer-booking-list">
              {filteredBookings.map((booking) => {
                const isCancelled = booking.status === "CANCELLED";
                const seatCount = booking.seats?.length || 0;

                return (
                  <article
                    key={booking.id}
                    className={`customer-booking-card ${isCancelled ? "card-cancelled" : ""}`}
                  >
                    <div className="customer-card-poster-wrap">
                      {booking.show?.movie?.posterUrl ? (
                        <img
                          src={booking.show.movie.posterUrl}
                          alt=""
                          className="customer-card-poster"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement?.classList.add("poster-missing");
                          }}
                        />
                      ) : (
                        <span className="customer-card-poster-fallback">V</span>
                      )}
                    </div>

                    <div className="customer-card-info">
                      <div className="customer-card-header">
                        <span className="eyebrow">{booking.bookingReference}</span>
                        <BookingStatusBadge status={booking.status} />
                      </div>

                      <h2 className="customer-card-title">{booking.show?.movie?.title}</h2>

                      <div className="customer-card-meta">
                        <span>📅 {formatDate(booking.show?.showDate)}</span>
                        <span>⏰ {formatShowTime(booking.show?.startTime)}</span>
                        <span>🎬 {booking.show?.screen?.name || "Screen 1"}</span>
                        <span>🏷️ Booked {formatDateTime(booking.createdAt)}</span>
                      </div>

                      <div className="customer-card-seats">
                        {booking.seats?.map((seat) => (
                          <span key={seat.seatId} className="customer-seat-chip">
                            {seat.seatCode}
                          </span>
                        ))}
                        <small className="mono-subtle">
                          ({seatCount} seat{seatCount === 1 ? "" : "s"})
                        </small>
                      </div>
                    </div>

                    <div className="customer-card-actions">
                      <strong className="customer-card-amount">
                        {formatMoney(booking.totalAmount)}
                      </strong>

                      <div className="customer-card-btns">
                        <Link
                          className="button button-small"
                          to={`/my-bookings/${booking.id}`}
                        >
                          View ticket
                        </Link>

                        {!isCancelled && (
                          <button
                            type="button"
                            className="admin-action-button action-muted"
                            onClick={() => {
                              setCancelError("");
                              setCancellingBooking(booking);
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <CancelBookingModal
        booking={cancellingBooking}
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleCancel}
        submitting={cancelling}
        error={cancelError}
      />
    </main>
  );
}
