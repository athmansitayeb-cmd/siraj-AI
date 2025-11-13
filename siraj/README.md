# Siraj — Minimal Auth + Admin (Termux-ready)

Quick start:
1. Unzip the package: `unzip siraj.zip` (or if already in folder, skip)
2. Copy `.env.example` to `.env` and set `MONGO_URI` (use your Atlas connection string).
3. Install dependencies: `npm install`
4. Optionally reset & upgrade your admin user:
   `node resetAndUpgradeAdmin.js`
5. Run dev server: `npm run dev`
6. Test register/login:
   - Register:
     `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"t@test.com","password":"123456"}'`
   - Login:
     `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"t@test.com","password":"123456"}'`
   - Get profile (use token from login):
     `curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/auth/profile`
