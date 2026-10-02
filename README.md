# ArogyaLink

### Team Members:
- **Gaurav Moolya**
- **Nimesh Kor**
- **Vikas Agrahari**
- **Sarvesh Pillai**


## 📌 Problem Statement
Misunderstanding prescriptions and complex medication regimens can lead to missed doses, incorrect medication usage, and poor treatment adherence. Patients often struggle to understand their prescriptions, manage multiple medicines, recognize potential medication-related risks, and stay consistent with their treatment plans.

**Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Node.js, Express, Supabase (PostgreSQL & Auth), Google Gemini AI, Nodemailer.

Production implementation for the **AI-Powered Medication Management & Adherence System**, featuring a **Next.js + TypeScript** frontend in `client/` and an **Express + Supabase + Multi-Agent AI** backend in `server/`.


---

## 🚀 Deployment

For complete step-by-step instructions on deploying the application to **Vercel** and **Render/Railway**, refer to:
👉 **[VERCEL_DEPLOYMENT_GUIDE.md](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/VERCEL_DEPLOYMENT_GUIDE.md)**

---

## 1. Multi-AI / Multi-Agent Architecture

Each AI agent in the system is **independently configurable**:
- **Independent AI Provider**: Each agent can use Google Gemini, OpenAI, Anthropic, or any future provider.
- **Independent Model**: Each agent can use a different model (e.g. `gemini-1.5-flash` for OCR, `gpt-4o-mini` for chat).
- **Independent API Key**: Changing the key or provider for one agent **never** affects another agent.
- **No Global AI Singletons**: Providers are dynamically resolved per agent at runtime through [`AIFactory`](file:///c:/Users/Gaurav/Desktop/SIH93/ENIGMA/server/src/ai/factory.js).
- **Strict Data Minimization**: Each agent only receives the minimum data required for its specific task.
- **Deterministic Logic Stays Deterministic**: Adherence statistics and dose calculations are calculated via pure deterministic arithmetic—no LLMs are wasted on basic math.

```text
                        REQUEST
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
         OCR Agent    Medication Agent  Assistant
             │             │             │
             ▼             ▼             ▼
       AIFactory('ocr') AIFactory('med') AIFactory('asst')
             │             │             │
             ▼             ▼             ▼
        Provider A    Provider B    Provider C
             │             │             │
             ▼             ▼             ▼
         Model A       Model B       Model C
             │             │             │
             ▼             ▼             ▼
         API Key A     API Key B     API Key C
```

### Environment Configuration Example (`server/.env`):

```env
# 1. OCR Agent
OCR_AI_PROVIDER=google
OCR_AI_MODEL=gemini-1.5-flash
OCR_AI_API_KEY=your_ocr_key

# 2. Medication Analysis Agent
MEDICATION_AI_PROVIDER=google
MEDICATION_AI_MODEL=gemini-1.5-flash
MEDICATION_AI_API_KEY=your_medication_key

# 3. Conversational Assistant Agent
ASSISTANT_AI_PROVIDER=openai
ASSISTANT_AI_MODEL=gpt-4o-mini
ASSISTANT_AI_API_KEY=your_openai_key
```

---

## 2. Enforced Core Product Rules & Clinical Guardrails

1. **AI is an Assistant, NOT the Source of Truth**:
   - The application does not allow AI to independently prescribe medication, modify doses, diagnose conditions, advise stopping medication, or override doctor orders.
   - Prominent clinical guardrail banners are displayed on all AI outputs and chat interactions.
2. **Deterministic Application Logic**:
   - Schedules, dose events, 7-day adherence calculations, and missed-dose detection are calculated strictly using deterministic formulas (`Rate = (Taken / Total) * 100`).
3. **Consent-Based Caregiver Escalation**:
   - Patient privacy and sovereignty are strictly safeguarded. Caregiver alerts for missed doses are only dispatched when explicit opt-in consent is active. Patients can revoke consent at any time with one click.

---

## 3. Project Structure

```text
ENIGMA/
├── run.bat                         # One-click launcher (client, server, and browser)
├── terminate_all.bat               # One-click process terminator (kills ports 3000 & 5000)
├── stop.bat                        # Alias for terminate_all.bat
├── start_client.bat                # Runs only Next.js frontend
├── start_server.bat                # Runs only Express backend
├── README.md
│
├── client/                         # Next.js 14.2 Frontend (Design 2 + Design 1)
│   ├── src/
│   │   ├── app/                    # App Router (Dashboard, Upload, Medications, Schedule, Adherence, Caregivers)
│   │   ├── components/             # Reusable UI, Layout, Dashboard, Upload & AI Drawer components
│   │   └── lib/                    # React Context store, API client, types, mock data
│   └── package.json
│
└── server/                         # Express + Supabase Backend API (Port 5000)
    ├── .env                        # Server-only secrets (Never exposed to client)
    ├── .env.example                # Placeholder template
    ├── package.json
    └── src/
        ├── app.js                  # Express app setup & CORS
        ├── server.js               # Server entry point
        ├── config/
        │   ├── env.js              # Environment variable loader
        │   ├── supabase.js         # Supabase client initializer
        │   └── ai-config.js        # Centralized Multi-Agent AI configuration
        ├── ai/
        │   ├── interface.js        # Abstract AIProviderInterface
        │   ├── factory.js          # AIFactory resolver per-agent
        │   └── providers/
        │       ├── google-gemini.js# Google Gemini adapter
        │       ├── openai.js       # OpenAI adapter
        │       └── anthropic.js    # Anthropic adapter
        ├── agents/
        │   ├── ocr-agent.js        # Prescription image extraction
        │   ├── medication-agent.js # Interaction analysis & precautions
        │   ├── adherence-agent.js  # Deterministic adherence calculator
        │   └── assistant-agent.js  # MedBuddy conversational assistant
        ├── services/               # Medicine, patient, and prescription services
        └── routes/                 # Express API routes (/health, /medicines, /patients, /prescriptions, /ai)
```

---

## 4. API Endpoints

- `GET /api/health` — System status & Supabase connection check
- `GET /api/ai/status` — Sanitized per-agent provider & model audit (keys are never exposed)
- `GET /api/medicines` — Medicines list (connected to Supabase `medications`)
- `POST /api/prescriptions/upload` — OCR processing via `OCRAgent`
- `POST /api/ai/medication-agent/analyze` — Interaction checks via `MedicationAgent`
- `POST /api/ai/chat` — Conversational advice via `AssistantAgent`
- `POST /api/ai/adherence-agent/calculate` — Purely deterministic adherence calculation

---

## 5. How to Run & Stop

- **Start Everything**: Double-click **`run.bat`** (or run `start_client.bat` / `start_server.bat` individually).
- **Stop Everything**: Double-click **`terminate_all.bat`** or **`stop.bat`** to instantly kill all running server and client processes on ports 3000 and 5000.
