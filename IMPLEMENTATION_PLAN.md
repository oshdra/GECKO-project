# GECKO Implementation Plan

**Stack:** Vite + TypeScript frontend · Python/FastAPI + uv backend · Vanilla JS gecko-ui.js library  
**Structure:** Monorepo (`/frontend`, `/backend`, `/knowledge` already exists)  
**Startup:** `make dev` starts both processes  
**Simulator storage:** `simulators/` folder inside the repo  
**Testing:** Jest (frontend) · pytest (backend)  
**Phases:** 10 focused sessions, each 1–3 hours with a clear working deliverable

---

## Decisions Summary

| Concern | Decision |
|---|---|
| Frontend | Vite + TypeScript |
| Backend | Python 3.12+ / FastAPI / uv |
| gecko-ui.js | Vanilla JS, inlined, dark theme, EN+ES |
| Phase 1 demo | Finite-speed-of-gravity simulator |
| Simulator storage | `simulators/` in project root |
| Chat history | `simulators/<name>/chat.json` |
| Knowledge retrieval | Tag/alias matching (Phase 4), Gemini embeddings in Phase 9 |
| Pipeline streaming | Server-Sent Events (SSE) |
| API key | `.env` for dev + UI settings screen for users |
| Thumbnails | Domain icons in Phase 3, real Playwright screenshots in Phase 8 |
| i18n | Infrastructure in Phase 3, full Spanish strings in Phase 7 |
| Testing | Jest + pytest, added per phase |

---

## Phase 1 — gecko-ui.js Library + Gravity Simulator Demo

**Deliverable:** Open `simulators/finite-speed-gravity/v1.html` in a browser and see a fully working finite-speed-of-gravity simulator with gecko-ui.js chrome (sidebar, panels, play/pause, export/import).

**No backend or frontend shell needed.**

### 1.1 — gecko-ui.js implementation

File: `knowledge/schema/gecko-ui.js`

Implement the full library per `knowledge/schema/gecko-ui-spec.md`:

- `GeckoUI(config)` constructor
- Sidebar DOM injection (fixed right panel, 320px)
- Top bar: title, play/pause/reset buttons, export/import icons
- Collapsible panels system
- Control renderers: slider, number-input, vector-input, checkbox, dropdown, metrics, html, button, separator
- Reactive getter/setter polling loop (tied to `requestAnimationFrame`)
- `ui.on('tick', dt)` event — library owns the rAF loop
- Camera control buttons (if `camera:` config provided)
- Debug console (last N lines, intercepts `console.log`)
- State export (JSON download) and import (file picker + validation)
- Dark theme CSS (inlined in the JS via `<style>` injection)
- EN/ES label sets; `language: 'en' | 'es'` selector
- Imperative API: `addPanel`, `addControl`, `removePanel`, `expandPanel`, `collapsePanel`, `setPlaying`, `refresh`, `setMetric`, `debugLog`
- `GeckoUI.VERSION = '1.0'`

### 1.2 — Finite-speed-of-gravity simulator

File: `simulators/finite-speed-gravity/v1.html`

Implement per `knowledge/examples/physics/finite-speed-gravity.md` and `PromptGravedadFinita.txt`:

- Three.js scene (CDN)
- CelestialBody, IdealBody, GravitationalSphere classes
- Physics: initialization phase + standard loop
- Three default solar system models (Sol-Earth-Moon, inner solar system, three-body)
- `new GeckoUI(config)` with all panels from the spec
- gecko-ui.js inlined verbatim at the top

### 1.3 — Verification

- Manual testing checklist in `simulators/finite-speed-gravity/TESTING.md`

---

## Phase 2 — FastAPI Backend: File I/O & Project Scaffold

**Deliverable:** `make install && make backend` runs the API at `http://localhost:8000`. Endpoints return simulator lists and specs from the `simulators/` folder. `.env` configures the Gemini API key slot.

### 2.1 — Project scaffold

