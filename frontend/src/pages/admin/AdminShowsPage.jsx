import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/api";
import Loading from "../../components/Loading";
import ShowForm from "../../components/admin/ShowForm";
import ShowTable from "../../components/admin/ShowTable";
import { useAuth } from "../../context/AuthContext";
import "../../show-admin.css";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminShowsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [modalShow, setModalShow] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleAuthError = useCallback((error, destination = "/admin/shows") => {
    if (error.response?.status === 401) {
      logout();
      navigate("/login", { replace: true, state: { from: { pathname: destination } } });
      return true;
    }
    return false;
  }, [logout, navigate]);

  const loadShows = useCallback(async () => {
    try {
      const { data } = await api.get("/shows/admin/all", { params: { date: selectedDate } });
      setShows(data.shows || []);
      setState({ loading: false, error: "" });
    } catch (error) {
      if (handleAuthError(error)) return;
      setState({ loading: false, error: error.response?.data?.message || "Unable to load shows for this date." });
    }
  }, [handleAuthError, selectedDate]);

  const loadMovies = useCallback(async () => {
    try {
      const { data } = await api.get("/movies/admin/all", { params: { isActive: true } });
      setMovies(data.movies || []);
    } catch (error) {
      if (handleAuthError(error)) return;
      setFormError(error.response?.data?.message || "Unable to load active movies.");
    }
  }, [handleAuthError]);

  useEffect(() => { loadShows(); }, [loadShows]);
  useEffect(() => { loadMovies(); }, [loadMovies]);

  const availableMovies = useMemo(() => {
    if (!modalShow?.movieId || movies.some((movie) => movie.id === modalShow.movieId)) return movies;
    return [...movies, { ...modalShow.movie, isActive: false }];
  }, [modalShow, movies]);

  const handleSave = async (data) => {
    setSaving(true);
    setFormError("");
    try {
      if (modalShow) await api.patch(`/shows/${modalShow.id}`, data);
      else await api.post("/shows", data);
      setModalShow(undefined);
      setFeedback(modalShow ? "Show details updated." : "Show added to the schedule.");
      await loadShows();
    } catch (error) {
      if (handleAuthError(error)) return;
      setFormError(error.response?.data?.message || "The show could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (show) => {
    const nextStatus = show.status === "ACTIVE" ? "CANCELLED" : "ACTIVE";
    if (show.status === "ACTIVE" && !window.confirm("Cancel this show? The show will no longer be available for customer booking. Existing booking history will be preserved.")) return;
    if (show.status === "CANCELLED" && !window.confirm("Reactivate this show for customer booking?")) return;
    setBusyId(show.id);
    setFeedback("");
    try {
      await api.patch(`/shows/${show.id}/status`, { status: nextStatus });
      setFeedback(nextStatus === "ACTIVE" ? "Show reactivated." : "Show cancelled.");
      await loadShows();
    } catch (error) {
      if (handleAuthError(error)) return;
      setFeedback(error.response?.data?.message || "Show status could not be updated.");
    } finally {
      setBusyId("");
    }
  };

  const openCreate = () => { setFormError(""); setModalShow(null); };
  const openEdit = (show) => { setFormError(""); setModalShow(show); };
  const closeForm = () => { if (!saving) { setFormError(""); setModalShow(undefined); } };

  if (state.loading) return <main className="admin-page"><Loading label="Loading shows" /></main>;
  return <main className="admin-page"><div className="show-page-heading"><div><span className="eyebrow">Schedule control</span><h2>Show management</h2><p>Shape the daily rhythm of Vasundhara Theatre.</p></div><button className="button button-small" type="button" onClick={openCreate}>+ Add Show</button></div><div className="show-date-toolbar"><label>Schedule date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></label><span>Screen 1 is selected automatically by the theatre.</span></div>{state.error && <div className="admin-error" role="alert">{state.error}</div>}{feedback && <div className="admin-feedback" role="status">{feedback}</div>}<div className="show-list-meta"><span>{shows.length} show{shows.length === 1 ? "" : "s"} on {selectedDate}</span><span>All statuses included</span></div>{!shows.length ? <div className="admin-empty"><h3>No shows found for this date.</h3><p>Choose another date or add a show to this schedule.</p></div> : <ShowTable shows={shows} onEdit={openEdit} onStatusChange={handleStatusChange} busyId={busyId} />}{modalShow !== undefined && <ShowForm show={modalShow} movies={availableMovies} onSubmit={handleSave} onCancel={closeForm} submitting={saving} error={formError} />}</main>;
}
