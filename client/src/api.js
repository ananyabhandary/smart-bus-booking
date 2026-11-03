const j = async (r) => {
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Something went wrong. Please try again.');
  return d;
};

export const getCities = () => fetch('/api/cities').then(j);
export const searchBuses = (from, to, date) =>
  fetch(`/api/buses?${new URLSearchParams({ from, to, date })}`).then(j);
export const getSeats = (id) => fetch(`/api/buses/${id}/seats`).then(j);
export const createBooking = (body) =>
  fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(j);
export const getBooking = (pnr) => fetch(`/api/bookings/${encodeURIComponent(pnr)}`).then(j);
