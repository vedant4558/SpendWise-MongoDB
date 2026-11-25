# SpendWise — MongoDB Edition

This ZIP contains the SpendWise React frontend and an Express/MongoDB backend. The project files are directly in this folder; there is no nested `SpendWise/SpendWise` directory.

## Requirements
- Node.js 18+ (Node.js 20 LTS recommended)
- npm
- A MongoDB Atlas account and an available cluster

## 1. Configure MongoDB Atlas
1. Open your existing MongoDB Atlas project and cluster.
2. Under **Database Access**, create or select a database user and note its password.
3. Under **Network Access**, allow your current IP address. For a temporary college demo only, Atlas also offers `0.0.0.0/0`; this allows connections from anywhere and is less secure.
4. In **Database > Connect > Drivers**, copy the Node.js connection string.
5. Replace the username/password placeholders in the connection string. URL-encode special characters in the password (for example `@` becomes `%40`). Do not share your password or commit `.env`.

## 2. Create the backend environment file
From the project root in PowerShell:

```powershell
Copy-Item .\server\.env.example .\server\.env
```

Open `server/.env` and set:
- `MONGODB_URI` — your Atlas connection string. Use a database name such as `spendwise` in the path before `?`, e.g. `...mongodb.net/spendwise?retryWrites=true&w=majority`.
- `JWT_SECRET` — a random secret of at least 32 characters. Example generation in PowerShell:
  ```powershell
  [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
  ```
- `CLIENT_URL=http://localhost:5173` (if Vite starts on another port, update this to match).

## 3. Install and run
Open the terminal in the folder containing the root `package.json` and run:

```powershell
npm install
npm run install:all
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. The API runs at `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

If Vite uses a different port (for example 5174), change `CLIENT_URL` in `server/.env` to that exact origin, then restart the server.

## What is stored in MongoDB
- User accounts (passwords are hashed with bcrypt)
- Transactions
- Spending limits / budgets
- Savings goals
- Recurring transaction schedules
- Bill reminders

Every finance record is associated with its signed-in user. API endpoints require a valid JWT and users cannot read or change another user's records.

## Existing Local-only data
This is a backend conversion. The existing Local-only version stored its accounts and entries in browser LocalStorage. This MongoDB edition does **not automatically import** that browser data. Create a new account in this edition. Keep the old Local-only copy until you have checked whether you need to export any records.

## Notes
- New accounts start with empty records and ₹0; no fake sample transactions are inserted.
- Recurring entries remain schedules; this app does not automatically create future transactions.
- Bill reminders are displayed in the app; email/push notifications are not configured.
- CSV export remains available; PDF export is not included.
- Keep `server/.env` private. Never put the MongoDB URI or JWT secret in the React client.
