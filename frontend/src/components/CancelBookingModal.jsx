export default function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  submitting,
  error,
}) {
  if (!isOpen || !booking) return null;

  const seatsList = booking.seats?.map((s) => s.seatCode).join(", ") || "—";

  return (
    <div className="cancel-modal-backdrop" onClick={onClose}>
      <div
        className="cancel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cancel-modal-header">
          <span className="eyebrow">Cancellation</span>
          <h2 id="cancel-dialog-title">Cancel this booking?</h2>
        </div>

        <div className="cancel-modal-body">
          <div className="cancel-booking-summary">
            <div>
              <span>Reference</span>
              <strong>{booking.bookingReference}</strong>
            </div>
            <div>
              <span>Movie</span>
              <strong>{booking.show?.movie?.title || "Movie"}</strong>
            </div>
            <div>
              <span>Seats</span>
              <strong>{seatsList}</strong>
            </div>
          </div>

          <div className="cancel-warning-box">
            <p>
              <strong>Please note:</strong> Cancellation is final and cannot be undone. Your reserved seats will be immediately released for other cinema guests.
            </p>
          </div>

          {error && (
            <div className="error-state" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="cancel-modal-actions">
          <button
            type="button"
            className="text-button"
            onClick={onClose}
            disabled={submitting}
          >
            Keep booking
          </button>
          <button
            type="button"
            className="button button-danger"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Cancelling..." : "Confirm cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}
