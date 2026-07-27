# GECKO Project

**Generator of Explorers of Concepts Copilot**

GECKO is an AI-powered tool that generates interactive web simulators to help users understand concepts in a playful, ludic way. The user describes what they want to explore; the AI models the concept, proposes a visualization and interaction design, and — after user approval — generates a self-contained HTML simulator file the user can run locally in a browser.

All simulator specs and history are saved locally so users can return later and continue iterating.

---

## Target Audience

The primary audience is **self-learners and curious adults** who want intuitive, hands-on exploration without needing deep formal knowledge. GECKO should also be useful for educators building classroom demonstrations and students exploring science concepts. Depth of the generated simulator should scale naturally with the complexity of the user's request.

---

## Architecture Overview

GECKO has two distinct layers:

### 1. GECKO UI Shell (the product the user runs)

- A **Vite (or Next.js) frontend** (JS/TS) served at `http://localhost:5173` (or similar).
- A **Python / FastAPI backend** running at `http://localhost:8000`, started with a single `uv run gecko` command.
- The FastAPI server handles: file I/O (reading/writing simulator specs and HTML files), API key management, Gemini API calls, Ollama integration, and GitHub sharing operations.
- Both processes start together via a convenience script or `Makefile` target.
- The UI is available in **English and Spanish** (i18n from the start).

### 2. Generated Simulators (what users download and share)

- Each simulator is a **self-contained, standalone HTML file** with all CSS and JS inline.
- No server required to run a simulator — open in any browser.
- Simulators are saved in a **local folder** chosen by the user, alongside their spec file.

---

## AI Backend

- **Primary:** Google Gemini API (free tier friendly).
- **Secondary / Future:** Ollama / local LLMs for fully offline usage.
- **Long-term goal:** Provider-agnostic, user-configurable API key.
- The AI is invoked through a **dedicated GECKO MCP skill** and GECKO-specific prompt templates.

### Generation Pipeline (Agentic)

The AI generation is a multi-step agentic pipeline with checkpoints the user can review:

1. **Concept Modeling** — AI proposes agents, environment, interactions, and a GECKO Spec draft.
2. **Visualization Design** — AI selects the best rendering library and UI layout for the concept.
3. **Physics / Logic Model** — AI defines the mathematical/simulation model.
4. **HTML Generation** — AI assembles the full standalone simulator.
5. **Review & Iterate** — User can request changes; the pipeline re-enters at the appropriate step.

The user approves the proposal at Step 1 before generation begins. Each subsequent step is shown as a progress checkpoint in the UI.

---

## Modeling Philosophy

Every simulator is built around the interaction between **AGENTS** and an **ENVIRONMENT**.

- **Agents** are objects that exist in the environment. They have typed attributes (mass, position, velocity, spin, color, etc.) and defined behaviors.
- **Environment** is the space where agents move and interact. It has its own attributes and governs physics rules, display, and global parameters.

This agent/environment model is the universal abstraction across all GECKO simulators, regardless of domain.

---

## GECKO Simulator Spec Format

Every simulator is described by a **GECKO Spec File** — a markdown document with a YAML frontmatter block containing the structured machine-readable schema. This file is the source of truth the AI uses for iterative improvements.

```
simulators/
  my-concept/
    spec.md          ← GECKO Spec File (markdown narrative + YAML frontmatter)
    v1.html          ← generated simulator (standalone)
    v2.html          ← next iteration
    ...
```

### Spec File Structure

```yaml
---
name: "Rotation of Rigid Bodies"
version: 2
created: 2026-01-15
modified: 2026-07-23
language: en
tags: [physics, rotation, 3D]
rendering_library: three.js
agents:
  - name: Sphere
    attributes: [mass, radius, position_x, position_y, position_z, color]
    behaviors: [fixed_relative_position, contributes_to_inertia]
environment:
  type: 3D
  physics: rigid_body_rotation
  attributes: [gravity, torque_applied, angular_velocity_x, angular_velocity_y, angular_velocity_z]
interactions:
  - trigger: drag_agent
    effect: apply_torque
exports:
  - state_json
  - agent_population_json
---
```

Followed by a human-readable markdown narrative covering:

- **Concept** — what is being explored and why.
- **Model** — how agents represent the concept.
- **Visualization** — how the simulation should look and feel.
- **Expected Evolution** — notes on how this simulator might grow.

---

## Simulator Requirements (All Simulators)

Every generated simulator must include:

- **Controls panel** — sliders/inputs for all relevant environment and agent attributes.
- **State display** — real-time readout of key metrics (e.g., angular velocity, energy, score).
- **Export / Import state** — save and restore the full simulation state as JSON.
- **Agent management** — if variable populations are supported, allow adding/removing agents and exporting/importing agent populations as JSON.
- **Visual aids** — arrows for velocity/force vectors, trajectory traces, labels, etc. where relevant.
- **Responsive layout** — usable on a laptop screen without scrolling the canvas area.

### Rendering Library Selection

The AI selects the rendering library per simulator based on concept complexity:

| Scenario | Recommended Library |
|---|---|
| 3D physics, rigid bodies, 3D space | Three.js |
| 3D with complex physics (collisions, joints) | Babylon.js |
| 2D simulations, cellular automata, particle systems | p5.js or Canvas 2D API |
| Abstract / data-driven visualization | D3.js |
| Lightweight 2D + charting hybrid | Chart.js + Canvas |

---

## GECKO UI Shell Features

### Home Screen — Simulator Library

