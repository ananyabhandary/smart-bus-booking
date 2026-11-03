import { useEffect, useState } from 'react';
import { getCities, searchBuses, getBooking } from './api.js';
import Stepper from './components/Stepper.jsx';
import SearchForm from './components/SearchForm.jsx';
import BusList from './components/BusList.jsx';
import SeatMap from './components/SeatMap.jsx';
import Checkout from './components/Checkout.jsx';
import Confirmation from './components/Confirmation.jsx';

const load = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };

export default function App() {
  const [step, setStep] = useState(0); // 0 search, 1 buses, 2 seats, 3 checkout, 4 confirmed
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState(null);
  const [buses, setBuses] = useState([]);
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // accessibility preferences
  const [theme, setTheme] = useState(load('theme', 'light'));
  const [large, setLarge] = useState(load('large', 'false') === 'true');
  const [contrast, setContrast] = useState(load('contrast', 'false') === 'true');

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = theme;
    el.dataset.large = String(large);
    el.dataset.contrast = String(contrast);
    try { localStorage.setItem('theme', theme); localStorage.setItem('large', large); localStorage.setItem('contrast', contrast); } catch {}
  }, [theme, large, contrast]);

  useEffect(() => { getCities().then(setCities).catch(() => setError('Cannot reach the server. Is it running on port 5000?')); }, []);

  const doSearch = async (s) => {
    setError(''); setLoading(true);
    try {
      setBuses(await searchBuses(s.from, s.to, s.date));
      setSearch(s); setBus(null); setSeats([]); setStep(1);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const track = async (pnr) => {
    setError('');
    try { setBooking(await getBooking(pnr)); setStep(4); } catch (e) { setError(e.message); }
  };

  const reset = () => { setStep(0); setBus(null); setSeats([]); setBooking(null); setError(''); };

  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <header className="top">
        <h1>🚌 BusBuddy <span>Smart bus booking</span></h1>
        <div className="a11y" role="group" aria-label="Display settings">
          <button className="btn small" aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
          </button>
          <button className="btn small" aria-pressed={large} onClick={() => setLarge(!large)}>A+ Text</button>
          <button className="btn small" aria-pressed={contrast} onClick={() => setContrast(!contrast)}>◐ Contrast</button>
        </div>
      </header>

      <main id="main">
        <Stepper current={step} onGo={(i) => setStep(i)} />
        {error && <p className="card error" role="alert">{error}</p>}

        {step === 0 && <SearchForm cities={cities} initial={search} loading={loading} onSearch={doSearch} onTrack={track} />}
        {step === 1 && <BusList buses={buses} search={search} onBack={() => setStep(0)} onSelect={(b) => { setBus(b); setSeats([]); setStep(2); }} />}
        {step === 2 && bus && <SeatMap bus={bus} selected={seats} setSelected={setSeats} onBack={() => setStep(1)} onContinue={() => setStep(3)} />}
        {step === 3 && bus && <Checkout bus={bus} seats={seats} onBack={() => setStep(2)} onDone={(b) => { setBooking(b); setStep(4); }} />}
        {step === 4 && booking && <Confirmation booking={booking} onNew={reset} />}
      </main>

      <footer>Demo project · payments are simulated · built with React, Node.js &amp; Express</footer>
    </>
  );
}