```
gecko/
  Makefile
  .env.example
  .gitignore
  frontend/        (empty, Phase 3)
  backend/
    pyproject.toml
    src/
      gecko/
        __init__.py
        main.py         <- FastAPI app
        config.py       <- settings (API key, paths)
        routes/
          simulators.py
          settings.py
        services/
          file_io.py
          knowledge.py  (stub)
          ai_pipeline.py (stub)
    tests/
  knowledge/       (already exists)
  simulators/      (created here; .gitkeep)
```

### 2.2 — Backend endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/simulators` | List all simulators |
| GET | `/api/simulators/{id}` | Get simulator metadata + spec frontmatter |
| GET | `/api/simulators/{id}/versions` | List HTML versions |
| GET | `/api/simulators/{id}/html/{version}` | Serve a specific HTML version |
| POST | `/api/simulators` | Create a new simulator folder + spec stub |
| DELETE | `/api/simulators/{id}` | Delete a simulator |
| GET | `/api/settings` | Get current settings |
| POST | `/api/settings` | Update settings |
| GET | `/static/gecko-ui.js` | Serve the gecko-ui.js library |

### 2.3 — Makefile targets

```
make install    - Install all dependencies (frontend + backend)
make dev        - Start frontend + backend concurrently
make frontend   - Start Vite dev server only
make backend    - Start FastAPI only
make test       - Run all tests
make test-be    - Run pytest
make test-fe    - Run Jest
make clean      - Remove build artifacts
```

### 2.4 — Tests

pytest for all file I/O endpoints (fixture: temp `simulators/` dir).

---

## Phase 3 — Vite Frontend Shell

**Deliverable:** `make dev` opens the GECKO home screen in the browser. Simulator cards are visible. Clicking a card opens an iframe preview. A concept text input shows a "Coming soon" stub.

### 3.1 — Vite + TypeScript setup

```
frontend/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  src/
    main.ts
    i18n.ts          <- t('key') translation module
    locales/
      en.json
      es.json
    api/
      client.ts      <- typed fetch wrappers for backend API
    components/
      SimulatorCard.ts
      SimulatorGrid.ts
      PreviewPane.ts
      NewSimulatorInput.ts
      LanguageToggle.ts
      SettingsModal.ts
    pages/
      Home.ts
      SimulatorDetail.ts
    styles/
      main.css
      variables.css
```

### 3.2 — Features in Phase 3

- Home screen grid of simulator cards (name, domain icon thumbnail, tags, version count, last modified)
- Click card -> detail view with iframe preview of latest HTML version
- New simulator text input + "Generate" button (stub: shows "AI pipeline coming in Phase 4")
- Language toggle EN/ES (translates all shell strings)
- Settings modal (Gemini API key input, saved via POST /api/settings)
- i18n module: English strings only (Spanish filled in Phase 7)

### 3.3 — Domain icons

Static SVG icons per domain (physics, biology, economics, mathematics, CS) as thumbnail placeholders.

### 3.4 — Tests

Jest unit tests for `i18n.ts` and `api/client.ts` (mocked fetch).

---

## Phase 4 — Gemini AI Pipeline: Step 1 (Concept Proposal)

**Deliverable:** User types a concept, clicks Generate. The AI returns a proposal card showing agent list, environment description, rendering library choice, and spec draft. User can Approve or Modify. No HTML is generated yet.

### 4.1 — Knowledge retrieval service

File: `backend/src/gecko/services/knowledge.py`

- Parse YAML frontmatter from all `knowledge/strategies/*.md` and `knowledge/examples/**/*.md`
- `search_strategies(query)`: match against `aliases`, `domains`, `tags` (substring, case-insensitive)
- `search_examples(strategies)`: find examples whose `strategies_used` overlap
- Returns top 2-3 of each with full file content

### 4.2 — Gemini client

File: `backend/src/gecko/services/gemini.py`

- Load `GEMINI_API_KEY` from `.env` / settings
- `generate(prompt, system) -> str`
- `stream(prompt, system) -> AsyncIterator[str]` for SSE

### 4.3 — Pipeline Step 1

