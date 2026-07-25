# Phase 1 Verification Checklist & Manual Testing Guide

**Target File:** `simulators/finite-speed-gravity/v1.html`

## How to Run

1. Open `simulators/finite-speed-gravity/v1.html` directly in any modern browser (Chrome, Firefox, Edge, Safari).
2. No local server, build step, or backend required.

---

## 1. UI Chrome & Layout Verification

- [ ] **Sidebar Placement:** Fixed sidebar appears on the right edge (320px wide) with a sleek dark theme.
- [ ] **Canvas Resizing:** Canvas fills the screen minus the sidebar width without horizontal or vertical scrollbars.
- [ ] **Top Bar:**
  - [ ] Title displays "Gravedad más allá de la luz".
  - [ ] Play/Pause button toggles state (▶ Reproducir / ⏸ Pausar).
  - [ ] Reset button (↺ Reiniciar) resets time and reinitializes bodies.
  - [ ] Export icon (⤓) downloads state JSON.
  - [ ] Import icon (⤒) opens file picker.
- [ ] **Camera Controls:**
  - [ ] Zoom + and Zoom - adjust camera distance.
  - [ ] Rot X+ / Rot X- rotate camera around X-axis while looking at origin.
  - [ ] Rot Z+ / Rot Z- rotate camera around Z-axis while looking at origin.
  - [ ] Camera readout displays distance and rotation angles in real time.
- [ ] **Debug Console:**
  - [ ] Bottom panel shows console logs (e.g. `[GECKO] Simulator initialized successfully.`).

---

## 2. Declarative Panels Verification

- [ ] **Modelos de sistema solar (Dropdown):**
  - [ ] Select "1. Sol - Tierra - Luna" -> Resets scene to Sun, Earth, Moon.
  - [ ] Select "2. Sistema Solar Interior" -> Resets scene to Sun, Mercury, Venus, Earth, Mars, Jupiter.
  - [ ] Select "3. Problema de Tres Cuerpos" -> Resets scene to 3-body system.
- [ ] **Configuración del simulador:**
  - [ ] **Velocidad del Sistema Total (Vector Input):** Enter values (e.g., X=0, Y=0, Z=250), click `✓` -> System velocity updates.
  - [ ] **Velocidad de gravedad (Number Input):** Change value (e.g., 2.0 C), click `✓` -> Sphere expansion speed doubles. Rejects negative or zero values.
  - [ ] **Periodo de radiación (Number Input):** Change value (e.g., 0.5 días), click `✓` -> Simulation timestep adjusts.
  - [ ] **Trazo Checkbox:** Enable -> Trajectory lines appear behind moving celestial bodies.
  - [ ] **Detalles Checkbox:** Enable -> Toggles telemetry detail view.
  - [ ] **Comparación Checkbox:** Enable -> Red wireframe spheres (IdealBodies) appear alongside celestial bodies.
- [ ] **Telemetría y Datos:**
  - [ ] Real-time metrics display body count, active sphere count, elapsed days, elapsed years, and theoretical difference.
- [ ] **Explicación del funcionamiento:**
  - [ ] Collapsible panel expands to reveal HTML conceptual explanation.

---

## 3. Physics & Mechanics Verification

- [ ] **Initialization Overlay:** "Fase Inicial / Initializing simulation..." appears briefly on system load and hides when initialization completes.
- [ ] **Orbital Motion:** Clicking ▶ Play causes Earth and Moon to orbit smoothly around the Sun.
- [ ] **Sphere Mechanics:** Active spheres count increases as bodies emit gravitational spheres and decreases as spheres reach all target bodies.
- [ ] **State Export / Import:**
  - [ ] Click Export icon -> `gravedad-m-s-all-de-la-luz-state.json` downloads.
  - [ ] Modify parameters, click Import icon -> Select JSON -> Settings and state restore accurately.
