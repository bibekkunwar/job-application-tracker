# Job Tracker — CLAUDE.md

## Project Overview

A full-stack job application tracker. Users register/login, add job applications (company, role, status, platform, notes, URL), and track interview rounds per application (round type, date, outcome, notes). Authentication is handled by Supabase Auth; the backend proxies all data operations to Supabase PostgreSQL.

Live usage flow: Register → Login → Dashboard (stats + job list) → Add Application → Application Detail (interview round tracking).

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| React Router | 7.x | Client-side routing |
| Tailwind CSS | 4.x | Utility-first styling |
| Vite | 8.x | Dev server and build tool |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | 5.x | HTTP server and routing |
| Supabase JS SDK | 2.x | Database + Auth client |
| CORS | 2.x | Cross-origin request handling |
| dotenv | 17.x | Environment variable loading |
| nodemon | — | Dev hot reload |

### Infrastructure
- **Database + Auth:** [Supabase](https://supabase.com) (PostgreSQL with Row Level Security)
- **Auth strategy:** Supabase email/password auth → JWT access tokens stored in `localStorage`

---

## Folder Structure

```
job-tracker/
├── backend/
│   ├── config/
│   │   └── supabase.js          # Supabase client (service key)
│   ├── middleware/
│   │   └── auth.js              # requireAuth — verifies Bearer JWT via Supabase
│   ├── routes/
│   │   ├── auth.js              # POST /api/auth/register, /api/auth/login
│   │   ├── jobs.js              # CRUD for job_application table
│   │   └── status.js            # CRUD for application_status (interview rounds)
│   ├── index.js                 # Express app entry, CORS, route mounting, port 5000
│   ├── package.json
│   └── .env                     # SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL
│
├── frontend/
│   ├── public/                  # Static assets (favicon, icons)
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js          # loginUser, registerUser
│   │   │   └── jobs.js          # getJobs, createJob, updateJob, deleteJob, getStatuses, createStatus, updateStatus, deleteStatus
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # user + token state, login/logout, localStorage persistence
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx  # Redirects to /login if no token
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx    # Stats cards + search/filter + job application list
│   │   │   ├── AddApplication.jsx
│   │   │   └── ApplicationDetail.jsx  # Job details + interview round tracking
│   │   ├── App.jsx              # Route definitions (public + protected)
│   │   └── main.jsx             # Entry — wraps App in BrowserRouter + AuthProvider
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .env                     # VITE_API_URL
│
└── CLAUDE.md
```

---

## Database Schema (Supabase PostgreSQL)

### `job_application`
| Column | Type | Notes |
|---|---|---|
| `job_id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | FK → Supabase Auth users |
| `company_name` | text | Required |
| `role` | text | Required |
| `status` | text | `applied` \| `in progress` \| `accepted` \| `rejected` \| `ghosted` |
| `platform` | text | `LinkedIn` \| `Seek` \| `Indeed` \| `Company Website` \| `Other` |
| `notes` | text | Optional |
| `job_url` | text | Optional |
| `date_applied` | date | Required |

### `application_status`
| Column | Type | Notes |
|---|---|---|
| `app_id` | uuid (PK) | Auto-generated |
| `job_id` | uuid | FK → `job_application.job_id` |
| `round` | text | `phone screen` \| `technical` \| `HR` \| `other` |
| `date` | date | Interview date |
| `round_status` | text | `positive` \| `negative` \| `waiting` |
| `notes` | text | Optional |

---

## Environment Variables

### Backend (`backend/.env`)
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<service_role JWT>
PORT=5000                          # optional, defaults to 5000
FRONTEND_URL=http://localhost:5173  # used for CORS origin
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000
```

> For production, set `FRONTEND_URL` to the deployed frontend URL and `VITE_API_URL` to the deployed backend URL.

---

## API Endpoints

```
POST   /api/auth/register                    — create account
POST   /api/auth/login                       — login, returns access_token

GET    /api/jobs                 [auth]      — list all jobs for user
POST   /api/jobs                 [auth]      — create job application
GET    /api/jobs/:id             [auth]      — get single job
PUT    /api/jobs/:id             [auth]      — update job
DELETE /api/jobs/:id             [auth]      — delete job

GET    /api/jobs/:jobId/status   [auth]      — list interview rounds
POST   /api/jobs/:jobId/status   [auth]      — add interview round
PUT    /api/jobs/:jobId/status/:id [auth]    — update interview round
DELETE /api/jobs/:jobId/status/:id [auth]    — delete interview round
```

All `[auth]` routes require `Authorization: Bearer <token>` header.

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev        # starts nodemon on port 5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev        # starts Vite on port 5173
```

---

## Coding Conventions

- **Frontend components:** PascalCase functional components, `.jsx` extension.
- **API layer:** Thin wrapper functions in `src/api/` — one file per resource (`auth.js`, `jobs.js`). Functions accept `token` as first arg for authenticated calls.
- **Auth token:** Stored in `localStorage` under a key managed by `AuthContext`. Every page reads it from context via `useAuth()`.
- **Routing:** Public routes (`/login`, `/register`) are unguarded. All app routes wrap with `<ProtectedRoute>`.
- **Styling:** Tailwind utility classes only — no separate CSS files. Status colors: blue = in progress, green = accepted, red = rejected, gray = ghosted/applied.
- **Backend routes:** Each resource has its own route file. Auth middleware (`requireAuth`) is applied per-router, not globally.
- **Error responses:** Backend returns `{ error: <message> }` JSON with appropriate HTTP status codes.

---

## Known Issues & TODO

### Known Issues
- ~~`updateJob` in `frontend/src/api/jobs.js` is defined but there is no `deleteStatus` (delete interview round) API call~~ — fixed: `deleteStatus` added and wired to delete button on each round.
- ~~Token is stored only in `localStorage`; there is no token refresh logic~~ — fixed: `handleUnauthorized` in `AuthContext` auto-logouts and navigates to `/login` on any 401.
- ~~`src/hooks/` and `src/assets/` are empty placeholder directories~~ — removed.

### TODO
- [x] Add `deleteStatus` function to `frontend/src/api/jobs.js`
- [x] Add token expiry detection — `handleUnauthorized` in `AuthContext` auto-logouts on 401
- [x] Add edit functionality for job application fields on `ApplicationDetail` page
- [x] Add inline edit for each interview round on `ApplicationDetail` (pre-filled form, save via `updateStatus`)
- [x] Interview rounds sorted chronologically (oldest first) on `ApplicationDetail`
- [x] Add search (by company name) and filter (by status) to the Dashboard job list
- [x] Add `updateStatus` to frontend API layer (`frontend/src/api/jobs.js`)
- [x] Add `vercel.json` to frontend for SPA rewrite (fixes 404 on page refresh in Vercel)
- [ ] Add `render.yaml` for backend deployment
- [x] Add loading and error states consistently across all pages (fixed duplicate error in Login, added 401 handling to Dashboard and AddApplication)
- [x] Write `.env.example` files for both `backend/` and `frontend/`

---

## Deployment URLs

No deployment configuration exists yet. The app runs locally only.

| Service | URL |
|---|---|
| Frontend (local) | http://localhost:5173 |
| Backend (local) | http://localhost:5000 |
| Supabase project | https://uuhgehlvlbycqsoctkqx.supabase.co |
| Frontend (prod) | — not deployed |
| Backend (prod) | — not deployed |
