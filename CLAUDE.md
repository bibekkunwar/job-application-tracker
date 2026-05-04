# Job Tracker — CLAUDE.md

## Project Overview

A full-stack job application tracker. Users register/login, add job applications (company, role, status, platform, notes, URL), and track interview rounds per application (round type, date, outcome, notes). Authentication is handled by Supabase Auth; the backend proxies all data operations to Supabase PostgreSQL.

Live usage flow: Register → Login → Dashboard (stats + search/filter + job list) → Add Application → Application Detail (edit job, track + edit interview rounds).

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
│   │   ├── jobs.js              # CRUD for job_application table (all 7 fields on PUT)
│   │   └── status.js            # CRUD for application_status (interview rounds)
│   ├── index.js                 # Express app entry, CORS allowlist, route mounting, port 5000
│   ├── package.json
│   ├── .env                     # SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL
│   └── .env.example             # Placeholder env var reference
│
├── frontend/
│   ├── public/                  # Static assets (favicon, icons)
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js          # loginUser, registerUser
│   │   │   └── jobs.js          # getJobs, createJob, updateJob, deleteJob,
│   │   │                        # getStatuses, createStatus, updateStatus, deleteStatus
│   │   │                        # (all functions throw errors with .status = HTTP code)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # user + token state, login, logout,
│   │   │                        # handleUnauthorized (logout + navigate /login on 401)
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx  # Redirects to /login if no token
│   │   │   └── Icons.jsx           # All SVG icons as named exports (no npm icon lib)
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Email/password login
│   │   │   ├── Register.jsx        # Email/password registration
│   │   │   ├── Dashboard.jsx       # Stats cards, search by company, filter by status
│   │   │   ├── AddApplication.jsx  # New job application form
│   │   │   └── ApplicationDetail.jsx  # View/edit job, add/edit/delete interview rounds
│   │   ├── App.jsx              # Route definitions (public + protected)
│   │   └── main.jsx             # Entry — wraps App in BrowserRouter + AuthProvider
│   ├── index.html               # Title: "Job Tracker", favicon: 💼 inline SVG emoji
│   ├── vercel.json              # SPA rewrite: all routes → index.html (fixes 404 on refresh)
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── .env                     # VITE_API_URL
│   └── .env.example             # Placeholder env var reference
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
| `round` | text | `phone screen` \| `technical` \| `HR round` \| `other` |
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
FRONTEND_URL=http://localhost:5173  # added to CORS allowlist alongside localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000
```

> For production, set `FRONTEND_URL` to the deployed frontend URL and `VITE_API_URL` to the deployed backend URL.
> `localhost:5173` is always in the CORS allowlist regardless of `FRONTEND_URL`.

---

## API Endpoints

```
POST   /api/auth/register                      — create account
POST   /api/auth/login                         — login, returns access_token

GET    /api/jobs                   [auth]      — list all jobs for user
POST   /api/jobs                   [auth]      — create job application
GET    /api/jobs/:id               [auth]      — get single job
PUT    /api/jobs/:id               [auth]      — update job (all fields: company_name, role,
                                               status, platform, notes, job_url, date_applied)
DELETE /api/jobs/:id               [auth]      — delete job

GET    /api/jobs/:jobId/status     [auth]      — list interview rounds (returned unsorted; sort client-side)
POST   /api/jobs/:jobId/status     [auth]      — add interview round
PUT    /api/jobs/:jobId/status/:id [auth]      — update interview round
DELETE /api/jobs/:jobId/status/:id [auth]      — delete interview round
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

### General
- **Frontend components:** PascalCase functional components, `.jsx` extension.
- **API layer:** Thin wrapper functions in `src/api/` — one file per resource. Functions accept `token` as first arg for authenticated calls.
- **Auth token:** Stored in `localStorage`, read from context via `useAuth()` on every page.
- **Routing:** Public routes (`/login`, `/register`) are unguarded. All app routes wrap with `<ProtectedRoute>`.
- **Backend routes:** Each resource has its own route file. `requireAuth` middleware is applied per-router, not globally.
- **Error responses:** Backend returns `{ error: <message> }` JSON with appropriate HTTP status codes.

### 401 / Token Expiry Handling
Every API function in `src/api/jobs.js` attaches the HTTP status code to thrown errors via an internal `apiError(data, status)` helper:
```js
const err = new Error(data.error || 'Request failed');
err.status = status;
throw err;
```
Every page catch block checks for 401 before setting error state:
```js
catch (err) {
  if (err.status === 401) { handleUnauthorized(); return; }
  setError(err.message);
}
```
`handleUnauthorized` is provided by `AuthContext` — it calls `logout()` then `navigate('/login')`.

### CORS (Backend)
`backend/index.js` builds an `allowedOrigins` array at startup:
```js
const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
```
Requests with no `Origin` header (curl, Postman, server-to-server) are always passed through.

### Styling — Icons
All icons live in `src/components/Icons.jsx` as inline SVG named exports (no npm icon library). Available exports:
`BriefcaseIcon, SearchIcon, PlusIcon, ChevronRightIcon, ChevronLeftIcon, CalendarIcon, LinkIcon, DocumentTextIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, InboxStackIcon, ArrowRightOnRectangleIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon, CodeBracketIcon, UsersIcon, MapPinIcon, Spinner`

`Spinner` includes `animate-spin` and renders a circular loading indicator.

