export default function Seat({ seat, selected, onToggle, aisleBefore = false }) {
  const isBooked = seat.status === "BOOKED";
  const state = selected ? "selected" : isBooked ? "booked" : "available";

  return (
    <button
      className={`seat seat-${state}${aisleBefore ? " seat-aisle-before" : ""}`}
      type="button"
      disabled={isBooked}
      aria-label={`${seat.seatCode}, ${state}`}
      aria-pressed={selected}
      title={isBooked ? "Already booked" : `${seat.seatCode} - ${seat.price ? `₹${Number(seat.price).toFixed(2)}` : "Price unavailable"}`}
      onClick={() => onToggle(seat)}
    >
      {seat.seatNumber}
    </button>
  );
}
