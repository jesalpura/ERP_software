# TCIT ERP — Talent Computer Institute Technology

> A full-featured Enterprise Resource Planning (ERP) system for educational institutions — built with React + Vite, Supabase, and designed for Web, Android & iOS via Capacitor.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Backend / Auth | Supabase (PostgreSQL + Row Level Security) |
| PDF Generation | @react-pdf/renderer + pdf-lib |
| Excel Export | SheetJS (xlsx) |
| Mobile (upcoming) | Capacitor v6 (Android + iOS) |
| State Management | React Context API |

---

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready, stable releases only |
| `develop` | Active development integration |
| `feature/*` | New ERP features (web + mobile compatible) |
| `mobile/capacitor` | Capacitor native setup, Android/iOS configs & plugins |
| `hotfix/*` | Critical production bug fixes |
| `release/*` | Release candidates before merging to `main` |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Login page & authentication
│   ├── common/         # Shared UI (ErrorBoundary, SiteLogo, CalendarLoader)
│   ├── dashboards/     # Role-based dashboards (Admin, Faculty, Student, Finance)
│   ├── modals/         # Register student, Collect fee, Receipt, Notice modals
│   ├── pdf/            # PDF components (@react-pdf/renderer)
│   └── views/          # Feature views (Settings, Certificates, Calendar, etc.)
├── config/             # Site configuration (branding, constants)
├── context/            # React Context providers (SiteConfigContext)
├── data/               # Mock/seed data
├── lib/                # Supabase client
└── services/           # Business logic (erpService, pdfLibService)
```

---

## 🛠 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/jesalpura/ERP_software.git
cd ERP_software

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
```

### Environment Variables

Create a `.env.local` file (never commit this):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Running Locally

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 👤 Role-Based Access

| Role | Email Pattern | Access |
|------|--------------|--------|
| Admin | `*admin*@...` | Full system control |
| Faculty | `*faculty*@...` | Schedule, attendance |
| Student | `*student*@...` | View grades, fee status |
| Finance | `*finance*@...` | Fee collection, ledgers |

---

## 📱 Mobile Development (Capacitor)

> Mobile development is planned on the `mobile/capacitor` branch.

```bash
# Switch to mobile branch
git checkout mobile/capacitor

# Install Capacitor (already in package.json on that branch)
npm install

# Build web first
npm run build

# Sync to native platforms
npx cap sync

# Open in Android Studio
npx cap open android
```

### Mobile-Specific Package Scripts

```json
"mobile:sync":    "npm run build && npx cap sync",
"mobile:android": "npm run build && npx cap sync && npx cap open android",
"mobile:ios":     "npm run build && npx cap sync && npx cap open ios"
```

---

## 📦 Key Dependencies

```json
"@react-pdf/renderer": "^4.9.0",
"@supabase/supabase-js": "^2.117.0",
"pdf-lib": "^1.17.1",
"xlsx": "latest",
"lucide-react": "^1.47.0",
"tailwindcss": "^4.3.3"
```

---

## 🔒 Security Notes

- `.env.local` is **gitignored** — never commit Supabase keys
- Supabase Row Level Security (RLS) must be enabled on all tables
- All role assignments are validated server-side via `user_metadata`

---

## 📄 License

Private — Talent Computer Institute Technology © 2025. All rights reserved.
