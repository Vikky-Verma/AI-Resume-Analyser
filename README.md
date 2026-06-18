# 🤖 ResumeAI — AI-Powered Resume Analyzer

> An intelligent full-stack resume analysis platform that provides ATS scoring, skill gap analysis, career roadmap generation, and job description matching for **all professional domains** — Software, Electronics, Medical, Finance, Management, Civil, Marketing, Education, and more.

🔗 **Live Demo:** [https://ai-resume-analyser-chi-ten.vercel.app](https://ai-resume-analyser-chi-ten.vercel.app)  
🔗 **Backend API:** [https://ai-resume-analyser-backend-rllt.onrender.com](https://ai-resume-analyser-backend-rllt.onrender.com)  
🔗 **GitHub:** [https://github.com/Vikky-Verma/AI-Resume-Analyser](https://github.com/Vikky-Verma/AI-Resume-Analyser)

---

## 📸 Features

- 🔐 **User Authentication** — Register, Login with JWT-based auth
- 📄 **Resume Upload** — Supports PDF and DOCX formats
- 🧠 **AI Resume Analysis** — Strict ATS scoring across all professional domains
- 📊 **Resume Score** — 6-dimension scoring: Impact, Domain Depth, Structure, Completeness, Keywords, Career Narrative
- 🎯 **ATS Score** — Real ATS compatibility score with detailed deductions
- 💡 **Smart Suggestions** — 5 specific, actionable suggestions with example rewrites
- 🔍 **Missing Skills** — 6-8 high-demand missing skills for detected domain
- 🗺️ **Career Roadmap** — Domain-specific career advice and learning path
- 💼 **Job Description Match** — Match resume against any job description
- 📥 **PDF Report** — Download professional analysis report
- 🗑️ **Resume Management** — Upload, view, and delete resumes

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
| JWT | Authentication |
| Multer + Cloudinary | File upload & storage |
| pdf-parse | PDF text extraction |
| Mammoth | DOCX text extraction |
| PDFKit | PDF report generation |

### AI Services
| Service | Purpose |
|---|---|
| Cloudflare Workers AI | Primary AI (llama-3.1-70b) — Free, no limits |
| Google Gemini 2.0 Flash | Fallback AI — 1500 req/day free |
| Groq (llama-3.3-70b) | Final fallback — 100k tokens/day |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Neon | PostgreSQL database |
| Cloudinary | File storage |

---

## 📁 Project Structure

```
AI-Resume-Analyser/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ResumeAnalysis.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── analysisController.js
│   │   ├── careerController.js
│   │   ├── atsController.js
│   │   └── pdfController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── careerRoutes.js
│   │   ├── atsRoutes.js
│   │   └── pdfRoutes.js
│   ├── services/
│   │   ├── aiAnalysisService.js
│   │   └── careerService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── utils/
│   │   ├── prisma.js
│   │   ├── pdfParser.js
│   │   ├── docxParser.js
│   │   └── geminiClient.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── index.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Vikky-Verma/AI-Resume-Analyser.git
cd AI-Resume-Analyser
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=8000
NODE_ENV=development

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload resume (PDF/DOCX) |
| GET | `/api/resume/my-resumes` | Get all resumes |
| POST | `/api/resume/parse/:resumeId` | Extract text from resume |
| DELETE | `/api/resume/:id` | Delete resume |

### Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analysis/:resumeId` | Analyze resume with AI |
| GET | `/api/analysis/:resumeId` | Get existing analysis |

### Career
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/career/:resumeId` | Get career advice |
| POST | `/api/career/match/:resumeId` | Match with job description |

### Report
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/report/:resumeId` | Download PDF report |

---

## 🧠 AI Analysis — How It Works

```
Resume Upload (PDF/DOCX)
         ↓
   Text Extraction
         ↓
   Domain Detection
   (Auto-detects field)
         ↓
  ┌──────────────────────┐
  │  Cloudflare AI       │ ← Primary (Free, no limits)
  │  Gemini 2.0 Flash    │ ← Fallback 1
  │  Groq llama-3.3-70b  │ ← Fallback 2
  └──────────────────────┘
         ↓
   ATS Score (0-100)
   Resume Score (0-100)
   Skills Found
   Missing Skills
   5 Suggestions
   Career Roadmap
   Job Match Score
```

### Supported Domains
- 💻 Software Engineering / Web Development
- ⚡ Electronics / Embedded Systems
- ⚙️ Mechanical / Civil Engineering
- 🏥 Medical / Healthcare
- 💰 Finance / Accounting
- 📊 Management / MBA
- 📣 Marketing / Sales
- 🔬 Data Science / Research
- ⚖️ Legal / Law
- 📚 Education / Teaching
- And any other professional domain

---

## 🗄️ Database Schema

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

---

## 🌐 Deployment

### Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Set Root Directory: `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Backend — Render
1. Connect GitHub repo to Render
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add all environment variables
6. Deploy

---

## 🔑 Getting API Keys

| Service | Get Key | Free Limit |
|---|---|---|
| Neon DB | [neon.tech](https://neon.tech) | Free tier |
| Cloudinary | [cloudinary.com](https://cloudinary.com) | 25GB free |
| Cloudflare AI | [dash.cloudflare.com](https://dash.cloudflare.com) | No daily limit |
| Gemini | [aistudio.google.com](https://aistudio.google.com) | 1500 req/day |
| Groq | [console.groq.com](https://console.groq.com) | 100k tokens/day |

---

## 👨‍💻 Author

**Vikky Verma**  
GitHub: [@Vikky-Verma](https://github.com/Vikky-Verma)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
