# AI Interview Prep Platform - Project Memory & Context

## Project Overview
Full-stack web application for AI-powered mock interview preparation, resume analysis, and real-time candidate evaluation.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Motion (`motion/react`), React Router v7, Redux Toolkit, Axios, `react-circular-progressbar`, Recharts, `jspdf`, `jspdf-autotable`.
- **Backend**: Node.js (ES modules), Express, MongoDB with Mongoose, JWT cookie authentication with token blacklist, Multer file upload, OpenRouter API (AI inference), PDF.js (`pdfjs-dist`).

---

## Architectural Layout & Key Files

### Backend (`Backend/src/`)
- **`controllers/interview.controller.js`**: Core interview logic:
  - `analyzeResume`: Extracts text from PDF using `pdfjs-dist` and parses skills, experience, and projects.
  - `analyzeAtsScore`: Evaluates candidate resume against target Job Description; computes 0–100% ATS score, qualitative fit level, matched skills, missing/required skills, fit summary, and recommendations.
  - `generateQuestions`: Synthesizes adaptive scenario-based questions tailored to the Job Description, experience, and mode (Technical / HR).
  - `submitAnswer`: Evaluates individual answers with scores (correctness, confidence, communication) and constructive feedback.
  - `finishInterview`: Computes final scores, summary, strengths, and areas for improvement; marks status as `"Completed"`.
  - `abortInterview`: Safely pauses an active interview session, marking status as `"Incomplete"`. Protected with IDOR ownership validation.
  - `resumeInterview`: Retrieves existing questions and automatically detects `startIndex` (first unanswered question). Protected with IDOR ownership validation.
  - `getInterviewHistory`: Retrieves all past interviews for the authenticated user.
  - `getInterviewReport`: Retrieves detailed analytical report for a completed interview (with IDOR protection).
- **`routes/interview.routes.js`**:
  - `POST /api/interview/resume` (Multer PDF upload)
  - `POST /api/interview/analyze-ats`
  - `POST /api/interview/generate-questions`
  - `POST /api/interview/submit-answer`
  - `POST /api/interview/finish-interview`
  - `POST /api/interview/abort-interview`
  - `GET /api/interview/resume-interview/:id`
  - `GET /api/interview/get-interview-history`
  - `GET /api/interview/get-interview-report/:id`
- **`models/interview.model.js`**: Schema for interviews including `jobDescription`, `role`, `status` (`["Incomplete", "Incompleted", "Completed"]`), `questions` array, and final analytical scores.
- **`services/openRouter.service.js`**: Centralized AI communication with OpenRouter API.

### Frontend (`Frontend/src/`)
- **`components/Setup.jsx`**: Target Job Description input, experience level, mode selector, PDF resume upload with AI scanner animation, ATS score trigger button, and modal trigger.
- **`components/ATSScoreModal.jsx`**: Interactive modal dialog featuring circular ATS gauge, match level badge, fit overview, dual-panel skill breakdown (matched vs missing), actionable recommendations, and in-modal role tuning.
- **`components/Interview.jsx`**: Real-time mock interview room:
  - Speech synthesis (TTS) & Web Speech Recognition (mic input).
  - Male / Female interviewer switcher with corresponding animated avatars and voice synthesis.
  - Pause & Exit modal (`/abort-interview`) that stops audio and redirects to history.
  - Supports resuming from `startIndex` (skipping introductory speech for resumed sessions).
- **`components/AILoadingScreen.jsx`**: Fluid neural loading overlay with step indicators, pulsing radar, and animated messages.
- **`components/SkeletonLoader.jsx`**: Placeholder shimmer skeletons for reports and history lists.
- **`pages/InterviewHistory.jsx`**: Past interview dashboard with status badges, report links for completed interviews, and one-click "Resume" flow for incomplete interviews.
- **`pages/ErrorPage.jsx`**: User-friendly error pages for 401/403 Unauthorized, 502/503/504 Server Unavailable, and 500 Something Went Wrong.

---

## Key Features & Work Completed

1. **Job Description Driven Interviews**:
   - Replaced fixed role inputs with rich Job Description inputs across frontend setup and backend AI generation.
   - Questions and ATS algorithms dynamically parse job requirements, competencies, and domain depth.

2. **ATS Compatibility & Job Fit Analysis**:
   - `POST /api/interview/analyze-ats` analyzes candidate resume text against job description keywords.
   - Computes ATS match score (0–100%), qualitative rating, matched skills list, missing skills list, and strategic resume recommendations.
   - `ATSScoreModal.jsx` presents this information with a circular gauge, color-coded badges, and real-time re-analysis.
   - Prefetched in the background during resume upload if JD is present.

3. **Interview Pause / Abort & Resume Flow**:
   - Added "Pause & Exit" button in active interview with confirmation modal.
   - Calls `/api/interview/abort-interview` to mark session as `"Incomplete"`.
   - `InterviewHistory.jsx` highlights incomplete cards with an amber badge and green "Resume" button.
   - Resuming loads the first unanswered question (`startIndex`) and skips welcome greetings.

4. **Male / Female Interviewer & Voice Switching**:
   - Dynamic toggle during active interview changes avatar video (`male-ai.mp4` / `female-ai.mp4`).
   - Automatically synchronizes Web Speech Synthesis voices to match gender.

5. **Animated Loading & Neural Scanner Screens**:
   - Implemented `AILoadingScreen.jsx` with progressive milestone steps and pulsing glowing radar.
   - Replaced static text during resume upload with an animated neural laser scanner.

6. **Custom Error Handling & Route Protection**:
   - Dedicated error component `ErrorPage.jsx` handles 401/403 unauthorized access, 502/503/504 server downtime, and generic errors with retry actions.
   - IDOR security checks enforced across all interview detail, report, abort, and resume routes.

---

## API Summary & Data Contracts

| Method | Endpoint | Description | Key Payload / Params |
|--------|----------|-------------|----------------------|
| `POST` | `/api/interview/resume` | Upload & extract PDF resume | `multipart/form-data` with `resume` |
| `POST` | `/api/interview/analyze-ats` | Check ATS fit & skills match | `{ resumeText, jobDescription, skills, experience, projects }` |
| `POST` | `/api/interview/generate-questions` | Create interview questions | `{ jobDescription, role, experience, mode, resumeText, projects, skills }` |
| `POST` | `/api/interview/submit-answer` | Submit question answer | `{ interviewId, questionIndex, answer, timeTaken }` |
| `POST` | `/api/interview/abort-interview` | Pause active interview | `{ interviewId }` |
| `GET`  | `/api/interview/resume-interview/:id` | Resume incomplete interview | `id` (Interview ID) |
| `POST` | `/api/interview/finish-interview` | Finalize & score interview | `{ interviewId }` |
| `GET`  | `/api/interview/get-interview-history` | List user interviews | None (authenticated via cookie) |
| `GET`  | `/api/interview/get-interview-report/:id`| Full analytical report | `id` (Interview ID) |

---

## Important Patterns & Notes for Future Work

- **Environment & Execution**: Backend runs Node.js (ES modules). On Windows, use `;` instead of `&&` in PowerShell commands.
- **Tailwind Version**: Tailwind CSS v4 is used; avoid deprecated v3 syntax (e.g. use standard modern Tailwind classes).
- **Session Storage**: Active interview state is synced to `sessionStorage.getItem("active_interview")` to safeguard against accidental refreshes, and cleared upon abort or completion.
- **Voice Synthesis**: System voices load asynchronously (`speechSynthesis.onvoiceschanged`). Always verify voice availability before invoking `speechSynthesis.speak`.
