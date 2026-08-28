import Seat from "./Seat";

const categoryLabels = {
  BALCONY: "Balcony (Upper Tier)",
  FIRST_CLASS: "First Class (Main Hall)",
};

function groupSeatsByRow(seats) {
  return [...seats].reduce((rows, seat) => {
    const row = seat.row || "-";
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
    return rows;
  }, {});
}

function sortRows(rows) {
  return Object.entries(rows).sort(([firstRow], [secondRow]) =>
    firstRow.localeCompare(secondRow, undefined, { numeric: true })
  );
}

export default function SeatLayout({ seats, selectedSeatIds, onToggle }) {
  return (
    <div className="seat-layout">
      <div className="cinema-screen-container" aria-hidden="true">
        <div className="cinema-screen-curve" />
        <span className="cinema-screen-text">SCREEN 01 · 70MM PROJECTION</span>
      </div>

      <div className="seat-legend" aria-label="Seat status legend">
        <span>
          <i className="legend-dot legend-available" /> Available
        </span>
        <span>
          <i className="legend-dot legend-selected" /> Selected
        </span>
        <span>
          <i className="legend-dot legend-booked" /> Booked
        </span>
      </div>

      {Object.entries(categoryLabels).map(([category, label]) => {
        const categorySeats = seats.filter((seat) => seat.category === category);
        const rows = sortRows(groupSeatsByRow(categorySeats));

        if (!categorySeats.length) return null;

        return (
          <section className="seat-section" key={category}>
            <div className="seat-section-heading">
              <div>
                <span className="eyebrow">Seating tier</span>
                <h2>{label}</h2>
              </div>
              <span className="seat-section-count">
                {categorySeats.length} seats
              </span>
            </div>

            {rows.length > 0 ? (
              <div className="seat-rows">
                {rows.map(([rowName, rowSeats]) => (
                  <div className="seat-row" key={`${category}-${rowName}`}>
                    <span className="row-label">{rowName}</span>
                    <div className="seat-row-buttons">
                      {rowSeats
                        .sort((first, second) => Number(first.seatNumber) - Number(second.seatNumber))
                        .map((seat, index, orderedSeats) => {
                          const previous = orderedSeats[index - 1];
                          const hasAisle =
                            previous && Number(seat.seatNumber) - Number(previous.seatNumber) > 1;
                          return (
                            <Seat
                              key={seat.id}
                              seat={seat}
                              selected={selectedSeatIds.has(seat.id)}
                              onToggle={onToggle}
                              aisleBefore={hasAisle}
                            />
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-seat-row">No seats available in this tier.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
