import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/api";
import Loading from "../components/Loading";
import { formatShowTime } from "../utils/formatters";

function getDateString(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

// Support today + next 6 days
const dateOptions = Array.from({ length: 7 }, (_, index) => getDateString(index));

function formatDateLabel(value) {
  const date = new Date(`${value}T12:00:00`);
  const isToday = value === getDateString(0);
  const dayName = isToday ? "Today" : new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date);
  const formattedDay = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
  return { dayName, formattedDay };
}

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movieState, setMovieState] = useState({ loading: true, error: "", movie: null });
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [showState, setShowState] = useState({ loading: true, error: "", shows: [] });

  const loadMovie = useCallback(async () => {
    setMovieState({ loading: true, error: "", movie: null });
    try {
      const { data } = await api.get(`/movies/${id}`);
      setMovieState({ loading: false, error: "", movie: data.movie });
    } catch {
      setMovieState({
        loading: false,
        error: "This film could not be found or is currently not in the catalogue.",
        movie: null,
      });
    }
  }, [id]);

  const loadShows = useCallback(async (date) => {
    setShowState({ loading: true, error: "", shows: [] });
    try {
      const { data } = await api.get(`/movies/${id}/shows`, { params: { date } });
      const activeShows = (data.shows || []).filter((show) => show.status === "ACTIVE");
      setShowState({ loading: false, error: "", shows: activeShows });
    } catch (error) {
      setShowState({
        loading: false,
        error: error.response?.data?.message || "Showtimes are temporarily unavailable for this date.",
        shows: [],
      });
    }
  }, [id]);

  useEffect(() => {
    loadMovie();
  }, [loadMovie]);

  useEffect(() => {
    loadShows(selectedDate);
  }, [loadShows, selectedDate]);

  if (movieState.loading) {
    return (
      <main className="page-shell">
        <Loading label="Loading film details" />
      </main>
    );
  }

  if (movieState.error || !movieState.movie) {
    return (
      <main className="page-shell">
        <div className="error-state" role="alert">
          <p>{movieState.error || "Film not found."}</p>
          <Link to="/" className="button button-small" style={{ marginTop: "14px", display: "inline-block" }}>
            ← Back to cinema programme
          </Link>
        </div>
      </main>
    );
  }

  const { movie } = movieState;
  const isNowShowing = movie.status === "NOW_SHOWING";

  return (
    <main className="details-page">
      <div className="details-poster">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.classList.add("poster-missing");
            }}
          />
        ) : (
          <div className="details-poster-placeholder">
            <span>{movie.title.slice(0, 1)}</span>
          </div>
        )}
      </div>

      <div className="details-copy">
        <Link className="back-link" to="/">
          ← Back to programme
        </Link>

        <div className="details-header-badges">
          <span className={`status-pill ${isNowShowing ? "status-live" : "status-soon"}`}>
            {isNowShowing ? "Now showing" : "Coming soon"}
          </span>
        </div>

        <h1>{movie.title}</h1>

        <div className="meta-row">
          <span>
            <b>Genre</b>
            {movie.genre}
          </span>
          <span>
            <b>Language</b>
            {movie.language}
          </span>
          <span>
            <b>Runtime</b>
            {movie.duration} mins
          </span>
        </div>

        {movie.description && (
          <div className="details-synopsis">
            <span className="eyebrow">Synopsis</span>
            <p className="details-description">{movie.description}</p>
          </div>
        )}

        {movie.trailerUrl && (
          <div className="details-trailer-action">
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-small button-outline"
            >
              ▶ Watch trailer
            </a>
          </div>
        )}

        <section className="showtimes-panel" aria-label="Available showtimes">
          <div className="showtimes-header">
            <div>
              <span className="eyebrow">Select date & time</span>
              <h2>Schedule & Showtimes</h2>
            </div>
            <span className="theatre-label">Vasundhara Theatre 70MM · Screen 1</span>
          </div>

          <div className="date-picker" role="tablist" aria-label="Choose a show date">
            {dateOptions.map((date) => {
              const { dayName, formattedDay } = formatDateLabel(date);
              const isSelected = date === selectedDate;
              return (
                <button
                  className={`date-option ${isSelected ? "date-selected" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedDate(date)}
                  key={date}
                >
                  <b>{dayName}</b>
                  <span>{formattedDay}</span>
                </button>
              );
            })}
          </div>

          {showState.loading && <Loading label="Finding available showtimes" />}

          {showState.error && (
            <div className="error-state" role="alert">
              {showState.error}
            </div>
          )}

          {!showState.loading && !showState.error && !showState.shows.length && (
            <div className="empty-state">
              <p>No active shows scheduled for this date. Please choose another date or check back later.</p>
            </div>
          )}

          {!showState.loading && !showState.error && showState.shows.length > 0 && (
            <div className="showtime-list">
              {showState.shows.map((show) => (
                <Link className="showtime-button" to={`/booking/${show.id}`} key={show.id}>
                  <span>{formatShowTime(show.startTime)}</span>
                  <small>Choose seats →</small>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