```python
async def step1_concept_modeling(user_request: str) -> ConceptProposal:
    strategies = knowledge.search_strategies(user_request)
    examples   = knowledge.search_examples([s.name for s in strategies])
    prompt     = build_step1_prompt(user_request, strategies, examples, spec_schema)
    raw        = await gemini.generate(prompt, system=GECKO_SYSTEM_PROMPT)
    return parse_proposal(raw)
```

### 4.4 — SSE endpoint

```
POST /api/generate
Body: { concept: str }
Response: text/event-stream

Events:
  data: {"step": 1, "status": "running"}
  data: {"step": 1, "status": "done", "proposal": { ... }}
```

### 4.5 — Frontend: proposal card

- Progress stepper (Steps 1-4) that lights up as SSE events arrive
- Proposal Card: agent table, environment attributes, rendering library badge, spec YAML preview
- "Approve" and "Modify" buttons

### 4.6 — Tests

pytest: test_knowledge_retrieval.py, test_step1_prompt.py (mock Gemini), test_proposal_parsing.py

---

## Phase 5 — AI Pipeline: Steps 2-4 (Full HTML Generation)

**Deliverable:** After approving the proposal, Steps 2-4 run automatically. A new simulator HTML appears in the preview pane. `spec.md` and `v1.html` are written to `simulators/<slug>/`.

### 5.1 — Pipeline Steps 2, 3, 4

```python
async def step2_visualization_design(proposal) -> VisualizationPlan
async def step3_physics_model(proposal, viz_plan) -> PhysicsModel
async def step4_html_generation(proposal, viz_plan, physics_model) -> str  # HTML
```

Each step builds a focused prompt, calls Gemini (streaming), parses output, emits SSE event.

### 5.2 — HTML assembly

- Step 4 assembles the full HTML
- Reads `knowledge/schema/gecko-ui.js` and inlines it verbatim
- Writes `simulators/<slug>/v1.html` and `simulators/<slug>/spec.md`

### 5.3 — Frontend

- Steps 2-4 light up the progress stepper
- Step 4 completion auto-loads new simulator into preview pane
- New card appears in home screen grid

### 5.4 — Tests

pytest: test_html_assembly.py (checks gecko-ui.js is inlined, required sections present)

---

## Phase 6 — Iteration Flow

**Deliverable:** User selects an existing simulator, sees full chat history, types a change request, pipeline re-runs at the appropriate step, and a new versioned HTML is saved.

### 6.1 — Chat persistence

`simulators/<slug>/chat.json`:
```json
[{"role": "user|assistant", "content": "...", "step": 1, "timestamp": "..."}]
```

### 6.2 — Iteration endpoint

```
POST /api/simulators/{id}/iterate
Body: { request: str }
Response: text/event-stream (same SSE events)
```

Logic: load spec + chat, determine re-entry step (AI-determined), run from that step, write v2.html, v3.html, etc., update spec.md.

### 6.3 — Frontend: simulator detail view

- Full chat thread display (user + AI messages)
- New message input at bottom
- Version selector (dropdown): switch between v1, v2... in iframe
- "Open in browser" button

### 6.4 — Tests

pytest: test_iterate_endpoint.py, test_version_management.py

---

## Phase 7 — Polish: i18n, Local Profile, Version Timeline, Tag Filtering

**Deliverable:** Shell is fully bilingual. User sets name and accent color. Home screen has working domain/tag filters. Version timeline shows spec diffs.

### 7.1 — Full Spanish translations

Fill `locales/es.json` for every key in `locales/en.json`.

### 7.2 — Local profile

`~/.gecko/profile.json`: `{ name, accentColor, language }`  
Backend: `GET/POST /api/profile`  
Frontend: Profile settings screen (name, color picker, language toggle)

### 7.3 — Version timeline

- Simulator card expands to show timeline row per version
- Version entry: number, date, change summary (from chat.json)
- Diff view: two spec.md frontmatter blobs highlighting changed fields

### 7.4 — Tag and domain filtering

Client-side filter bar: domain buttons + tag chips applied against loaded simulator list.

---

## Phase 8 — Real Thumbnails via Playwright

**Deliverable:** Backend captures a headless screenshot of each new simulator HTML. Cards show real thumbnails.

### 8.1 — Backend: thumbnail.py

