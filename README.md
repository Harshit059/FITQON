# <p align="center"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80" alt="FITQON Logo" width="80" style="border-radius: 16px; margin-bottom: 12px;" /><br>FITQON // ATHLETIC TELEMETRY PROTOCOL</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%20%7C%20Express-black?style=for-the-badge&logo=react&logoColor=%23FACC15&color=%23121214" alt="Stack - React Vite Express" />
  <img src="https://img.shields.io/badge/Gemini_API-AI_Diagnostics-black?style=for-the-badge&logo=google-cloud&logoColor=%23FACC15&color=%23121214" alt="Gemini API" />
  <img src="https://img.shields.io/badge/Engine-TypeScript_5-black?style=for-the-badge&logo=typescript&logoColor=%23FACC15&color=%23121214" alt="TypeScript Engine" />
</p>

---

**FITQON** is a high-fidelity, full-stack biometric performance suite designed for tracking and synthesizing athletic performance telemetry. Powered by React 18, Express, and Google's Gemini models, the application processes real-time workout coefficients, nutritional caloric budgets, and hydration ratios to formulate automated physical optimization advice and downloadable, vector-perfect performance documents.

Designed around a **high-tech dark command interface**, FITQON utilizes precise display typography paired with visual data telemetry charts to present deep performance insights without unwanted clutter.

---

## ⚡ Core Technical Features

### 1. Unified Telemetry Dashboard
- **Dynamic Chronology**: Supports beautiful interactive charts mapping energy expense values, active training time, and water saturation levels.
- **Goal Progression Index**: Monitors calories burnt, exercise volume, and hydration against established personal target coefficients.
- **Biometric Logs Grid**: Highlights chronologically recorded sessions with custom daily rating indices (`Excellent`, `Good`, `Needs Improvement`, etc.) and AI-derived diagnostic verdicts.

### 2. High-Fidelity PDF Export Compilation
- **Intelligent Pagination**: Compiles historical logs into an elegant, formatted A4 vector document featuring dynamic header metrics, diagnostic benchmark comparisons, and structured calendar timelines.
- **Selectable Horizon**: Supports instant switching between **Weekly (7 days)** and **Monthly (30 days)** telemetry frames before compilation.
- **Deterministic Layout**: Built using precise coordinate geometry inside `jsPDF` for pixel-perfect printing/saving.

### 3. Smart Physical Diagnostics (Gemini Engine)
- Synthesizes dietary calorie coefficients, training routines (sets, reps, weight variables), and negative avoidance indicators.
- Automatically delivers structural "Performance Verdicts" pointing out training split deficiencies, dehydration trends, and recovery pacing.

### 4. Permissive "On-the-Fly" Authentication
- **Frictionless Auth**: Eliminates unnecessary registration steps. Any novel credentials entered in the sign-in form are automatically registered on-the-fly.
- **Secure Admin Portal**: Permissive admin gateway that enables structural user log auditing, debug metrics, and user index pruning.

---

## 🛠 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | **React 18** (Vite), **Tailwind CSS**, **Framer Motion** (Animations) |
| **Backend** | **Express.js**, Node.js, Custom Middleware |
| **AI Layer** | **Google Gen AI** SDK (utilizing powerful server-side Gemini models) |
| **PDF Engine** | **jsPDF** for secure, serverless client-side vector compilation |
| **Charts** | **Recharts** (Area, Line, Bar, Responsive Containers) |
| **Icons & Fonts** | **Lucide React**, **Inter**, **Space Grotesk**, & **JetBrains Mono** |

---

## 📁 System Architecture

```text
├── src/
│   ├── components/       # Reusable interactive layout elements and widgets
│   ├── pages/            # View Assemblies
│   │   ├── LandingPage.tsx     # Futuristic portal introduction
│   │   ├── AuthPage.tsx        # Streamlined on-the-fly login node
│   │   ├── UserDashboard.tsx   # Primary telemetry metrics, stats cards, & PDF system
│   │   ├── CheckInForm.tsx     # Wizard-based biometric data collection engine
│   │   ├── AIResultsPage.tsx   # Detailed analysis of Gemini intelligence diagnostics
│   │   ├── AdminDashboard.tsx  # Central developer control panel for managing records
│   │   └── AdminLoginPage.tsx  # Permissive passcode access terminal for admins
│   ├── App.tsx           # Client Router & Global State Gateway
│   ├── index.css         # Custom Tailwind Theme variables and glowing animation presets
│   └── main.tsx          # Application Mounting Point
├── app-server.ts         # REST API Server, Gemini proxy, on-the-fly database engine
├── package.json          # Package manifest & build procedures
└── README.md             # System Documentation
```

---

## 🚀 Native Installation & Local Run

To boot up the unified dev-server locally:

### 1. Clone & Set Up Secrets
Copy your Google Gemini Key into your local configuration:
```bash
git clone https://github.com/your-username/fitqon.git
cd fitqon
```
Create a `.env` file in the root workspace directory as instructed:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
ADMIN_PASSWORD=admin123
```

### 2. Install Package Dependencies
```bash
npm install
```

### 3. Launch Development Protocol
```bash
npm run dev
```
The node environment automatically binds to port `3000` on your network interface. Visit your browser at:
`http://localhost:3000`

---

## 💎 Design and Aesthetics

FITQON leverages premium aesthetic criteria that deviate completely from mock interfaces:
- **Display Typography**: Standardized on **Inter** and **Plus Jakarta Sans** for maximum structural readability, accented by high-contrast headings in **Space Grotesk** and monospace metrics in **JetBrains Mono**.
- **The "Cosmic" Dark Palette**: Deep `#000000` canvas backdrops layered with translucent `#121214` glass panes, framed by glowing **#FACC15** bright yellow athletic coordinates.
- **Tactile Transitions**: Dynamic route entries, micro-hover interactions on buttons, and smooth modal fade effects via `motion/react`.

---

<p align="center">
  Generated by FITQON Unified Systems // 2026 Telemetry Protocol
</p>
