import { formatMoney } from "../utils/formatters";

export default function BookingSummary({ selectedSeats, onConfirm, submitting, error }) {
  const balconySeats = selectedSeats.filter(({ category }) => category === "BALCONY");
  const firstClassSeats = selectedSeats.filter(({ category }) => category === "FIRST_CLASS");

  const balconyTotal = balconySeats.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const firstClassTotal = firstClassSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const grandTotal = balconyTotal + firstClassTotal;

  return (
    <aside className="booking-summary" aria-label="Booking summary and checkout">
      <div className="summary-heading">
        <span className="eyebrow">Your reservation</span>
        <h2>Booking summary</h2>
      </div>

      <div className="summary-selected">
        <span>Selected seats</span>
        <strong>{selectedSeats.length.toString().padStart(2, "0")}</strong>
      </div>

      <div className="selected-codes">
        {selectedSeats.length ? (
          selectedSeats.map((seat) => (
            <span key={seat.id} className="selected-seat-chip">
              {seat.seatCode}
            </span>
          ))
        ) : (
          <p className="no-seats-hint">Click on available seats on the map to begin.</p>
        )}
      </div>

      <div className="price-lines">
        {balconySeats.length > 0 && (
          <div>
            <span>
              Balcony <small>({balconySeats.length} × {formatMoney(balconySeats[0]?.price)})</small>
            </span>
            <b>{formatMoney(balconyTotal)}</b>
          </div>
        )}

        {firstClassSeats.length > 0 && (
          <div>
            <span>
              First Class <small>({firstClassSeats.length} × {formatMoney(firstClassSeats[0]?.price)})</small>
            </span>
            <b>{formatMoney(firstClassTotal)}</b>
          </div>
        )}

        {selectedSeats.length === 0 && (
          <div className="price-placeholder">
            <span>Seat tier prices</span>
            <small>Select seats to calculate</small>
          </div>
        )}
      </div>

      {error && (
        <div className="form-error summary-error" role="alert">
          {error}
        </div>
      )}

      <div className="summary-total">
        <span>Total Payable</span>
        <strong>{formatMoney(grandTotal)}</strong>
      </div>

      <button
        className="button button-wide"
        type="button"
        disabled={!selectedSeats.length || submitting}
        onClick={onConfirm}
      >
        {submitting ? "Securing your seats..." : "Proceed to booking →"}
      </button>

      <p className="summary-note">
        All seat selections are held temporarily during reservation. Vasundhara Theatre 70MM guarantees seat allocation upon confirmation.
      </p>
    </aside>
  );
}