```python
async def capture_thumbnail(html_path: Path) -> Path:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 720})
        await page.goto(f'file://{html_path}')
        await page.wait_for_timeout(2000)
        img = await page.screenshot()
        # save to simulators/<slug>/thumbnail.png
```

New endpoint: `POST /api/simulators/{id}/thumbnail`

### 8.2 — Frontend

- Cards show `<img src="/api/simulators/{id}/thumbnail">` if thumbnail exists
- "Regenerate thumbnail" button in detail view

---

## Phase 9 — Semantic Knowledge Retrieval (Gemini Embeddings)

**Deliverable:** Knowledge search uses Gemini text-embedding-004. "What makes stars spin?" finds `field-interaction` without matching any keyword.

### 9.1 — Embedding pipeline

- Embed all strategy + example files on startup; cache in `knowledge/.index.json`
- `semantic_search(query, top_k=3)`: cosine similarity against cached embeddings
- `POST /api/knowledge/reindex` to force rebuild

---

## Phase 10 — Sharing: GitHub Gist + Repo Export

**Deliverable:** "Publish to Gist" creates a public Gist with the HTML + spec.md files and shows a shareable link.

### 10.1 — GitHub token

`GITHUB_TOKEN` in `.env` and settings screen.

### 10.2 — sharing.py

```python
async def publish_gist(simulator_id: str) -> str   # returns gist URL
async def export_to_repo(simulator_id: str, repo: str) -> str
```

Endpoints: `POST /api/simulators/{id}/share/gist`, `POST /api/simulators/{id}/share/repo`

### 10.3 — Frontend

Share button in detail view -> dropdown: "Publish to Gist", "Export to Repo" -> URL with copy button.

---

## Dependency Graph

```
Phase 1 (gecko-ui.js + demo)
  └── Phase 2 (FastAPI file I/O)
        └── Phase 3 (Vite shell)
              └── Phase 4 (AI Step 1: proposal)
                    └── Phase 5 (AI Steps 2-4: generation)
                          └── Phase 6 (iteration flow)
                                └── Phase 7 (polish + i18n)
                                      ├── Phase 8 (thumbnails)
                                      ├── Phase 9 (semantic retrieval)
                                      └── Phase 10 (sharing)
```

Phases 8, 9, and 10 are independent of each other and can run in any order after Phase 7.

---

## Estimated Time Per Phase

| Phase | Focus | Est. Time |
|---|---|---|
| 1 | gecko-ui.js + gravity simulator | 3-4 hrs |
| 2 | FastAPI scaffold + file I/O | 1-2 hrs |
| 3 | Vite shell + home screen | 2-3 hrs |
| 4 | AI pipeline Step 1 (proposal) | 2-3 hrs |
| 5 | AI pipeline Steps 2-4 (generation) | 2-3 hrs |
| 6 | Iteration flow | 2 hrs |
| 7 | Polish, i18n, timeline, filters | 2-3 hrs |
| 8 | Playwright thumbnails | 1-2 hrs |
| 9 | Semantic retrieval | 1-2 hrs |
| 10 | GitHub sharing | 2 hrs |
| **Total** | | **~20-27 hrs** |

---

## End-State File Tree

```
gecko/
  Makefile
  .env.example
  .gitignore
  README.md
  IMPLEMENTATION_PLAN.md
  knowledge/
    strategies/
    examples/
    schema/
      gecko-ui.js              <- implemented in Phase 1
      gecko-ui-spec.md
      gecko-spec.schema.yaml
      simulator-requirements.md
  simulators/
    .gitkeep
    finite-speed-gravity/
      spec.md
      chat.json
      v1.html
      thumbnail.png
  frontend/
    package.json
    vite.config.ts
    tsconfig.json
    index.html
    src/
      main.ts
      i18n.ts
      locales/en.json
      locales/es.json
      api/client.ts
      components/
      pages/
      styles/
  backend/
    pyproject.toml
    src/gecko/
      main.py
      config.py
      routes/
      services/
        file_io.py
        knowledge.py
        gemini.py
        ai_pipeline.py
        thumbnail.py
        sharing.py
    tests/
```
