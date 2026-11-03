# 🚌 BusBuddy – Smart Bus Booking & Travel Experience Platform

A full-stack bus booking app: search buses, pick seats on a live seat map, enter passenger details,
pay (simulated), and get a confirmation with a PNR you can look up later.

**Stack:** React (Vite) · Node.js · Express · JSON file storage (easy to swap for MongoDB/SQL)

## Run in VS Code

Prerequisite: Node.js 18.11+ (`node -v`).

```bash
# 1. open the folder in VS Code, then open the terminal (Ctrl + `)
npm run install:all      # installs root, server and client dependencies
npm run dev              # starts API (port 5000) + React app (port 5173)
```

Open http://localhost:5173

Or run them separately in two terminals:
```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Features
- Bus search by route + date, filter (AC only), sort (price, rating, fastest, departure)
- **Transparent pricing**: all-inclusive price on the card, itemised fare (base + GST + fee) at every step
- Interactive seat map (max 6 seats), booked seats can't be selected, double-booking blocked on the server
- **Accessibility**: skip link, keyboard-friendly seat map, ARIA labels, seat states use symbols (not just colour),
  dark mode, large-text mode, high-contrast mode, reduced motion
- **Simple navigation**: step indicator, click a completed step to go back, state is preserved
- Passenger + contact validation, mock payment, printable ticket, PNR lookup

## Project structure
```
server/index.js          REST API (buses, seats, bookings)
server/data/             bookings.json is created automatically
client/src/App.jsx       step flow + accessibility settings
client/src/components/   Stepper, SearchForm, BusList, SeatMap, Checkout, FareSummary, Confirmation
client/src/styles.css    design tokens + reusable component styles
```

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/cities | list of cities |
| GET | /api/buses?from=&to=&date= | search buses |
| GET | /api/buses/:id/seats | seat layout + booked seats |
| POST | /api/bookings | create booking |
| GET | /api/bookings/:pnr | look up booking |

## Ideas to extend
- Replace JSON storage with MongoDB (Mongoose) or SQL
- Add login (JWT) and "My trips"
- Cancel/refund flow, seat hold timer, ladies-only seats
- Real payment gateway (Razorpay test mode)
