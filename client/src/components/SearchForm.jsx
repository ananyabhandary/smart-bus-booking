import { useState } from 'react';

const isoDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export default function SearchForm({ cities, initial, loading, onSearch, onTrack }) {
  const [from, setFrom] = useState(initial?.from || 'Mangaluru');
  const [to, setTo] = useState(initial?.to || 'Bengaluru');
  const [date, setDate] = useState(initial?.date || isoDate(1));
  const [pnr, setPnr] = useState('');

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="stack">
      <form className="card search" onSubmit={(e) => { e.preventDefault(); onSearch({ from, to, date }); }}>
        <h2>Where are you travelling?</h2>
        <div className="grid3">
          <label>From
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>To
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Date
            <input type="date" value={date} min={isoDate(0)} onChange={(e) => setDate(e.target.value)} required />
          </label>
        </div>
        <div className="row">
          <button type="button" className="btn ghost" onClick={swap}>⇄ Swap cities</button>
          <button className="btn primary" disabled={loading || from === to}>
            {loading ? 'Searching…' : 'Search buses'}
          </button>
        </div>
        {from === to && <p className="hint" role="alert">Pick two different cities.</p>}
      </form>

      <form className="card" onSubmit={(e) => { e.preventDefault(); if (pnr.trim()) onTrack(pnr.trim()); }}>
        <h3>Already booked?</h3>
        <div className="row">
          <label className="grow">Enter your PNR
            <input value={pnr} onChange={(e) => setPnr(e.target.value)} placeholder="e.g. SBXXXXXXXX" />
          </label>
          <button className="btn">View booking</button>
        </div>
      </form>
    </div>
  );
}
