import { useEffect, useState } from "react";

const emptyForm = { title: "", description: "", posterUrl: "", trailerUrl: "", duration: "", genre: "", language: "", status: "UPCOMING" };

function formFromMovie(movie) {
  return movie ? { title: movie.title || "", description: movie.description || "", posterUrl: movie.posterUrl || "", trailerUrl: movie.trailerUrl || "", duration: String(movie.duration || ""), genre: movie.genre || "", language: movie.language || "", status: movie.status || "UPCOMING" } : emptyForm;
}

function validate(form, editing) {
  if (!form.title.trim()) return "Title is required.";
  if (!form.genre.trim()) return "Genre is required.";
  if (!form.language.trim()) return "Language is required.";
  if (!Number.isInteger(Number(form.duration)) || Number(form.duration) <= 0) return "Duration must be a positive integer.";
  if (!editing && !["NOW_SHOWING", "UPCOMING"].includes(form.status)) return "Choose a valid movie status.";
  for (const [field, value] of [["Poster URL", form.posterUrl], ["Trailer URL", form.trailerUrl]]) {
    if (!value) continue;
    try { const url = new URL(value); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); } catch { return `${field} must be a valid HTTP or HTTPS URL.`; }
  }
  return "";
}

export default function MovieForm({ movie, onSubmit, onCancel, submitting, error }) {
  const editing = Boolean(movie);
  const [form, setForm] = useState(() => formFromMovie(movie));
  const [validationError, setValidationError] = useState("");

  useEffect(() => { setForm(formFromMovie(movie)); setValidationError(""); }, [movie]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = (event) => {
    event.preventDefault();
    const message = validate(form, editing);
    if (message) { setValidationError(message); return; }
    const data = { ...form, duration: Number(form.duration), description: form.description.trim() || null, posterUrl: form.posterUrl.trim() || null, trailerUrl: form.trailerUrl.trim() || null };
    if (editing) delete data.status;
    onSubmit(data);
  };

  return <div className="movie-modal-backdrop" role="presentation"><section className="movie-modal" role="dialog" aria-modal="true" aria-labelledby="movie-form-title"><div className="movie-modal-heading"><div><span className="eyebrow">{editing ? "Edit catalogue entry" : "New catalogue entry"}</span><h2 id="movie-form-title">{editing ? "Edit movie" : "Add movie"}</h2></div><button className="modal-close" type="button" onClick={onCancel} aria-label="Close movie form">×</button></div><form className="movie-form" onSubmit={handleSubmit}>{(validationError || error) && <div className="admin-error" role="alert">{validationError || error}</div>}<div className="form-grid"><label>Title<input value={form.title} onChange={(event) => updateField("title", event.target.value)} required /></label><label>Genre<input value={form.genre} onChange={(event) => updateField("genre", event.target.value)} required /></label><label>Language<input value={form.language} onChange={(event) => updateField("language", event.target.value)} required /></label><label>Duration (minutes)<input type="number" min="1" step="1" value={form.duration} onChange={(event) => updateField("duration", event.target.value)} required /></label><label className="form-span-two">Poster URL <small>HTTP/HTTPS only</small><input type="url" value={form.posterUrl} onChange={(event) => updateField("posterUrl", event.target.value)} /></label><label className="form-span-two">Trailer URL <small>HTTP/HTTPS only</small><input type="url" value={form.trailerUrl} onChange={(event) => updateField("trailerUrl", event.target.value)} /></label><label className="form-span-two">Description<textarea rows="4" value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>{!editing && <label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="UPCOMING">Upcoming</option><option value="NOW_SHOWING">Now showing</option></select></label>}{editing && <div className="form-status-note"><small>Status changes use the status action so they remain explicit.</small></div>}</div><div className="movie-form-actions"><button className="text-button" type="button" onClick={onCancel}>Cancel</button><button className="button button-small" type="submit" disabled={submitting}>{submitting ? "Saving..." : editing ? "Save changes" : "Create movie"}</button></div></form></section></div>;
}
