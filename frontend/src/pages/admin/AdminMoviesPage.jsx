import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/api";
import Loading from "../../components/Loading";
import MovieForm from "../../components/admin/MovieForm";
import MovieTable from "../../components/admin/MovieTable";
import { useAuth } from "../../context/AuthContext";
import "../../movie-admin.css";

const initialFilters = { search: "", status: "ALL", activity: "ALL" };

export default function AdminMoviesPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [state, setState] = useState({ loading: true, error: "" });
  const [modalMovie, setModalMovie] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadMovies = useCallback(async () => {
    try {
      const { data } = await api.get("/movies/admin/all");
      setMovies(data.movies || []);
      setState({ loading: false, error: "" });
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/admin/movies" } } });
        return;
      }
      setState({ loading: false, error: error.response?.data?.message || "Unable to load the movie catalogue." });
    }
  }, [logout, navigate]);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  const filteredMovies = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesSearch = !search || [movie.title, movie.genre, movie.language].some((value) => value.toLowerCase().includes(search));
      const matchesStatus = filters.status === "ALL" || movie.status === filters.status;
      const matchesActivity = filters.activity === "ALL" || (filters.activity === "ACTIVE" ? movie.isActive : !movie.isActive);
      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [filters, movies]);

  const handleSave = async (formData) => {
    setSaving(true);
    setFormError("");
    try {
      if (modalMovie) await api.patch(`/movies/${modalMovie.id}`, formData);
      else await api.post("/movies", formData);
      setModalMovie(undefined);
      setFeedback(modalMovie ? "Movie details updated." : "Movie added to the catalogue.");
      await loadMovies();
    } catch (error) {
      setFormError(error.response?.data?.message || "The movie could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (movie) => {
    setBusyId(movie.id);
    setFeedback("");
    try {
      await api.patch(`/movies/${movie.id}/status`, { status: movie.status === "NOW_SHOWING" ? "UPCOMING" : "NOW_SHOWING" });
      setFeedback("Movie status updated.");
      await loadMovies();
    } catch (error) {
      setFeedback(error.response?.data?.message || "Movie status could not be updated.");
    } finally {
      setBusyId("");
    }
  };

  const handleActivityChange = async (movie) => {
    const nextActive = !movie.isActive;
    if (!window.confirm(`${nextActive ? "Activate" : "Deactivate"} ${movie.title}?`)) return;
    setBusyId(movie.id);
    setFeedback("");
    try {
      await api.patch(`/movies/${movie.id}/active`, { isActive: nextActive });
      setFeedback(nextActive ? "Movie activated." : "Movie deactivated.");
      await loadMovies();
    } catch (error) {
      setFeedback(error.response?.data?.message || "Movie activity could not be updated.");
    } finally {
      setBusyId("");
    }
  };

  const openCreate = () => { setFormError(""); setModalMovie(null); };
  const openEdit = (movie) => { setFormError(""); setModalMovie(movie); };
  const closeForm = () => { if (!saving) { setFormError(""); setModalMovie(undefined); } };

  if (state.loading) return <main className="admin-page"><Loading label="Loading movie catalogue" /></main>;
  return <main className="admin-page"><div className="movie-page-heading"><div><span className="eyebrow">Catalogue control</span><h2>Movie management</h2><p>Keep the programme current, clear, and ready for the audience.</p></div><button className="button button-small" type="button" onClick={openCreate}>+ Add movie</button></div>{state.error && <div className="admin-error" role="alert">{state.error}</div>}{feedback && <div className="admin-feedback" role="status">{feedback}</div>}<section className="movie-controls"><label className="movie-search">Search movies<input type="search" placeholder="Title, genre, or language" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label><label>Show status<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="ALL">All statuses</option><option value="NOW_SHOWING">Now showing</option><option value="UPCOMING">Upcoming</option></select></label><label>Activity<select value={filters.activity} onChange={(event) => setFilters({ ...filters, activity: event.target.value })}><option value="ALL">All activity</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label></section><div className="movie-list-meta"><span>{filteredMovies.length} of {movies.length} movies</span>{filters.search || filters.status !== "ALL" || filters.activity !== "ALL" ? <button className="clear-filters" type="button" onClick={() => setFilters(initialFilters)}>Clear filters</button> : <span>Live catalogue</span>}</div>{!movies.length ? <div className="admin-empty"><h3>No movies in the catalogue.</h3><p>Add the first title to begin building the programme.</p></div> : !filteredMovies.length ? <div className="admin-empty"><h3>No movies match these filters.</h3><p>Try clearing one of the filters.</p></div> : <MovieTable movies={filteredMovies} onEdit={openEdit} onStatusChange={handleStatusChange} onActivityChange={handleActivityChange} busyId={busyId} />}{modalMovie !== undefined && <MovieForm movie={modalMovie} onSubmit={handleSave} onCancel={closeForm} submitting={saving} error={formError} />}</main>;
}
