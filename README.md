# 🚀 AlgoVerse — AI-Powered Placement Readiness Platform

![CI](https://github.com/Vikky-Verma/AI-Resume-Analyser/actions/workflows/ci.yml/badge.svg)

> A full-stack placement-readiness platform — resume analysis, ATS scoring, career roadmaps, job-match scoring, mock interviews, DSA progress tracking, application tracking, and a portfolio builder — for **any professional domain**, not just software.

🔗 **Live Demo:** [ai-resume-analyser-chi-ten.vercel.app](https://ai-resume-analyser-chi-ten.vercel.app)
🔗 **Backend API:** [ai-resume-analyser-backend-rllt.onrender.com](https://ai-resume-analyser-backend-rllt.onrender.com)
🔗 **GitHub:** [github.com/Vikky-Verma/AI-Resume-Analyser](https://github.com/Vikky-Verma/AI-Resume-Analyser)

---

## 📸 Features

- 🔐 **Authentication** — JWT-based register/login, password strength enforced via Zod, rate-limited against brute force
- 📄 **Resume Upload & Parsing** — PDF/DOCX, stored on Cloudinary, text + embedded-link extraction
- 🧠 **AI Resume Analysis** — 6-dimension scoring (Impact, Domain Depth, Structure, Completeness, Keywords, Career Narrative) via Cloudflare Workers AI (Llama 3.1 70B)
- 🎯 **ATS Score** — Compatibility score with itemized deductions
- 💼 **Job Description Matching** — Match a resume against any JD, see gaps
- 🗺️ **Career Roadmap Generator** — Domain-specific, timeframe-based learning path
- 🧩 **Project Intelligence** — Analyzes listed projects, suggests improvements
- 🎤 **Mock Interviews** — HR / Technical / DSA round simulation with AI feedback
- 📈 **DSA & Progress Tracking** — Track problem-solving progress over time
- 📋 **Application Tracker** — Track job applications end-to-end
- 🧱 **Resume Builder** — Build a resume from structured input
- 🌐 **Portfolio Builder** — Auto-generate a portfolio from an existing resume
- 🏢 **Company Prep** — Company-specific interview prep tracking
- 📥 **PDF Report Export** — Download a full analysis report

---

## 🔒 Security & Engineering Practices

This project went through a deliberate security-hardening pass — not just feature-building:

- **Access control** — Found and fixed broken object-level authorization (IDOR) across every resource-by-id endpoint (analysis, ATS, career, PDF report, projects, roadmap, resume parsing). Centralized into a single `getOwnedResume()` helper instead of repeating the check per controller. Covered by automated tests.
- **Input validation** — Zod schemas on auth routes (email format, password complexity) instead of trusting raw request bodies.
- **Rate limiting** — IP-based limiting on `/register` and `/login` to blunt credential stuffing and spam registration.
- **Secrets & data hygiene** — Purged accidentally-committed user resume files from full git history (not just the working tree); static file serving replaced with an ownership-checked route, then removed entirely once storage fully moved to Cloudinary.
- **Centralized error handling** — All errors flow through one `AppError` + `errorHandler` middleware; operational errors return clean messages, unexpected errors are logged server-side without leaking stack traces to clients.
- **Automated testing** — Jest + Supertest suite covering registration/login validation and the IDOR fix, with Prisma mocked so tests run without a live database. `app.js`/`index.js` are split specifically to make this possible.
- **CI** — GitHub Actions runs the full test suite on every push and pull request against `main`.
- **Dependency hygiene** — Resolved all `npm audit` findings reachable from the actual runtime path (Cloudinary SDK, pdfjs-dist), including two deliberate major-version upgrades, each manually verified against the upload/parse/delete flows before merging.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js + Vite | Frontend framework |
| Tailwind CSS | Styling |
| React Router v6 | Navigation |
| Axios | API calls |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Backend server |
| Prisma ORM | Database ORM |
| PostgreSQL (Neon) | Database |
| JWT + bcrypt | Authentication |
| Zod | Request validation |
| express-rate-limit | Auth rate limiting |
| Multer + Cloudinary | File upload & storage |
| pdf-parse + pdfjs-dist | PDF text & link extraction |
| Mammoth | DOCX text extraction |
| PDFKit | PDF report generation |
| Jest + Supertest | Testing |

### AI Services
| Service | Purpose |
|---|---|
| Cloudflare Workers AI (Llama 3.1 70B) | Resume analysis, scoring, suggestions, roadmap generation, mock interview feedback |

### Deployment & CI
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Neon | PostgreSQL database |
| Cloudinary | File storage |
| GitHub Actions | CI — automated tests on every push/PR |

---

## 📁 Project Structure

```
AI-Resume-Analyser/
├── .github/workflows/ci.yml
├── frontend/
│   └── src/
│       ├── api/axios.js
│       ├── components/        # Navbar, ScoreCard, SkillBadge, ProtectedRoute
│       ├── context/AuthContext.jsx
│       └── pages/              # Login, Register, Dashboard, ResumeDetail,
│                                # MockInterviewSetup, InterviewRoom, InterviewReport
│
├── backend/
│   ├── controllers/            # 14 controllers — resume, analysis, ATS, career,
│   │                            # roadmap, project, interview, DSA, application,
│   │                            # portfolio, builder-resume, company-prep, progress, PDF
│   ├── routes/                 # one route file per controller
│   ├── services/                # AI analysis, career, ATS, roadmap, interview,
│   │                            # portfolio, PDF generation, etc.
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js     # global error handler
│   │   ├── rateLimiter.js      # auth rate limiting
│   │   ├── uploadMiddleware.js # Cloudinary storage config
│   │   └── validate.js         # generic Zod validation middleware
│   ├── validators/
│   │   └── authValidator.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── asyncHandler.js
│   │   ├── getOwnedResume.js   # centralized ownership check (IDOR fix)
│   │   ├── pdfParser.js
│   │   ├── docxParser.js
│   │   └── prisma.js
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   └── access-control.test.js
│   ├── prisma/schema.prisma
│   ├── app.js                  # Express app (testable, no .listen())
│   ├── index.js                 # entry point — connects DB, starts server
│   └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Vikky-Verma/AI-Resume-Analyser.git
cd AI-Resume-Analyser
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your actual values
```

Run migrations and start:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

Backend runs at `http://localhost:8000`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 4. Run tests

```bash
cd backend
npm test
```

---

## 🔌 API Endpoints (core)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (validated, rate-limited) |
| POST | `/api/auth/login` | Login (rate-limited) |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload resume (PDF/DOCX) |
| GET | `/api/resume/my-resumes` | List your resumes |
| POST | `/api/resume/parse/:resumeId` | Extract text (ownership-checked) |
| DELETE | `/api/resume/:id` | Delete resume (ownership-checked) |

### Analysis / ATS / Career / Roadmap / Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analysis/:resumeId` | AI resume analysis |
| POST | `/api/ats/:resumeId` | ATS compatibility score |
| GET | `/api/career/:resumeId` | Career advice |
| POST | `/api/career/match/:resumeId` | Match against a job description |
| POST | `/api/roadmap/:resumeId` | Generate a learning roadmap |
| POST | `/api/projects/:resumeId` | Project intelligence report |
| GET | `/api/report/:resumeId` | Download PDF report |

*(Interview, DSA, application, portfolio, and progress endpoints follow the same pattern — see `routes/` for the full list.)*

All resume-scoped endpoints above verify the resume belongs to the authenticated user before returning data.

---

## 🧠 AI Analysis — How It Works

```
Resume Upload (PDF/DOCX) → Cloudinary
         ↓
   Text Extraction (pdf-parse / mammoth)
         ↓
   Domain Detection
         ↓
   Cloudflare Workers AI (Llama 3.1 70B)
         ↓
   ATS Score · Resume Score · Skills · Missing Skills
   Suggestions · Career Roadmap · Job Match Score
```

Supports Software, Electronics, Mechanical/Civil, Medical, Finance, Management, Marketing, Data Science, Legal, Education, and other professional domains.

---

## 🗄️ Database Schema (core models)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  resume    Resume[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Resume {
  id            String    @id @default(cuid())
  originalName  String
  filePath      String
  extractedText String?
  uploadedAt    DateTime  @default(now())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  analysis      Analysis?
}

model Analysis {
  id            String   @id @default(cuid())
  score         Int
  atsScore      Int
  skills        Json
  missingSkills Json
  suggestions   Json
  createdAt     DateTime @default(now())
  resumeId      String   @unique
  resume        Resume   @relation(fields: [resumeId], references: [id])
}
```

*(Also includes `Application`, `Portfolio`, `BuilderResume`, `CompanyPrepProgress`, and `MockInterview` models — see `prisma/schema.prisma` for the full schema.)*

---

## 🌐 Deployment

**Frontend (Vercel):** root directory `frontend`, env var `VITE_API_URL=<backend-url>/api`

**Backend (Render):** root directory `backend`, build `npm install`, start `node index.js`, all env vars from `.env.example` configured

**CI (GitHub Actions):** runs `npm test` in `backend/` on every push/PR to `main` — see `.github/workflows/ci.yml`

---

## 🔑 Getting API Keys

| Service | Get Key | Free Tier |
|---|---|---|
| Neon DB | [neon.tech](https://neon.tech) | Yes |
| Cloudinary | [cloudinary.com](https://cloudinary.com) | 25GB |
| Cloudflare Workers AI | [dash.cloudflare.com](https://dash.cloudflare.com) | Yes |

---

## 👨‍💻 Author

**Vikky Verma**
GitHub: [@Vikky-Verma](https://github.com/Vikky-Verma)

---

## 📄 License

MIT License — see [LICENSE](LICENSE).