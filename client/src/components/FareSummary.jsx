import { fare, inr } from '../fare.js';

export default function FareSummary({ bus, seats }) {
  const f = fare(bus.basePrice, seats.length, bus.pricing);
  const pct = Math.round(bus.pricing.gstRate * 100);
  return (
    <aside className="card summary" aria-label="Fare summary">
      <h3>Fare summary</h3>
      <p className="muted small">{bus.operator} · {bus.from} → {bus.to}<br />{bus.date} · {bus.departure}</p>
      <dl>
        <dt>Seats</dt><dd>{seats.length ? seats.join(', ') : '—'}</dd>
        <dt>Base fare ({seats.length} × {inr(bus.basePrice)})</dt><dd>{inr(f.subtotal)}</dd>
        <dt>GST ({pct}%)</dt><dd>{inr(f.gst)}</dd>
        <dt>Convenience fee ({inr(bus.pricing.feePerSeat)}/seat)</dt><dd>{inr(f.fee)}</dd>
        <dt className="total">Total payable</dt><dd className="total">{inr(f.total)}</dd>
      </dl>
      <p className="muted small">No hidden charges. What you see is what you pay.</p>
    </aside>
  );
}
