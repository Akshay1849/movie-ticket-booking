import { formatShowTime } from "../../utils/formatters";
import ShowStatusBadge from "./ShowStatusBadge";

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export default function ShowTable({ shows, onEdit, onStatusChange, busyId }) {
  return <div className="show-admin-table-wrap"><div className="show-admin-table"><div className="show-admin-table-head"><span>Show</span><span>Screen</span><span>Pricing</span><span>Status</span><span>Actions</span></div>{shows.map((show) => { const balcony = show.prices?.find(({ category }) => category === "BALCONY"); const firstClass = show.prices?.find(({ category }) => category === "FIRST_CLASS"); const busy = busyId === show.id; return <article className={`show-admin-row ${show.status === "CANCELLED" ? "show-row-cancelled" : ""}`} key={show.id}><div className="show-admin-identity">{show.movie.posterUrl ? <img src={show.movie.posterUrl} alt="" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement.classList.add("poster-missing"); }} /> : <span className="show-poster-fallback">V</span>}<div><strong>{show.movie.title}</strong><small>{show.showDate ? String(show.showDate).slice(0, 10) : ""} · {formatShowTime(show.startTime)}</small><em>{show.movie.genre} · {show.movie.language}</em></div></div><span className="show-screen">{show.screen?.name || "Screen 1"}<small>Vasundhara Theatre</small></span><div className="show-prices"><span>Balcony <b>{money(balcony?.amount)}</b></span><span>First Class <b>{money(firstClass?.amount)}</b></span></div><ShowStatusBadge status={show.status} /><div className="show-admin-actions"><button className="admin-action-button" type="button" disabled={busy} onClick={() => onEdit(show)}>Edit</button><button className="admin-action-button action-muted" type="button" disabled={busy} onClick={() => onStatusChange(show)}>{busy ? "Updating..." : show.status === "ACTIVE" ? "Cancel show" : "Reactivate"}</button></div></article>; })}</div></div>;
}