### Styling — Typography & Font
Inter is loaded via Google Fonts in `index.html`. `index.css` sets:
```css
body { font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
```

### Styling — Interactive Elements
All interactive elements must follow these rules:
- **Every button:** `cursor-pointer transition-colors`
- **Primary (blue) buttons:** `bg-blue-600 hover:bg-blue-700 active:opacity-80`
- **Disabled buttons:** `disabled:bg-blue-300 disabled:cursor-not-allowed`
- **Secondary / cancel buttons:** `border border-gray-200 hover:bg-gray-100 active:bg-gray-200`
- **Destructive buttons:** `text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100`
- **Icon-only buttons:** `p-1.5 rounded-lg hover:bg-<color>-50 transition-colors cursor-pointer`

`ApplicationDetail.jsx` defines shared class constants:
```js
const btnPrimary   = 'flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:opacity-80 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer';
const btnSecondary = 'flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer';
const inputCls     = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors';
```

### Styling — Navbar Pattern
`Dashboard`, `AddApplication`, and `ApplicationDetail` all share a sticky top navbar:
```jsx
<div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
```
- Dashboard navbar: brand left, user avatar + logout right
- AddApplication / ApplicationDetail navbar: back button + divider + brand left, delete button right (ApplicationDetail only)

### Styling — Company Avatar
Deterministic color from company name (same color for same company across pages):
```js
const AVATAR_COLORS = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-indigo-500','bg-pink-500','bg-teal-500'];
function avatarColor(name = '') { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
```
Dashboard uses `w-10 h-10 rounded-xl`; ApplicationDetail uses `w-14 h-14 rounded-2xl`.

### Styling — Back Button Pattern
Both `AddApplication` and `ApplicationDetail` use `ChevronLeftIcon` from Icons.jsx:
```jsx
<button onClick={() => navigate('/')}
  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
  <ChevronLeftIcon className="w-4 h-4" />
  Back
</button>
```

### Styling — Status & Outcome Colors
```
Status:   applied → blue-100/700   | in progress → amber-100/700 | accepted → emerald-100/700
          rejected → red-100/600   | ghosted → gray-100/500
Outcome:  positive → emerald-100/700 | negative → red-100/600 | waiting → amber-100/700
```

### Styling — Form Inputs
All form inputs use `bg-gray-50 focus:bg-white` for a subtle focus transition:
```
border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors
```

---

## Feature Reference

### Dashboard
- Stats row: Total, In Progress, Accepted, Rejected (always counts all jobs, ignores filters)
- Search input filters by `company_name` (case-insensitive substring match)
- Status dropdown filters by exact `status` value; "Clear" button appears when either filter is active
- Clicking a job card navigates to `/applicationdetail/:id`

### ApplicationDetail
- **Job card view:** large company avatar (colored circle, `w-14 h-14 rounded-2xl`), company name + role, status badge, PencilIcon edit button top-right
- **Metadata rows:** CalendarIcon (date applied), MapPinIcon (platform), LinkIcon (job URL, clickable), DocumentTextIcon (notes) — each row has a fixed-width label column
- **Job card edit:** PencilIcon button → inline form with all 7 fields; saves via `PUT /api/jobs/:id`; Spinner on saving
- **Interview rounds:** displayed chronologically by `date` (client-side sort, oldest first)
- **Round display:** numbered blue circle (step indicator), round type with icon (PhoneIcon/CodeBracketIcon/UsersIcon/DocumentTextIcon), outcome badge, date; PencilIcon + TrashIcon appear on row hover (`opacity-0 group-hover:opacity-100`)
- **Add round:** "Add Round" button → inline form (round type, date, outcome, notes); Spinner on saving
- **Edit round:** PencilIcon per row → inline form pre-filled; saves via `PUT /api/jobs/:jobId/status/:id`
- **Delete round:** TrashIcon per row → confirm dialog → `DELETE /api/jobs/:jobId/status/:id`
- **Delete application:** TrashIcon + "Delete" in navbar → confirm dialog → `DELETE /api/jobs/:id` → navigate to dashboard
- **Empty rounds state:** CalendarIcon illustration with prompt text

---

## Known Issues

All previously tracked issues have been resolved:
- ~~Missing `deleteStatus` frontend function~~ — added and wired to TrashIcon per round
- ~~No token refresh / 401 handling~~ — `handleUnauthorized` in `AuthContext` auto-logouts on any 401
- ~~Empty `src/hooks/` and `src/assets/` directories~~ — removed
- ~~Duplicate error display in `Login.jsx`~~ — removed
- ~~`PUT /api/jobs/:id` only accepted 4 fields~~ — now accepts all 7 editable fields
- ~~No inline edit for interview rounds~~ — fully implemented with pre-filled form
- ~~No search or filter on Dashboard~~ — search by company name + filter by status added
- ~~No `updateStatus` in frontend API~~ — added
- ~~Plain unstyled UI~~ — full SaaS-style redesign: Inter font, sticky navbars, company avatars, icon inputs, stat cards with icons, timeline rounds, Spinner loading states across all pages

## TODO

- [ ] Add `render.yaml` for backend deployment to Render

---

## Deployment URLs

| Service | URL |
|---|---|
| Frontend (local) | http://localhost:5173 |
| Backend (local) | http://localhost:5000 |
| Supabase project | https://uuhgehlvlbycqsoctkqx.supabase.co |
| Frontend (prod) | — not deployed |
| Backend (prod) | — not deployed |
