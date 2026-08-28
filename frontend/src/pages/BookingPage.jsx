import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/api";
import BookingSummary from "../components/BookingSummary";
import Loading from "../components/Loading";
import SeatLayout from "../components/SeatLayout";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatShowTime } from "../utils/formatters";

export default function BookingPage() {
  const { showId } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({ loading: true, error: "", show: null, seats: [] });
  const [selectedSeatIds, setSelectedSeatIds] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const loadAvailability = useCallback(async () => {
    try {
      const { data } = await api.get(`/shows/${showId}/seats`);
      setState({ loading: false, error: "", show: data.show, seats: data.seats || [] });
      setSelectedSeatIds((current) =>
        new Set([...current].filter((id) => data.seats.some((seat) => seat.id === id && seat.status === "AVAILABLE")))
      );
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: `/booking/${showId}` } } });
        return;
      }
      setState({
        loading: false,
        error: error.response?.data?.message || "Unable to load the seat map for this show.",
        show: null,
        seats: [],
      });
    }
  }, [logout, navigate, showId]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const toggleSeat = (seat) => {
    if (seat.status !== "AVAILABLE") return;
    setBookingError("");
    setSelectedSeatIds((current) => {
      const next = new Set(current);
      if (next.has(seat.id)) next.delete(seat.id);
      else next.add(seat.id);
      return next;
    });
  };

  const handleBooking = async () => {
    if (!selectedSeatIds.size) return;
    setSubmitting(true);
    setBookingError("");

    try {
      const { data } = await api.post("/bookings", { showId, seatIds: [...selectedSeatIds] });
      navigate(`/booking-success/${data.booking.id}`, { state: { booking: data.booking }, replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: `/booking/${showId}` } } });
        return;
      }
      if (error.response?.status === 409) {
        setBookingError("One or more selected seats were just taken. The seat map has been refreshed.");
        await loadAvailability();
      } else {
        setBookingError(error.response?.data?.message || "Booking could not be completed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) {
    return (
      <main className="page-shell">
        <Loading label="Preparing cinema seat map" />
      </main>
    );
  }

  if (state.error || !state.show) {
    return (
      <main className="page-shell">
        <div className="error-state" role="alert">
          <p>{state.error || "Show not found."}</p>
          <Link to="/" className="button button-small" style={{ marginTop: "14px", display: "inline-block" }}>
            ← Back to cinema programme
          </Link>
        </div>
      </main>
    );
  }

  const { show, seats } = state;
  const selectedSeats = seats.filter((seat) => selectedSeatIds.has(seat.id));

  return (
    <main className="booking-page">
      <div className="booking-topline">
        <Link className="back-link" to={`/movies/${show.movie.id}`}>
          ← Back to {show.movie.title}
        </Link>
        <span className="eyebrow">Select your seats</span>
        <h1>{show.movie.title}</h1>
        <p>
          {show.screen?.name || "Screen 1"} · {show.screen?.theatre?.name || "Vasundhara Theatre 70MM"} ·{" "}
          {formatDate(show.showDate)} · {formatShowTime(show.startTime)}
        </p>
      </div>

      <div className="booking-layout">
        <section className="seat-map-panel" aria-label="Interactive seating map">
          <SeatLayout seats={seats} selectedSeatIds={selectedSeatIds} onToggle={toggleSeat} />
        </section>

        <BookingSummary
          selectedSeats={selectedSeats}
          onConfirm={handleBooking}
          submitting={submitting}
          error={bookingError}
        />
      </div>
    </main>
  );
}
