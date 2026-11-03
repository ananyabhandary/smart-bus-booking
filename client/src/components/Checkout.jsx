import { useState } from 'react';
import { createBooking } from '../api.js';
import FareSummary from './FareSummary.jsx';

export default function Checkout({ bus, seats, onBack, onDone }) {
  const [passengers, setPassengers] = useState(() => seats.map((s) => ({ seat: s, name: '', age: '', gender: '' })));
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [method, setMethod] = useState('UPI');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const setP = (i, k, v) => setPassengers((ps) => ps.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));

  const validate = () => {
    const e = {};
    passengers.forEach((p, i) => {
      if (p.name.trim().length < 2) e[`name${i}`] = 'Enter the full name.';
      if (!(Number(p.age) >= 1 && Number(p.age) <= 120)) e[`age${i}`] = 'Enter an age between 1 and 120.';
      if (!p.gender) e[`gender${i}`] = 'Select a gender.';
    });
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = 'Enter a valid email.';
    if (!/^\d{10}$/.test(contact.phone)) e.phone = 'Enter a 10-digit phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const booking = await createBooking({ busId: bus.id, seats, passengers, contact, paymentMethod: method });
      onDone(booking);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const Err = ({ id }) => (errors[id] ? <span className="field-error" id={`${id}-err`}>{errors[id]}</span> : null);

  return (
    <form className="layout" onSubmit={submit} noValidate>
      <div className="stack">
        {passengers.map((p, i) => (
          <fieldset className="card" key={p.seat}>
            <legend>Passenger {i + 1} · Seat {p.seat}</legend>
            <div className="grid3">
              <label>Full name
                <input value={p.name} onChange={(e) => setP(i, 'name', e.target.value)} aria-invalid={!!errors[`name${i}`]} aria-describedby={`name${i}-err`} />
                <Err id={`name${i}`} />
              </label>
              <label>Age
                <input type="number" min="1" max="120" value={p.age} onChange={(e) => setP(i, 'age', e.target.value)} aria-invalid={!!errors[`age${i}`]} aria-describedby={`age${i}-err`} />
                <Err id={`age${i}`} />
              </label>
              <label>Gender
                <select value={p.gender} onChange={(e) => setP(i, 'gender', e.target.value)} aria-invalid={!!errors[`gender${i}`]} aria-describedby={`gender${i}-err`}>
                  <option value="">Select</option>
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
                <Err id={`gender${i}`} />
              </label>
            </div>
          </fieldset>
        ))}

        <fieldset className="card">
          <legend>Contact details</legend>
          <div className="grid2">
            <label>Email
              <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} aria-invalid={!!errors.email} aria-describedby="email-err" />
              <Err id="email" />
            </label>
            <label>Phone
              <input inputMode="numeric" maxLength={10} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '') })} aria-invalid={!!errors.phone} aria-describedby="phone-err" />
              <Err id="phone" />
            </label>
          </div>
        </fieldset>

        <fieldset className="card">
          <legend>Payment method (demo, no real charge)</legend>
          <div className="row">
            {['UPI', 'Card', 'Netbanking'].map((m) => (
              <label key={m} className="inline radio">
                <input type="radio" name="pay" checked={method === m} onChange={() => setMethod(m)} /> {m}
              </label>
            ))}
          </div>
        </fieldset>

        {apiError && <p className="card error" role="alert">{apiError}</p>}
      </div>

      <div className="stack">
        <FareSummary bus={bus} seats={seats} />
        <div className="row">
          <button type="button" className="btn ghost" onClick={onBack}>← Back</button>
          <button className="btn primary grow" disabled={busy}>{busy ? 'Processing…' : 'Pay & confirm'}</button>
        </div>
      </div>
    </form>
  );
}
