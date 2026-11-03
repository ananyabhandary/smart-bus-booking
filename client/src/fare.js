export const inr = (v) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const fare = (base, n, p) => {
  const subtotal = base * n;
  const gst = Math.round(subtotal * p.gstRate * 100) / 100;
  const fee = p.feePerSeat * n;
  return { subtotal, gst, fee, total: Math.round((subtotal + gst + fee) * 100) / 100 };
};

export const duration = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
