import { useEffect, useState } from 'react';
import { getSeats } from '../api.js';
import FareSummary from './FareSummary.jsx';

export default function SeatMap({ bus, selected, setSelected, onBack, onContinue }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    getSeats(bus.id).then(setData).catch((e) => setError(e.message));
  }, [bus.id]);

  if (error) return <p className="card error" role="alert">{error}</p>;
  if (!data) return <p className="card" aria-busy="true">Loading seat map…</p>;

  const toggle = (id) => {
    if (selected.includes(id)) setSelected(selected.filter((s) => s !== id));
    else if (selected.length < data.maxSeats) setSelected([...selected, id]);
  };

  const rows = Array.from({ length: data.rows }, (_, i) => i + 1);
  const seat = (r, c) => {
    const id = `${r}${c}`;
    const booked = data.booked.includes(id);
    const isSel = selected.includes(id);
    const kind = c === 'A' || c === 'D' ? 'window' : 'aisle';
    return (
      <button
        key={id}
        type="button"
        className={`seat ${booked ? 'booked' : isSel ? 'selected' : 'free'}`}
        disabled={booked}
        aria-pressed={isSel}
        aria-label={`Seat ${id}, ${kind}, ${booked ? 'booked' : isSel ? 'selected' : 'available'}`}
        onClick={() => toggle(id)}
      >
        {booked ? '×' : isSel ? '✓' : id}
      </button>
    );
  };

  return (
    <div className="layout">
      <section className="card" aria-label="Seat selection">
        <h2>Select your seats</h2>
        <ul className="legend">
          <li><span className="seat free sm">A</span> Available</li>
          <li><span className="seat selected sm">✓</span> Selected</li>
          <li><span className="seat booked sm">×</span> Booked</li>
        </ul>
        <div className="bus-body" role="group" aria-label="Bus seat layout">
          <div className="driver" aria-hidden="true">🛞 Driver</div>
          {rows.map((r) => (
            <div className="seat-row" key={r}>
              {seat(r, 'A')}{seat(r, 'B')}
              <span className="aisle" aria-hidden="true" />
              {seat(r, 'C')}{seat(r, 'D')}
            </div>
          ))}
        </div>
        <p className="muted small" aria-live="polite">
          {selected.length}/{data.maxSeats} seats selected. A and D are window seats.
        </p>
      </section>

      <div className="stack">
        <FareSummary bus={bus} seats={selected} />
        <div className="row">
          <button className="btn ghost" onClick={onBack}>← Back</button>
          <button className="btn primary grow" disabled={!selected.length} onClick={onContinue}>Continue</button>
        </div>
      </div>
    </div>
  );
}
