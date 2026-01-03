# GameZone — Backend 

> Modern, secure backend for turn-based multiplayer games built with Node.js, Express, MongoDB and Socket.IO.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment](#environment)
  - [Run](#run)
- [API reference](#api-reference)
- [Realtime (Socket.IO)](#realtime-socketio)
- [Project structure](#project-structure)
- [Testing & troubleshooting](#testing--troubleshooting)
- [Security notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## About

GameZone backend provides authentication (JWT access + refresh), OTP-based password reset via email, persistent user profiles and leaderboards, plus a Socket.IO-based realtime layer to handle multiplayer game sessions and turn logic.

---

## Features 

- Email OTP for password reset
- JWT access + refresh tokens stored in cookies (rotated on refresh)
- Protected endpoints for profile and score updates
- Leaderboard (top 10) and user progress history
- Socket.IO matchmaking and game room management (join, move, draw, checkmate, timeouts)
- HTTPS-capable server with TLS certs

---

## Tech stack 

- Node.js, Express
- MongoDB (mongoose)
- Socket.IO for realtime comms
- JWT for authentication
- Mailtrap (MailtrapTransport) for dev email delivery

---

## Quick start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (Atlas or local)
- (Optional) Mailtrap token for email testing
- TLS certificate files (optional for HTTPS)

### Install

Clone and install dependencies:

```bash
git clone <repo-url>
cd Game-backend
npm install
```

### Environment — `.env` example

Create a `.env` file in the project root. Use `.env.example` as a template.

```env
# MongoDB
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/gamezone

# Server
PORT=3001

# JWT secrets (use secure random values)
ACCESS_TOKEN_SECRETE=your_access_secret
REFRESH_TOKEN_SECRETE=your_refresh_secret

# Mailtrap (for dev emails)
MAILTRAP_TOKEN=your_mailtrap_token
```

> Tip: keep secrets out of source control. Add `.env` to `.gitignore`.

### Run

Development with nodemon:

```bash
npx nodemon server.js
```

Production (example with PM2):

```bash
npm run start
# or using pm2
pm install -g pm2
pm run start
```

---

## API reference

Base URL: `http://localhost:3001/api`

Authentication

- POST `/api/auth/register` — register user
  - Body: `{ name, email, password }`
  - Returns: 200 on success

- POST `/api/auth/login` — login user
  - Body: `{ email, password }`
  - On success: sets cookies `accessToken` (httpOnly) and `jwt` (refresh token)

- POST `/api/auth/refresh-token` — rotates refresh tokens, issues a new access token

- POST `/api/auth/send-otp` — send OTP to email
  - Body: `{ email }`

- POST `/api/auth/verify-otp` — verify OTP
  - Body: `{ email, otp }`

- POST `/api/auth/reset-password` — reset password
  - Body: `{ newPassword, email, otp }` (min 8 characters)

- GET `/api/auth/logout` — clear auth cookies

User

- POST `/api/user/updateProfile` — protected
  - Body: `{ _id, name, image }` — updates profile

- GET `/api/user/getLeaderboard` — returns top 10 users by score

- POST `/api/user/updateScore` — protected
  - Body: `{ id, score }` — increments user score and logs progress

- GET `/api/user/profile` — protected
  - Returns: logged-in user's profile (excludes password)

Authentication middleware expects `accessToken` cookie. Ensure client sends cookies using `credentials: 'include'` (fetch) or `withCredentials: true` (axios).

---

## Realtime (Socket.IO) 

The Socket server matches players by `gameType` from handshake query and manages game rooms and turn timers.

Key events:

- Client connect handshake query: `{ gameType: 'TIC', id: '<userId>' }`
- `join` — payload `{ board, User }` → server pairs players and emits `startGame` when ready
- `move` — payload `{ gameId, board, symbol }` → broadcast to room, reset turn timer
- `reset`, `checkMate`, `Draw` — broadcast accordingly
- `opponentDisconnected`, `turnTimeout` — notifications fired by server

Example (client):

```js
import { io } from 'socket.io-client';
const socket = io('https://localhost:3001', {
  query: { gameType: 'TIC', id: USER_ID }
});

socket.emit('join', { board: initialBoard, User });
```

Turn timeout is 60s by default; server deletes games after a timeout event.

---

## Project structure

```
/ (root)
├─ server.js
├─ app.js
├─ routes/
├─ controllers/
├─ models/
├─ socket/socketManager.js
├─ config/
└─ utils/
```

---

## Testing & troubleshooting 

- Emails not arriving: validate `MAILTRAP_TOKEN` and Mailtrap account.
- HTTPS issues: verify `certs/server-key.pem` and `certs/server-cert.pem` exist and are readable.
- Cookie/auth issues: check `SameSite` and `Secure` flags on cookies and client `credentials` settings.

---

## Security notes 

- Use strong, unique values for JWT secrets and keep them out of source control.
- Use HTTPS in production.
- Rotate refresh tokens and validate cookie scopes.

---

## Contributing 

Contributions are welcome: fork → feature branch → PR. Please include tests and update docs where relevant.

---

## License

MIT. See `LICENSE` for details.

---


