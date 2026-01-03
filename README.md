# Game Backend (GameZone)

**A simple Node.js + Express backend for a multiplayer game with authentication, OTP-based password reset, leaderboards, and Socket.IO real-time game logic.**

---

##  Features

- User registration & login (JWT access + refresh tokens in cookies)
- OTP-based password reset (email via Mailtrap)
- Leaderboard & user profile management
- Score update & progress history
- Real-time multiplayer game with Socket.IO (join, move, reset, checkmate, draw, timeouts)
- HTTPS-ready (uses certs from `certs/`)

---

##  Tech stack

- Node.js, Express
- MongoDB (mongoose)
- Socket.IO
- JWT for auth
- Mailtrap (via `mailtrap` transport) for OTP emails
- Nodemon (dev)

---

##  Quickstart

### Prerequisites

- Node 18+ / npm
- MongoDB accessible via connection string
- (Optional) Mailtrap token for sending OTP emails
- Self-signed or real TLS certs if you want HTTPS (place in `certs/` as `server-key.pem` & `server-cert.pem`)

### Install

```bash
npm install
```

### Environment (.env) — example

Create a `.env` file in project root with the values below:

```
MONGODB_URL=your_mongodb_connection_string
PORT=3001
ACCESS_TOKEN_SECRETE=your_access_token_secret
REFRESH_TOKEN_SECRETE=your_refresh_token_secret
MAILTRAP_TOKEN=your_mailtrap_token

```

> Note: OTP documents expire after 600 seconds (10 minutes).

### Run (development)

Start with node or nodemon (dev):

```bash
node server.js
# or with nodemon
npx nodemon server.js
```

The server will start on `PORT` (default 3001).

---

##  API Overview

Base URL: `http://localhost:3001/api`

### Authentication routes (`/api/auth`)

- POST `/register`
  - Body: `{ name, email, password }`
  - Response: Registers a new user.

- POST `/login`
  - Body: `{ email, password }`
  - Response: Sets two cookies (`accessToken` and `jwt`) and returns user info

- POST `/refresh-token`
  - Uses cookie `jwt` (refresh token). Rotates refresh token and issues new `accessToken` cookie.

- POST `/send-otp`
  - Body: `{ email }`
  - Sends OTP to email (Mailtrap configured), stores OTP in DB (expires after 10 minutes)

- POST `/verify-otp`
  - Body: `{ email, otp }` — verify OTP

- POST `/reset-password`
  - Body: `{ newPassword, email, otp }` — change password (min length 8)

- GET `/logout`
  - Clears refresh and access cookies

### User routes (`/api/user`)

- POST `/updateProfile` (protected)
  - Body: `{ name, image, _id }` — update user name and image

- GET `/getLeaderboard`
  - Returns top 10 users sorted by score

- POST `/updateScore` (protected)
  - Body: `{ id, score }` — increments user score and records progress

- GET `/profile` (protected)
  - Returns currently logged-in user's profile (access token must be present as cookie)

> Protected routes require a valid `accessToken` cookie. The middleware looks for `req.cookies.accessToken`.

---

## 🔌 Socket.IO (Realtime) — `socket/socketManager.js`

Important events handled by the server:

- Client connect:
  - Pass query params in handshake: `gameType` (e.g., `TIC`), and `id` (user id).
  - Example connect: `io('https://your-server', { query: { gameType: 'TIC', id: userId } })`

- `join` → payload `{ board, User }`
  - Server pairs players by `gameType`, assigns symbols (X/O or custom), and emits `startGame` when two players are present.

- `move` → payload `{ gameId, board, symbol }`
  - Server broadcasts `move` to the room and resets per-turn timer.

- `reset` → payload `{ gameId, board }` — resets board and emits `reset`.

- `checkMate` → payload `{ gameId, turn, winner }` — emits `checkMate`.

- `Draw` → payload `{ gameId, turn }` — emits `Draw`.

- `opponentDisconnected` — emitted when a player disconnects.

- `turnTimeout` — emitted when a player loses by timeout (server deletes the game after timeout).

- Turn timer: 60 seconds per turn; server enforces with a timeout and clears on `move`.

### Example client (socket.io-client)

```js
import { io } from 'socket.io-client';
const socket = io('https://localhost:3001', { query: { gameType: 'TIC', id: USER_ID } });

socket.emit('join', { board: initialBoard, User: { _id: USER_ID, name: 'Player' } });

socket.on('startGame', data => console.log('Game start', data));
socket.on('move', data => console.log('Move', data));
```

---

##  Testing & Troubleshooting

- If emails don't arrive: ensure `MAILTRAP_TOKEN` is set and valid.
- If HTTPS fails: verify cert files exist in `certs/server-key.pem` and `certs/server-cert.pem`. You can switch to plain HTTP by using `http.createServer(app)` instead of providing TLS options.
- Cookies: front-end must use `credentials: 'include'` (fetch) or `withCredentials: true` (axios) to send cookies.

---

##  Security Notes

- Use strong secrets for `ACCESS_TOKEN_SECRETE` and `REFRESH_TOKEN_SECRETE`.
- Use HTTPS in production and set proper cookie flags (HttpOnly, Secure, SameSite) as already done in code.
- Refresh tokens are stored per-user and rotated on use; expired tokens are purged on rotation failures.

---

##  Project structure (important files)

- `server.js` — entry point
- `app.js` — Express app, CORS, routes
- `routes/` — `authRoutes.js`, `userRoutes.js`
- `controllers/` — controllers for auth & user
- `models/` — `User.js`, `Otp.js`, `Game.js` (if present)
- `socket/socketManager.js` — socket logic
- `config/` — `database.js`, `nodemailer.js`
- `utils/` — `sendMail.js`, `token.js`

---

##  Contributing

- Fork, create a feature branch, write tests, and open a PR.
- Add or update documentation here as the API evolves.

---

##  License

MIT (or add the preferred license)

---

If you'd like, I can also add example Postman collection snippets or a sample `.env.example` file. 
