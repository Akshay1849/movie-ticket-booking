import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import api from "../api/api";
import BookingStatusBadge from "../components/BookingStatusBadge";
import Loading from "../components/Loading";
import { formatDate, formatMoney, formatShowTime } from "../utils/formatters";
import "../booking-customer.css";

export default function BookingSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const [state, setState] = useState({
    loading: !location.state?.booking,
    error: "",
    booking: location.state?.booking || null,
  });

  useEffect(() => {
    if (state.booking) return undefined;
    let active = true;
    api.get(`/bookings/${id}`)
      .then(({ data }) => {
        if (active) setState({ loading: false, error: "", booking: data.booking });
      })
      .catch(() => {
        if (active) setState({ loading: false, error: "This booking could not be loaded.", booking: null });
      });
    return () => {
      active = false;
    };
  }, [id, state.booking]);

  if (state.loading) {
    return (
      <main className="page-shell">
        <Loading label="Preparing your ticket confirmation" />
      </main>
    );
  }

  if (state.error || !state.booking) {
    return (
      <main className="page-shell">
        <div className="error-state" role="alert">
          {state.error || "Booking not found."}
        </div>
      </main>
    );
  }

  const { booking } = state;
  const seatsList = booking.seats?.map(({ seatCode }) => seatCode).join(", ") || "—";

  return (
    <main className="success-page">
      <div className="success-mark">✓</div>
      <span className="eyebrow">Booking received</span>
      <h1>Your reservation is submitted.</h1>
      <p className="success-lede">
        Your booking reference is below. Present it when you arrive at Vasundhara Theatre.
      </p>

      <div className="ticket-card">
        <div className="ticket-heading">
          <span className="eyebrow">{booking.bookingReference}</span>
          <BookingStatusBadge status={booking.status} />
        </div>

        <h2>{booking.show?.movie?.title}</h2>
        <p>
          {formatDate(booking.show?.showDate)} · {formatShowTime(booking.show?.startTime)} · {booking.show?.screen?.name || "Screen 1"}
        </p>

        <div className="ticket-divider" />

        <div className="ticket-details">
          <div>
            <span>Seats</span>
            <b>{seatsList}</b>
          </div>
          <div>
              <span>Total amount</span>
              <b>{formatMoney(booking.totalAmount)}</b>
          </div>
          
        </div>
      </div>

      <div className="success-actions">
        <Link className="button" to={`/my-bookings/${booking.id}`}>
          View ticket details <span aria-hidden="true">→</span>
        </Link>
        <Link className="button button-small" to="/my-bookings" style={{ background: "transparent", color: "var(--ink)", borderColor: "var(--line)" }}>
          My bookings
        </Link>
        <Link className="button button-small" to="/" style={{ background: "transparent", color: "var(--ink)", borderColor: "var(--line)" }}>
          Browse films
        </Link>
      </div>
    </main>
  );
}
