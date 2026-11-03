import { useMemo, useState } from 'react';
import { fare, inr, duration } from '../fare.js';

export default function BusList({ buses, search, onSelect, onBack }) {
  const [sort, setSort] = useState('departure');
  const [acOnly, setAcOnly] = useState(false);

  const list = useMemo(() => {
    const l = buses.filter((b) => !acOnly || b.ac);
    const key = {
      departure: (a, b) => a.depMinutes - b.depMinutes,
      price: (a, b) => a.basePrice - b.basePrice,
      rating: (a, b) => b.rating - a.rating,
      duration: (a, b) => a.durationMin - b.durationMin,
    }[sort];
    return [...l].sort(key);
  }, [buses, sort, acOnly]);

  return (
    <div className="stack">
      <div className="card row between">
        <div>
          <h2>{search.from} → {search.to}</h2>
          <p className="muted">{new Date(search.date).toDateString()} · {list.length} buses</p>
        </div>
        <div className="row">
          <label className="inline"><input type="checkbox" checked={acOnly} onChange={(e) => setAcOnly(e.target.checked)} /> AC only</label>
          <label className="inline">Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="departure">Departure</option>
              <option value="price">Price (low to high)</option>
              <option value="rating">Rating</option>
              <option value="duration">Fastest</option>
            </select>
          </label>
        </div>
      </div>

      {list.map((b) => {
        const f = fare(b.basePrice, 1, b.pricing);
        return (
          <article key={b.id} className="card bus">
            <div className="bus-main">
              <h3>{b.operator}</h3>
              <p className="muted">{b.type}</p>
              <p className="times">
                <strong>{b.departure}</strong> <span aria-hidden="true">→</span><span className="sr-only"> to </span> <strong>{b.arrival}</strong>
                <span className="muted"> · {duration(b.durationMin)}</span>
              </p>
              <p className="chips">
                <span className="chip rating" aria-label={`Rated ${b.rating} out of 5`}>★ {b.rating}</span>
                {b.amenities.map((a) => <span className="chip" key={a}>{a}</span>)}
              </p>
            </div>
            <div className="bus-side">
              <p className="price">{inr(f.total)}</p>
              <p className="muted small">per seat, all-inclusive</p>
              <p className="muted small">Fare {inr(b.basePrice)} + GST {inr(f.gst)} + fee {inr(f.fee)}</p>
              <p className={b.seatsLeft < 8 ? 'warn small' : 'muted small'}>{b.seatsLeft} seats left</p>
              <button className="btn primary" onClick={() => onSelect(b)}>Select seats</button>
            </div>
          </article>
        );
      })}
      {!list.length && <p className="card">No buses match your filters.</p>}
      <button className="btn ghost" onClick={onBack}>← Modify search</button>
    </div>
  );
}
