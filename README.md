# Bet Hub - Prediction Market Platform

Bet Hub is a modern, full-stack prediction market platform where users can create bets, participate in public or private markets, and manage their finances through a trust-based loan system.

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration with Bcrypt password hashing.
- **Prediction Markets**: Create and join "Public" or "Private" bets.
- **Dynamic Odds**: Real-time parimutuel odds calculation based on current stakes.
- **Loan System**: Apply for loans based on a dynamic **Trust Score** calculated from repayment history.
- **Private Markets**: Invite-only bets accessible via unique invite codes.
- **Engagement**: Commenting and liking system for market discussions.
- **Analytics**: Visual investment graphs (using Recharts) and transaction history tracking.

---

## 🛠️ Architecture

The project follows a decoupled Client-Server architecture:

- **Frontend**: Built with **React 19**, **Vite**, and **TypeScript**. It uses **Tailwind CSS** for styling and **Recharts** for data visualization.
- **Backend**: A high-performance **FastAPI** (Python) server.
- **Database**: **SQLite** for lightweight, persistent storage.
- **Security**: **JWT** (JSON Web Tokens) for session management and **Passlib (Bcrypt)** for secure credential storage.

---

## 📦 Dependencies

### Backend (Python)
- `fastapi`: API Framework.
- `uvicorn`: ASGI Server.
- `passlib[bcrypt]`: Password hashing.
- `PyJWT`: Token generation and verification.
- `sqlite3`: Database engine (standard library).

### Frontend (Node.js)
- `react` & `react-dom`: UI library.
- `react-router-dom`: SPA routing.
- `recharts`: Charting and visualization.
- `vite`: Build tool and dev server.
- `typescript`: Type safety.

---

## 🏃 How to Run

### 1. Backend Setup
Navigate to the root directory:
```bash
pip install fastapi uvicorn passlib bcrypt PyJWT
python main.py
```
*The server will start at `http://localhost:8000`.*

### 2. Frontend Setup
Navigate to the `bet-hub` directory:
```bash
cd bet-hub
npm install
npm run dev
```
*The application will be accessible at `http://localhost:3000`.*

---

## 📡 API Reference

### Authentication
- `POST /register`: Create a new account.
- `POST /login`: Authenticate and receive a JWT token.

### User System (Protected)
- `GET /user/{email}`: Fetch profile details (money, trust, stats).
- `POST /user/loan`: Apply for a loan (validates trust score).
- `POST /user/repay`: Repay outstanding debt.
- `GET /user/{email}/transactions`: View complete audit trail.

### Betting System
- `POST /create-bet`: Initialize a new market (Private bets require 1 'pvt_card').
- `GET /bets`: List all active public markets.
- `POST /join-bet`: Place a stake on an outcome.
- `POST /declare-result`: Creator-led market resolution.
- `POST /close-bet`: Finalize market and trigger payouts.

---

## 🧮 Mathematical Models

### 1. Parimutuel Betting Logic
The platform uses a Parimutuel system where odds are calculated based on the total pool.
- **House Fee**: 5% of the total pool is deducted for platform maintenance.
- **Odds Calculation**: `Odds = (Total Pool * 0.95) / Stake on Outcome`

### 2. Payout Distribution
- **Creator Commission**: The market creator receives **1%** of the total pool upon resolution.
- **Loser Protection**: Losers automatically receive a **40% refund** of their initial stake.
- **Winner Split**: Winners share the remaining **60%** of the "losing pool" proportionally to their bet size.

### 3. Trust Score & Loan Limits
The loan system is governed by a **Trust Score (0 - 1000)**.
- **Formula**: `Trust = (1000 * (0.6 * Repayment_Ratio + 0.4 * Timeliness)) - (150 * Default_Count)`
- **Loan Tiers**:
  - `Score < 50`: Limit $0 (Banned)
  - `50 - 300`: Limit $500
  - `300 - 500`: Limit $1,250
  - `500 - 700`: Limit $2,500
  - `700+`: Limit $5,000 (Maximum)

---

## 🛡️ Data Safety
- **Encryption**: Passwords are never stored as plain text. We use the industry-standard **Blowfish (Bcrypt)** algorithm with a unique salt per user.
- **Sanitization**: All API responses are sanitized to remove sensitive hashes before reaching the browser's developer tools.
- **Security Check**: Every sensitive action is validated against a signed **JWT secret**, ensuring users can only act on their own data.
