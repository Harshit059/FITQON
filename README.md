<div align="center">

<img src="https://img.shields.io/badge/FITQON-Track.%20Analyse.%20Improve.-FACC15?style=for-the-badge&labelColor=0a0a0a" height="32"/>

<br/><br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/license-MIT-FACC15?style=flat-square&labelColor=0a0a0a)](./LICENSE)

<br/>

**AI-powered daily health tracker.**  
Log your workout + diet → get a Gemini-generated health report, rating & 7-day roadmap.

![preview](./docs/preview.png)

</div>

---

## ✦ Features

- 🏋️ Workout logger — sets, reps, weight, intensity
- 🥗 Diet logger — meals, avoided foods, water intake
- 🤖 Gemini AI report — daily rating, tips & improvement roadmap
- 📊 Admin dashboard — charts, user management, PDF/CSV export
- 🔐 JWT auth — protected user & admin routes

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/fitqon.git

cd client && npm install
cd ../server && npm install

cp server/.env.example server/.env   # add your keys

cd server && npm run dev   # :5000
cd client && npm run dev   # :3000
```

**Required `.env` keys:** `MONGODB_URI` · `JWT_SECRET` · `GEMINI_API_KEY` · `ADMIN_EMAIL` · `ADMIN_PASSWORD`

---

## 🛠 Stack

React 18 · Vite · TypeScript · Tailwind · Framer Motion · Express · MongoDB · Gemini API · Recharts · jsPDF

---

MIT © FITQON