- **Visual timeline view** per simulator: shows the evolution of the simulator with diffs between versions (which parameters changed, what was added).
- Cards display: name, concept, thumbnail (auto-captured from the HTML), last modified, version count.
- Category/tag filtering by domain (physics, biology, economics, math, etc.).
- Language toggle (EN / ES) available globally.

### New Simulator Flow

1. User types a free-form concept description (or picks from suggested examples).
2. AI returns a **proposal card**: agents list, environment description, rendering library choice, and a preview of what the UI will look like.
3. User approves or requests modifications.
4. Agentic pipeline runs with visible progress steps.
5. Simulator HTML is saved to the local folder; spec file is written.
6. Simulator opens in a preview pane (iframe) within the GECKO UI.

### Iteration Flow

- User selects an existing simulator from the library.
- The chat thread shows the full history of requests and AI responses for that simulator.
- User requests changes in natural language; the pipeline re-runs at the appropriate step.
- A new versioned HTML file is saved; the timeline updates.

---

## Sharing Model

- **GitHub Gist** — users can publish a simulator directly as a GitHub Gist (HTML file + spec.md) with a single click.
- **GitHub Repository** — users can push a simulator collection to a GitHub repo (one simulator per folder).
- GECKO provides the Git operations through the local Node.js server (using the GitHub API or local git).
- Shared simulators are purely HTML files — anyone can download and run them with no dependencies.

---

## Local Profile

- No accounts, no remote auth.
- Users set a **local alias** (name + optional avatar color) stored in `~/.gecko/profile.json`.
- Used to personalize the GECKO UI and sign simulator metadata (author field in YAML frontmatter).

---

## Technology Stack Summary

| Layer | Technology |
|---|---|
| GECKO UI Shell (frontend) | Vite + Vanilla JS/TS (or Next.js) |
| GECKO Backend (local server) | Python 3.12+ / FastAPI + `uv` package manager |
| AI Provider (primary) | Google Gemini API (`google-generativeai` Python SDK) |
| AI Provider (secondary) | Ollama (`ollama` Python client) |
| Simulator Rendering | Three.js / Babylon.js / p5.js / D3.js (AI selects per sim) |
| Spec Format | Markdown + YAML frontmatter |
| Persistence | Local file system (user-chosen folder) |
| Sharing | GitHub Gist / GitHub Repo (via GitHub API + `PyGithub`) |
| i18n | English + Spanish |

---

## Knowledge System

GECKO uses a multi-layer knowledge system to feed AI-relevant context during simulator generation. All knowledge files live in the `knowledge/` directory:

```
knowledge/
  strategies/           ← Modeling strategy archetypes (Layer 1)
  examples/             ← Worked examples organized by domain (Layer 2)
    physics/
    biology/
    economics/
    mathematics/
  agents/               ← Reusable agent definition library by domain (Layer 3)
  schema/               ← Output contracts and requirements (Layer 4)
```

### Layer 1: Modeling Strategies

Named, reusable patterns for decomposing concepts into the Agent/Environment model. Each strategy has YAML frontmatter with structured `agent_pattern`, `environment_pattern`, and `interaction_patterns` plus a markdown narrative explaining when and how to use it.

Available strategies: `field-interaction`, `multi-body-constraint`, `collision-response`, `particle-system`, `population-dynamics`, `state-machine`, `network-flow`, `oscillation-system`, `spatial-grid`, `gradient-descent`.

The AI can **propose new strategies** when a user's concept doesn't fit existing ones. Proposed strategies are saved with `status: proposed` and promoted to `stable` after human review.

### Layer 2: Worked Examples

Concrete simulator designs that demonstrate strategies in action. Each example links to the strategies it uses via `strategies_used` in its frontmatter, and includes structured YAML metadata for retrieval.

Current examples:
- **Finite Speed of Gravity** (`physics/finite-speed-gravity.md`) — the founding GECKO concept. Strategy: `field-interaction`. Bilingual (es/en).
- **Rotation of Rigid Bodies** (`physics/rigid-body-rotation.md`) — Strategy: `multi-body-constraint`.
- **Physics of Ping Pong** (`physics/ping-pong-physics.md`) — Strategy: `collision-response`.

### Layer 3: Reusable Agent Library

Categorized catalog of reusable agent archetypes (`knowledge/agents/`), defining standard attributes, behaviors, collision rules, and physics models (e.g. finite-speed gravity spheres, Newtonian attractors, paddles, balls, rigid body nodes, force points). These provide modular building blocks for AI agents to compose into new simulator specs.

Current agent catalogs:
- **Physics Agents** (`knowledge/agents/physics-agents.md`) — finite-speed gravity spheres, Newtonian attractors, ping-pong balls & paddles, rigid body nodes, and thrusters.

### Layer 4: Schema & Requirements

- `gecko-spec.schema.yaml` — the formal YAML schema every simulator spec must conform to.
- `simulator-requirements.md` — universal rules for all generated simulators (controls, state display, export/import, visual aids, responsive layout).

### AI Retrieval Pipeline

During Step 1 (Concept Modeling), the backend:
1. Searches strategies by `aliases`, `domains`, and semantic similarity to the user's request
2. Retrieves matching strategies, worked examples, and domain agent definitions from `knowledge/agents/`
3. Assembles the LLM prompt: system instructions + strategies + examples + agent definitions + spec schema + user request

---

## Open Questions / Future Considerations

- Should the GECKO UI shell eventually be publishable as a static site (GitHub Pages) where users bring their own Gemini API key? *(Noted as a future goal.)*
- Should the GECKO Spec File support "simulation modules" (reusable agent/environment configs that can be composed)?
- What is the right level of physics accuracy vs. educational simplicity trade-off? Should the AI be prompted to prefer conceptual clarity over numerical accuracy?
