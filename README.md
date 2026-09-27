# AI Trade Helper - Separated Fullstack Architecture

An AI-powered chart screenshot analysis assistant providing explainable technical analysis, multi-timeframe scenarios, pattern detection, and interactive chart Q&A.

---

## Architecture Overview

The project is structured as a decoupled fullstack application with separated **Frontend** and **Backend**:

```
Tread-Helper/
├── backend/                  # Node.js + Express REST API Server
│   ├── src/
│   │   ├── server.ts         # Express server with CORS & API endpoints
│   │   ├── services/
│   │   │   └── geminiService.ts # Gemini 2.5/2.0 Vision AI analysis & chart chat
│   │   └── types/
│   │       └── index.ts      # Backend data types and API contracts
│   ├── .env.example          # Backend environment template
│   ├── package.json          # Server dependencies & scripts
│   └── tsconfig.json         # Backend TypeScript configuration
│
├── frontend/                 # React 19 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/       # UI components (ChartAnnotator, MultiTimeframe, etc.)
│   │   ├── data/             # Demo charts and sample data
│   │   ├── utils/            # Alert store & utilities
│   │   ├── types.ts          # Frontend data models & API contracts
│   │   ├── App.tsx           # Main application view
│   │   ├── main.tsx          # React DOM entrypoint
│   │   └── index.css         # Tailwind & custom design styles
│   ├── index.html            # Vite HTML template
│   ├── vite.config.ts        # Vite configuration with /api reverse proxy
│   ├── .env.example          # Frontend environment template
│   ├── package.json          # Client dependencies & scripts
│   └── tsconfig.json         # Frontend TypeScript configuration
│
├── package.json              # Monorepo orchestration scripts
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher; recommended v20+)
- **npm** (v9 or higher)

### 2. Configure Environment Variables
Copy the backend environment example and set your Gemini API key:
```bash
# In backend/
cp backend/.env.example backend/.env
```
Open `backend/.env` and insert your Gemini API Key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install All Dependencies
You can install dependencies for root, backend, and frontend with a single command from the project root:
```bash
npm run install:all
```

---

## Running the Application

### Option A: Run Both Together (Recommended)
Run both the Backend (Express on port `5000`) and Frontend (Vite on port `5173`) concurrently:
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- The frontend dev server automatically proxies `/api/*` requests directly to `http://localhost:5000`.

### Option B: Run Individually

**Backend only:**
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`. Test health: `http://localhost:5000/api/health`.

**Frontend only:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend health check & API key status |
| `POST` | `/api/analyze-chart` | Analyze single chart screenshot via Gemini Vision |
| `POST` | `/api/chart/chat` | Contextual Q&A on analyzed chart |
| `POST` | `/api/analyze-chart/multi-timeframe` | Multi-timeframe synthesis (at least 2 charts) |
| `POST` | `/api/analysis/compare` | Compare prior analysis against newly uploaded chart |
| `GET` | `/api/analyses` | Retrieve analysis history |
| `GET` | `/api/watchlist` | Retrieve watchlist items |
| `POST` | `/api/feedback` | Submit analysis helpfulness rating & feedback |

---

## Production Build

```bash
# Build both frontend and backend:
npm run build

# Or individually:
npm run build:backend
npm run build:frontend
```
