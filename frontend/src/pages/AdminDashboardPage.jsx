import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const summaryCards = [
  ["totalBookings", "Total bookings"],
  ["activeBookings", "Active bookings"],
  ["confirmedBookings", "Confirmed"],
  ["pendingBookings", "Pending"],
  ["cancelledBookings", "Cancelled"],
];

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [state, setState] = useState({ loading: true, error: "", dashboard: null });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    api.get("/admin/dashboard", { params: { date: selectedDate } })
      .then(({ data }) => active && setState({ loading: false, error: "", dashboard: data }))
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401) {
          logout();
          navigate("/login", { replace: true, state: { from: { pathname: "/admin/dashboard" } } });
          return;
        }
        const message = error.response?.status === 403
          ? "This area is restricted to theatre management users."
          : error.response?.data?.message || "The dashboard could not be loaded.";
        setState({ loading: false, error: message, dashboard: null });
      });
    return () => { active = false; };
  }, [logout, navigate, selectedDate]);

  const summary = state.dashboard?.summary;
  return <main className="dashboard-page"><div className="dashboard-titlebar"><div><span className="eyebrow">Daily pulse</span><h2>Dashboard</h2><p>See how today is moving across the theatre.</p></div><label className="date-control">Show date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></label></div>{state.loading && <Loading label="Loading theatre activity" />}{state.error && <div className="admin-error" role="alert">{state.error}</div>}{!state.loading && !state.error && state.dashboard && <><div className="dashboard-meta"><span>Reporting date <strong>{state.dashboard.date}</strong></span><span>{state.dashboard.shows.length} scheduled shows</span></div><div className="metric-grid">{summaryCards.map(([key, label]) => <div className="metric-card" key={key}><span>{label}</span><strong>{summary[key]}</strong></div>)}<div className="metric-card metric-revenue"><span>Confirmed revenue</span><strong>{money(summary.totalRevenue)}</strong></div></div>{state.dashboard.shows.length ? <section className="show-table-section"><div className="table-heading"><div><span className="eyebrow">Screen 01</span><h3>Show activity</h3></div><span>All returned shows</span></div><div className="show-table"><div className="show-table-head"><span>Film / time</span><span>Status</span><span>Bookings</span><span>Seats</span><span>Revenue</span></div>{state.dashboard.shows.map((show) => <div className={`show-table-row ${show.showStatus === "CANCELLED" ? "show-cancelled" : ""}`} key={show.showId}><div className="show-film"><strong>{show.movieTitle}</strong><small>{show.showDate} · {show.startTime}</small></div><span><b className={`show-status ${show.showStatus === "CANCELLED" ? "status-cancelled" : "status-active"}`}>{show.showStatus}</b></span><span>{show.activeBookings} active <small>{show.totalBookings} total</small></span><span>{show.bookedSeats} booked <small>{show.availableSeats} available</small></span><span className="show-revenue">{money(show.revenue)}</span></div>)}</div></section> : <div className="admin-empty"><h3>No shows found for this date.</h3><p>Try another date to see show activity.</p></div>}</>}</main>;
}
