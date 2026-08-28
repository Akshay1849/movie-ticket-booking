import { useEffect, useState } from "react";

import { formatShowTime } from "../../utils/formatters";

function formFromShow(show) {
  const balcony = show?.prices?.find(({ category }) => category === "BALCONY");
  const firstClass = show?.prices?.find(({ category }) => category === "FIRST_CLASS");
  return {
    movieId: show?.movieId || "",
    showDate: show?.showDate ? String(show.showDate).slice(0, 10) : "",
    startTime: formatShowTime(show?.startTime),
    balconyPrice: balcony?.amount || "",
    firstClassPrice: firstClass?.amount || "",
  };
}

function validate(form) {
  if (!form.movieId) return "Select a movie.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.showDate)) return "Show date must use YYYY-MM-DD format.";
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.startTime)) return "Start time must use HH:mm format.";
  if (!/^\d+(?:\.\d{1,2})?$/.test(form.balconyPrice) || Number(form.balconyPrice) <= 0) return "Balcony price must be a positive amount with up to two decimals.";
  if (!/^\d+(?:\.\d{1,2})?$/.test(form.firstClassPrice) || Number(form.firstClassPrice) <= 0) return "First Class price must be a positive amount with up to two decimals.";
  return "";
}

export default function ShowForm({ show, movies, onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState(() => formFromShow(show));
  const [validationError, setValidationError] = useState("");
  const editing = Boolean(show);

  useEffect(() => { setForm(formFromShow(show)); setValidationError(""); }, [show]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    const message = validate(form);
    if (message) { setValidationError(message); return; }
    onSubmit({ movieId: form.movieId, showDate: form.showDate, startTime: form.startTime, prices: [{ category: "BALCONY", amount: form.balconyPrice }, { category: "FIRST_CLASS", amount: form.firstClassPrice }] });
  };

  return <div className="show-modal-backdrop"><section className="show-modal" role="dialog" aria-modal="true" aria-labelledby="show-form-title"><div className="show-modal-heading"><div><span className="eyebrow">{editing ? "Edit schedule" : "New schedule"}</span><h2 id="show-form-title">{editing ? "Edit show" : "Add show"}</h2></div><button className="modal-close" type="button" onClick={onCancel} aria-label="Close show form">×</button></div><form className="show-form" onSubmit={submit}>{(validationError || error) && <div className="admin-error" role="alert">{validationError || error}</div>}<label>Movie<select value={form.movieId} onChange={(event) => update("movieId", event.target.value)} required><option value="">Select an active movie</option>{movies.map((movie) => <option value={movie.id} key={movie.id}>{movie.title} · {movie.genre} · {movie.language}</option>)}</select></label><div className="show-form-grid"><label>Show date<input type="date" value={form.showDate} onChange={(event) => update("showDate", event.target.value)} required /></label><label>Start time<input type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} required /></label><label>Balcony price (₹)<input inputMode="decimal" value={form.balconyPrice} onChange={(event) => update("balconyPrice", event.target.value)} required /></label><label>First Class price (₹)<input inputMode="decimal" value={form.firstClassPrice} onChange={(event) => update("firstClassPrice", event.target.value)} required /></label></div><p className="show-form-note">Screen 1 is selected automatically by the theatre.</p><div className="show-form-actions"><button className="text-button" type="button" onClick={onCancel}>Cancel</button><button className="button button-small" type="submit" disabled={submitting}>{submitting ? (editing ? "Updating..." : "Creating...") : editing ? "Save changes" : "Create show"}</button></div></form></section></div>;
}
