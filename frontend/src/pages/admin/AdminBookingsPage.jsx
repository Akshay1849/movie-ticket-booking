import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/api";
import Loading from "../../components/Loading";
import BookingDetails from "../../components/admin/BookingDetails";
import BookingFilters from "../../components/admin/BookingFilters";
import BookingTable from "../../components/admin/BookingTable";
import { useAuth } from "../../context/AuthContext";
import "../../booking-admin.css";

const initialFilters = { search: "", status: "ALL", date: "", showId: "" };

export default function AdminBookingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [dateShows, setDateShows] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [state, setState] = useState({ loading: true, error: "" });
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleAuthError = useCallback((error, destination = "/admin/bookings") => {
    if (error.response?.status === 401) {
      logout();
      navigate("/login", { replace: true, state: { from: { pathname: destination } } });
      return true;
    }
    return false;
  }, [logout, navigate]);

  const loadShowsForDate = useCallback(async (date) => {
    if (!date) {
      setDateShows([]);
      return;
    }
    try {
      const { data } = await api.get("/shows/admin/all", { params: { date } });
      setDateShows(data.shows || []);
    } catch {
      setDateShows([]);
    }
  }, []);

  useEffect(() => {
    loadShowsForDate(filters.date);
  }, [filters.date, loadShowsForDate]);

  const loadBookings = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    const params = {};
    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }
    if (filters.status && filters.status !== "ALL") {
      params.status = filters.status;
    }
    if (filters.date) {
      params.date = filters.date;
    }
    if (filters.showId) {
      params.showId = filters.showId;
    }

    try {
      const { data } = await api.get("/admin/bookings", { params });
      setBookings(data.bookings || []);
      setState({ loading: false, error: "" });
    } catch (error) {
      if (handleAuthError(error)) return;
      const message = error.response?.status === 403
        ? "This area is restricted to theatre management users."
        : error.response?.data?.message || "Unable to load bookings.";
      setState({ loading: false, error: message });
    }
  }, [filters, handleAuthError]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusChange = async (booking, nextStatus) => {
    if (nextStatus === "CANCELLED") {
      const confirmed = window.confirm(
        `Are you sure you want to cancel booking ${booking.bookingReference}?`
      );
      if (!confirmed) return;
    } else if (nextStatus === "CONFIRMED") {
      const confirmed = window.confirm(
        `Confirm booking ${booking.bookingReference}?`
      );
      if (!confirmed) return;
    }

    setBusyId(booking.id);
    setFeedback("");

    try {
      await api.patch(`/admin/bookings/${booking.id}/status`, { status: nextStatus });
      setFeedback(`Booking ${booking.bookingReference} status updated to ${nextStatus.toLowerCase()}.`);
      await loadBookings();
    } catch (error) {
      if (handleAuthError(error)) return;
      const message = error.response?.data?.message || `Unable to update booking to ${nextStatus}.`;
      setFeedback(message);
      // Refresh in case another operator or action changed the status
      await loadBookings();
    } finally {
      setBusyId("");
    }
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
    (filters.status && filters.status !== "ALL") ||
    filters.date ||
    filters.showId
  );

  return (
    <main className="admin-page">
      <div className="booking-page-heading">
        <div>
          <span className="eyebrow">Desk & Reservations</span>
          <h2>Booking management</h2>
          <p>Review customer reservations, verify tickets, and manage status.</p>
        </div>
      </div>

      <BookingFilters
        filters={filters}
        shows={dateShows}
        onChange={setFilters}
        onClear={handleClearFilters}
        onRefresh={loadBookings}
        disabled={state.loading && !bookings.length}
      />

      {state.error && (
        <div className="admin-error" role="alert">
          {state.error}
        </div>
      )}

      {feedback && (
        <div className="admin-feedback" role="status">
          {feedback}
        </div>
      )}

      <div className="booking-list-meta">
        <span>
          {bookings.length} booking{bookings.length === 1 ? "" : "s"} found
        </span>
        {hasActiveFilters ? (
          <button
            type="button"
            className="clear-filters"
            onClick={handleClearFilters}
          >
            Clear active filters
          </button>
        ) : (
          <span>Live booking desk</span>
        )}
      </div>

      {state.loading ? (
        <Loading label="Loading bookings" />
      ) : !bookings.length ? (
        <div className="admin-empty">
          <h3>No bookings match your criteria.</h3>
          <p>Try clearing filters or searching with a different booking reference.</p>
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          onView={(booking) => setSelectedBookingId(booking.id)}
          onStatusChange={handleStatusChange}
          busyId={busyId}
        />
      )}

      {selectedBookingId && (
        <BookingDetails
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onStatusChange={handleStatusChange}
          busyId={busyId}
        />
      )}
    </main>
  );
}
