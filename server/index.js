const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'bookings.json');
const PRICING = { gstRate: 0.05, feePerSeat: 15 }; // transparent pricing: shown to the user at every step
const MAX_SEATS = 6;

const CITIES = ['Mangaluru', 'Bengaluru', 'Mysuru', 'Udupi', 'Hubballi', 'Goa', 'Chennai', 'Hyderabad', 'Pune'];
const OPERATORS = ['KSRTC Airavat', 'VRL Travels', 'SRS Travels', 'Orange Tours', 'Sugama Tourist', 'Kallada Travels'];
const TYPES = [
  { name: 'Non-AC Seater', mult: 0.8, ac: false },
  { name: 'AC Seater', mult: 1.0, ac: true },
  { name: 'AC Semi-Sleeper', mult: 1.3, ac: true },
  { name: 'Volvo AC Multi-Axle', mult: 1.6, ac: true },
];
const AMENITIES = ['Charging point', 'Water bottle', 'Blanket', 'Live tracking', 'Reading light', 'Free Wi-Fi'];
const COLS = ['A', 'B', 'C', 'D'];
const ROWS = 10;

// ---------- helpers ----------
function hash(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (mins) => `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`;

function calcFare(base, n) {
  const subtotal = base * n;
  const gst = Math.round(subtotal * PRICING.gstRate * 100) / 100;
  const fee = PRICING.feePerSeat * n;
  return { subtotal, gst, fee, total: Math.round((subtotal + gst + fee) * 100) / 100 };
}

function genBuses(from, to, date) {
  const pair = [from, to].sort().join('-');
  const duration = 180 + (hash(pair) % 540); // minutes, same in both directions
  const r = rng(hash(`${from}>${to}>${date}`));
  const buses = [];
  for (let i = 0; i < 6; i++) {
    const type = TYPES[Math.floor(r() * TYPES.length)];
    const dep = Math.floor((r() * 24 * 60) / 15) * 15;
    const arrTotal = dep + duration;
    const days = Math.floor(arrTotal / 1440);
    buses.push({
      operator: OPERATORS[Math.floor(r() * OPERATORS.length)],
      type: type.name,
      ac: type.ac,
      depMinutes: dep,
      departure: fmtTime(dep),
      arrival: fmtTime(arrTotal) + (days ? ` (+${days})` : ''),
      durationMin: duration,
      basePrice: Math.max(250, Math.round(((duration / 60) * 55 * type.mult) / 10) * 10),
      rating: Math.round((3.6 + r() * 1.3) * 10) / 10,
      amenities: AMENITIES.filter(() => r() > 0.55),
    });
  }
  buses.sort((a, b) => a.depMinutes - b.depMinutes);
  return buses.map((b, i) => ({
    ...b,
    id: `${from}_${to}_${date}_${i}`,
    from, to, date,
    pricing: PRICING,
  }));
}

function validRoute(from, to, date) {
  return CITIES.includes(from) && CITIES.includes(to) && from !== to && /^\d{4}-\d{2}-\d{2}$/.test(date || '');
}

function busById(id) {
  const [from, to, date, idx] = String(id).split('_');
  if (!validRoute(from, to, date)) return null;
  return genBuses(from, to, date)[Number(idx)] || null;
}

function allSeatIds() {
  const ids = [];
  for (let r = 1; r <= ROWS; r++) COLS.forEach((c) => ids.push(`${r}${c}`));
  return ids;
}

function readBookings() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return []; }
}
function writeBookings(list) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2));
}

function bookedSeats(busId) {
  const r = rng(hash(busId));
  const base = allSeatIds().filter(() => r() < 0.22); // pre-booked seats for realism
  const mine = readBookings().filter((b) => b.busId === busId).flatMap((b) => b.seats);
  return [...new Set([...base, ...mine])];
}

// ---------- routes ----------
app.get('/api/cities', (_req, res) => res.json(CITIES));

app.get('/api/buses', (req, res) => {
  const { from, to, date } = req.query;
  if (!validRoute(from, to, date)) return res.status(400).json({ error: 'Choose two different cities and a valid date.' });
  const buses = genBuses(from, to, date).map((b) => ({
    ...b,
    seatsLeft: allSeatIds().length - bookedSeats(b.id).length,
  }));
  res.json(buses);
});

app.get('/api/buses/:id/seats', (req, res) => {
  const bus = busById(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found.' });
  res.json({ rows: ROWS, cols: COLS, booked: bookedSeats(bus.id), maxSeats: MAX_SEATS });
});

app.post('/api/bookings', (req, res) => {
  const { busId, seats, passengers, contact, paymentMethod } = req.body || {};
  const bus = busById(busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found.' });
  if (!Array.isArray(seats) || seats.length < 1 || seats.length > MAX_SEATS)
    return res.status(400).json({ error: `Select 1 to ${MAX_SEATS} seats.` });
  if (!seats.every((s) => allSeatIds().includes(s)))
    return res.status(400).json({ error: 'Invalid seat selected.' });
  const taken = bookedSeats(bus.id);
  const clash = seats.filter((s) => taken.includes(s));
  if (clash.length) return res.status(409).json({ error: `Seat ${clash.join(', ')} was just booked. Please pick another.` });
  if (!Array.isArray(passengers) || passengers.length !== seats.length ||
      passengers.some((p) => !p.name || !p.name.trim() || !(Number(p.age) > 0) || !p.gender))
    return res.status(400).json({ error: 'Enter valid details for every passenger.' });
  if (!contact || !/^\S+@\S+\.\S+$/.test(contact.email || '') || !/^\d{10}$/.test(contact.phone || ''))
    return res.status(400).json({ error: 'Enter a valid email and 10-digit phone number.' });
  if (!['UPI', 'Card', 'Netbanking'].includes(paymentMethod))
    return res.status(400).json({ error: 'Choose a payment method.' });

  const pnr = 'SB' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const booking = {
    pnr, busId, seats, passengers, contact, paymentMethod,
    paymentStatus: 'PAID (demo)',
    status: 'CONFIRMED',
    fare: calcFare(bus.basePrice, seats.length),
    bus: { operator: bus.operator, type: bus.type, from: bus.from, to: bus.to, date: bus.date, departure: bus.departure, arrival: bus.arrival },
    createdAt: new Date().toISOString(),
  };
  const list = readBookings();
  list.push(booking);
  writeBookings(list);
  res.status(201).json(booking);
});

app.get('/api/bookings/:pnr', (req, res) => {
  const b = readBookings().find((x) => x.pnr === req.params.pnr.toUpperCase());
  if (!b) return res.status(404).json({ error: 'No booking found for that PNR.' });
  res.json(b);
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
