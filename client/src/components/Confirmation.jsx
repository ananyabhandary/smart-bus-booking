import { inr } from '../fare.js';

export default function Confirmation({ booking, onNew }) {
  const b = booking;
  return (
    <div className="card ticket" aria-live="polite">
      <p className="success">✓ Booking confirmed</p>
      <h2>PNR: <span className="pnr">{b.pnr}</span></h2>
      <p className="muted">Save this PNR to view your booking later.</p>
      <hr />
      <p><strong>{b.bus.from} → {b.bus.to}</strong> · {b.bus.date}</p>
      <p>{b.bus.operator} ({b.bus.type})<br />Departs {b.bus.departure} · Arrives {b.bus.arrival}</p>
      <h3>Passengers</h3>
      <ul>
        {b.passengers.map((p) => (
          <li key={p.seat}>Seat {p.seat}: {p.name}, {p.age}, {p.gender}</li>
        ))}
      </ul>
      <dl className="paid">
        <dt>Base fare</dt><dd>{inr(b.fare.subtotal)}</dd>
        <dt>GST</dt><dd>{inr(b.fare.gst)}</dd>
        <dt>Convenience fee</dt><dd>{inr(b.fare.fee)}</dd>
        <dt className="total">Total paid ({b.paymentMethod})</dt><dd className="total">{inr(b.fare.total)}</dd>
      </dl>
      <div className="row no-print">
        <button className="btn" onClick={() => window.print()}>Print ticket</button>
        <button className="btn primary" onClick={onNew}>Book another trip</button>
      </div>
    </div>
  );
}
