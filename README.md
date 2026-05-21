# AI Senate Simulator

## Overview
A full‑stack, browser‑based simulation of a parliamentary senate where AI agents act as senators, judges, and the presiding president.  Users select a set of large language models (LLMs), provide a motion, and watch the debate unfold in real time.

## Technology Stack
- **Frontend** – React 19 (ESM) with Vite bundler, styled using TailwindCSS.
- **Backend** – Node.js Express server exposing a thin JSON‑API that forwards prompts to AI providers.
- **AI Providers**
  - **OpenRouter** – free‑tier text models (e.g., Mistral‑7B, Llama 3‑8B, Gemma 2 9B, etc.).
  - **Hugging  Face Inference API** – free text models reachable via an API token (e.g., Flan‑T5‑XL, Llama 2‑7B‑Chat, BLOOM 560M).
- **State Management** – React Context + reducer (`src/context/DebateContext.jsx`).
- **Build / Tooling** – Vite, ESLint, Tailwind, `concurrently` for running client and server together.

## Project Structure
```
AI-Project/
├─ src/                     # React source code
│  ├─ components/           # Visual UI pieces (SenatorSeat, TranscriptPanel, …)
│  ├─ context/              # DebateContext (global state & reducer)
│  ├─ hooks/                # useSenateSpeech – wrapper around server API
│  ├─ pages/                # Router pages (ModelPicker, SenateChamber, …)
│  ├─ data/models.js        # Catalog of available LLMs (OpenRouter + HuggingFace)
│  ├─ App.jsx, main.jsx      # App entry points
├─ server/                  # Express back‑end
│  ├─ server.js              # API routes (/api/speak, /api/challenge, …)
│  ├─ openrouter.js          # Resolver + unified chatCompletion wrapper
│  ├─ huggingface.js          # Helper for HuggingFace Inference API
│  └─ prompts.js             # Prompt‑generation utilities
├─ .env                     # Environment variables (API keys, PORT)
├─ vite.config.js           # Vite configuration (Tailwind, React plugin)
├─ package.json             # Scripts, dependencies, devDependencies
└─ README.md                # Documentation (this file)
```

## Getting Started
1. **Clone & install**
   ```bash
   git clone <repo‑url>
   cd AI-Project
   npm install
   ```
2. **Configure environment variables** – create a `.env` file (or copy the existing one) and add:
   ```dotenv
   OPENROUTER_API_KEY=your‑openrouter‑key
   HUGGINGFACE_API_KEY=your‑hf‑token   # required for HuggingFace models
   PORT=3001                         # server port (default 3001)
   ```
   *Both keys refer to free‑tier accounts.*
3. **Run the development environment**
   ```bash
   npm run dev:all   # starts Vite dev server + Express API concurrently
   ```
   The React app will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

## Model Catalog
The file `src/data/models.js` exports `AVAILABLE_MODELS`. Each entry has the shape:
```js
{ id: string, name: string, provider: 'OpenRouter'|'HuggingFace', icon: string,
  openRouterId?: string,   // for OpenRouter models (ends with ":free")
  huggingFaceId?: string   // for HuggingFace models (repo slug)
}
```
- **OpenRouter models** are listed with `openRouterId` and are all free (`:free`).
- **HuggingFace models** have `huggingFaceId` pointing to the model repository on HF (e.g., `google/flan-t5-xl`). They are accessed via the HuggingFace Inference API using the token from `.env`.

### Adding a New Model
1. Append a new object to `AVAILABLE_MODELS` – include either `openRouterId` **or** `huggingFaceId`.
2. No further code changes are needed; `resolveModelId` in `server/openrouter.js` automatically picks the correct backend.
3. The UI automatically groups models by their `provider` (tabs for *All*, *OpenRouter*, *HuggingFace*).

## Server API (Express)
All endpoints expect and return JSON.
| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/api/request-to-speak` | `{ senator, motion, previousSpeeches }` | Generates a short request line for a senator.
| `POST` | `/api/speak` | `{ senator, motion, context, shouldBeUnparliamentary }` | Generates the full parliamentary speech.
| `POST` | `/api/challenge` | `{ objector, challengedSpeech, challengedSenatorName, transcriptEntryId }` | Generates a point‑of‑order and runs an unparliamentary‑language analysis.
| `POST` | `/api/strike-from-record` | `{ transcriptEntryId, reason }` | Marks a transcript entry as stricken.

### Routing Logic
- `resolveModelId` translates a front‑end model ID to either an OpenRouter slug or a HuggingFace repo slug.
- `chatCompletion` decides which provider to call:
  - If the slug ends with `:free` → OpenRouter request.
  - Otherwise → HuggingFace Inference API request (handled by `huggingFaceCompletion`).

## Frontend Flow
1. **ModelPicker** – Choose exactly `SLOT_CONFIG.total` models and a motion.
2. **SenateChamber** – The President can:
   - Call for speakers (`triggerSpeakRequests`).
   - Pause / resume the session.
3. **SenatorSeat** – Each senator can request to speak (adds to `speakRequests`).
4. **useSenateSpeech hook** – Wraps all API calls and dispatches the appropriate actions to the global context.
5. **TranscriptPanel** – Shows a live, searchable transcript with colour‑coded roles, stricken markers, and challenge buttons.
6. **DeliberationRoom** – Judges discuss in private; the President presents the final verdict.

## State Management (`DebateContext`)
The reducer handles actions such as:
- `SET_MOTION`, `START_SESSION`
- `REQUEST_TO_SPEAK`, `GRANT_FLOOR`, `DENY_FLOOR`
- `RAISE_POINT_OF_ORDER`, `STRIKE_FROM_RECORD`, `DISMISS_CHALLENGE`
- Phase transitions (`PAUSE_SESSION`, `RESUME_SESSION`, `START_DELIBERATION`, `SET_VERDICT`, `START_IMPEACHMENT`, …)
All UI components consume `useDebate()` and `useDebateDispatch()` to read or update the state.

## Adding New UI Components
1. Create the component under `src/components/` (or `src/pages/`).
2. Import `useDebate` / `useDebateDispatch` as needed.
3. Follow the existing Tailwind‑based design conventions for colour and animation classes.
4. Register any new routes in `src/App.jsx` using `react‑router‑dom`.

## Linting, Building & Production
```bash
# Lint the codebase
npm run lint

# Build for production (outputs to ./dist)
npm run build

# Preview the built app locally
npm run preview
```

## Testing
The repo currently does not include automated tests, but the architecture supports adding Jest / React Testing Library tests for reducers, hooks, and UI components.  Ensure any new code is covered by unit tests before merging.

## License & Contributions
Feel free to fork, experiment, and submit pull requests.  The project is provided as‑is without any warranty.

---
*Generated documentation – keep it up to date as the project evolves.*