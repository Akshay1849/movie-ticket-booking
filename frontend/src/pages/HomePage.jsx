import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/api";
import Loading from "../components/Loading";

function MovieCard({ movie }) {
  const isNowShowing = movie.status === "NOW_SHOWING";

  return (
    <article className="movie-card">
      <Link to={`/movies/${movie.id}`} className="poster-link" aria-label={`View details for ${movie.title}`}>
        <div className="poster-wrap">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("poster-missing");
              }}
            />
          ) : (
            <div className="poster-placeholder">
              <span>{movie.title.slice(0, 1)}</span>
            </div>
          )}
          <span className={`status-pill ${isNowShowing ? "status-live" : "status-soon"}`}>
            {isNowShowing ? "Now showing" : "Coming soon"}
          </span>
        </div>
      </Link>

      <div className="movie-card-body">
        <div className="movie-card-tags">
          <span>{movie.language}</span>
          <span>•</span>
          <span>{movie.genre}</span>
          {movie.duration && (
            <>
              <span>•</span>
              <span>{movie.duration}m</span>
            </>
          )}
        </div>

        <h3>
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>

        <div className="movie-card-footer">
          <Link className="card-cta-btn" to={`/movies/${movie.id}`}>
            {isNowShowing ? "Book seats →" : "View details →"}
          </Link>
        </div>
      </div>
    </article>
  );
}

function MovieShelf({ title, eyebrow, movies, emptyMessage }) {
  return (
    <section className="content-section" aria-labelledby={`shelf-${eyebrow.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 id={`shelf-${eyebrow.toLowerCase().replace(/\s+/g, "-")}`}>{title}</h2>
        </div>
        <span className="section-count">
          {movies.length.toString().padStart(2, "0")} {movies.length === 1 ? "film" : "films"}
        </span>
      </div>

      {movies.length > 0 ? (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [catalogue, setCatalogue] = useState({ nowShowing: [], upcoming: [] });
  const [state, setState] = useState({ loading: true, error: "" });

  const loadProgramme = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const [nowResponse, upcomingResponse] = await Promise.all([
        api.get("/movies", { params: { status: "NOW_SHOWING" } }),
        api.get("/movies", { params: { status: "UPCOMING" } }),
      ]);
      setCatalogue({
        nowShowing: nowResponse.data.movies || [],
        upcoming: upcomingResponse.data.movies || [],
      });
      setState({ loading: false, error: "" });
    } catch {
      setState({
        loading: false,
        error: "Unable to load the cinema programme. Please check your connection and try again.",
      });
    }
  }, []);

  useEffect(() => {
    loadProgramme();
  }, [loadProgramme]);

  return (
    <main>
      <section className="hero-band" aria-label="Welcome to Vasundhara Theatre">
        <div className="hero-copy">
          <span className="eyebrow">Vasundhara Theatre 70MM</span>
          <h1>
            Cinema as it was<br />
            <em>meant to be experienced.</em>
          </h1>
          <p>
            Grand 70MM projection, crystal Dolby Atmos sound, and luxurious seating in the heart of the city.
          </p>
          <div className="hero-actions">
            <a className="button" href="#now-showing">
              Book tickets now <span aria-hidden="true">↓</span>
            </a>
            <a className="button button-outline" href="#coming-soon">
              Coming soon
            </a>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <span className="film-reel">✦</span>
          <span className="hero-note">
            SCREEN 01 · 70MM<br />
            <b>VASUNDHARA THEATRE</b>
          </span>
        </div>
      </section>

      <section className="theatre-features-strip" aria-label="Theatre amenities">
        <div className="features-inner">
          <div className="feature-item">
            <span className="feature-icon">🎞️</span>
            <div>
              <strong>70MM Large Format</strong>
              <small>Unmatched visual clarity & depth</small>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔊</span>
            <div>
              <strong>Dolby Atmos Audio</strong>
              <small>360-degree spatial sound immersion</small>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💺</span>
            <div>
              <strong>Balcony & First Class</strong>
              <small>Ergonomic comfort & premier sightlines</small>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell">
        {state.loading && <Loading label="Curating the cinema programme" />}

        {state.error && (
          <div className="error-state" role="alert">
            <p>{state.error}</p>
            <button type="button" className="button button-small" onClick={loadProgramme} style={{ marginTop: "12px" }}>
              Try again
            </button>
          </div>
        )}

        {!state.loading && !state.error && (
          <>
            <div id="now-showing">
              <MovieShelf
                eyebrow="On screen today"
                title="Now Showing"
                movies={catalogue.nowShowing}
                emptyMessage="No titles are currently showing today. Please check our upcoming programme."
                isNowShowing
              />
            </div>

            <div id="coming-soon">
              <MovieShelf
                eyebrow="Plan ahead"
                title="Coming Soon"
                movies={catalogue.upcoming}
                emptyMessage="New cinema releases will be announced soon. Stay tuned."
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
