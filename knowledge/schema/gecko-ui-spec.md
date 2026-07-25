# gecko-ui.js — Library Specification

**Version:** 1.0  
**Location in simulator:** Inlined verbatim inside every generated HTML file, before the simulation code.  
**Purpose:** A single vanilla-JS file that AI agents include in every GECKO simulator to get all mandatory UI chrome for free. The AI describes what it needs in a config object; the library builds, renders, and manages the full UI panel system.

---

## Design Principles

1. **Declarative core, imperative extensions.** Standard chrome (controls, state display, play/pause, export/import) is configured via a JSON-style object. Custom simulation-specific additions are added imperatively via methods.
2. **Library owns the sidebar.** The library mounts its own fixed sidebar DOM alongside the canvas. The AI just tells it where the canvas is.
3. **Reactive bindings.** The AI provides getter/setter functions per value. The library polls them on each animation frame and keeps the UI in sync automatically.
4. **Library fires lifecycle hooks.** Play/Pause/Reset are library buttons. The AI simulation loop listens to `onPlay`, `onPause`, `onReset` events.
5. **Single opinionated dark theme.** One accent color, no styling decisions for the AI.
6. **English + Spanish built in.** Library UI text is bilingual; the AI sets `language: 'en' | 'es'` at init.
7. **Vanilla JS, no dependencies, no build step.** A single self-contained `.js` block the AI inlines.

---

## Initialization

### `GeckoUI(config)`

The library is initialized by calling `new GeckoUI(config)` after the DOM is ready. Returns a `GeckoUI` instance.

```js
const ui = new GeckoUI({
  // --- Required ---
  canvas: HTMLElement,          // The canvas or renderer container element
  language: 'en',              // 'en' | 'es'

  // --- Optional identity ---
  title: 'My Simulator',       // Displayed in the top bar
  accentColor: '#00e5ff',      // CSS color string; default: '#00e5ff' (cyan)

  // --- Simulation state binding ---
  // Called each frame by the library to read the current state.
  // Returns a flat object: { key: value } pairs for all metrics to display.
  getState: () => ({
    angularVelocity: body.omega,
    totalEnergy: body.energy,
    elapsed: sim.time,
  }),

  // --- Export / Import ---
  // Called when the user clicks "Export". Must return a JSON-serializable object.
  onExport: () => sim.getFullState(),
  // Called when the user loads a state JSON. Receives the parsed object.
  onImport: (stateObj) => sim.restoreState(stateObj),

  // --- Lifecycle hooks ---
  onPlay:  () => sim.start(),
  onPause: () => sim.pause(),
  onReset: () => sim.reset(),

  // --- Declarative panels ---
  panels: [ /* see Panels section */ ],

  // --- Camera controls ---
  // If provided, the library renders camera control buttons.
  camera: {
    onZoomIn:       () => cam.zoom(+0.1),
    onZoomOut:      () => cam.zoom(-0.1),
    onRotateXPos:   () => cam.rotateX(+5),
    onRotateXNeg:   () => cam.rotateX(-5),
    onRotateZPos:   () => cam.rotateZ(+5),
    onRotateZNeg:   () => cam.rotateZ(-5),
    // Optional: display current camera info in a readout
    getCameraInfo:  () => ({ distance: cam.d, rotX: cam.rx, rotZ: cam.rz }),
  },

  // --- Debug console ---
  // If true, the library intercepts console.log and shows last N lines in a panel.
  debugConsole: false,
  debugConsoleLines: 20,
});
```

---

## Declarative Panels

Panels are collapsible sections in the sidebar. Defined in the `panels` array of the config. Each panel has a `title`, optional `collapsed: true` default, and an array of `controls`.

```js
panels: [
  {
    id: 'sim-config',            // unique string ID
    title: 'Simulator Config',   // panel header text (AI provides; not auto-translated)
    collapsed: false,            // default open/closed state
    controls: [ /* see Controls section */ ],
  },
  {
    id: 'explanation',
    title: 'How it works',
    collapsed: true,
    controls: [
      { type: 'html', content: '<p>Explanation text here...</p>' },
    ],
  },
]
```

---

## Control Types

Each control is an object in a panel's `controls` array.

---

### Slider

```js
{
  type: 'slider',
  id: 'gravity-speed',           // unique ID
  label: 'Gravity Speed',        // display label
  unit: 'C',                     // unit string shown after the value
  min: 0.1,
  max: 10.0,
  step: 0.1,
  value: 1.0,                    // initial value
  get: () => sim.gravitySpeed,   // called each frame to keep slider in sync
  set: (v) => { sim.gravitySpeed = v; }, // called on user interaction
}
```

---

### Numeric Input

Like a slider but rendered as a text input with validation. The library rejects non-positive numbers and restores the previous value if invalid (matching the original gravity simulator behavior).

```js
{
  type: 'number-input',
  id: 'radiation-period',
  label: 'Radiation Period',
  unit: 'days',
  default: 1.0,
  min: 0.001,                    // exclusive lower bound for validation
  get: () => sim.radiationPeriod,
  set: (v) => { sim.radiationPeriod = v; },
  // Optional: inline apply button (shows an icon next to the input)
  applyOnIcon: true,             // default: false (applies on blur/Enter)
}
```

---

### Vector Input

Three numeric inputs (x, y, z) for a 3D vector, with an apply icon. Matches the "System Velocity" control from the original gravity simulator.

```js
{
  type: 'vector-input',
  id: 'system-velocity',
  label: 'System Velocity',
  unit: 'km/s',
  default: { x: 0.0, y: 0.0, z: 250.0 },
  get: () => sim.systemVelocity,
  set: (v) => { sim.systemVelocity = v; },  // v is { x, y, z }
  applyOnIcon: true,
}
```

---

### Checkbox / Toggle

```js
{
  type: 'checkbox',
  id: 'trace-mode',
  label: 'Trace',
  default: false,
  get: () => sim.traceMode,
  set: (v) => { sim.traceMode = v; },
}
```

---

### Dropdown / Combo Box

Stretched to full panel width. When selection changes, `set` is called with the selected value.

```js
{
  type: 'dropdown',
  id: 'solar-system',
  label: 'Solar System Model',
  options: [
    { value: 'sol-earth-moon', label: 'Sol - Earth - Moon' },
    { value: 'inner-solar',    label: 'Inner Solar System' },
    { value: 'three-body',     label: 'Three-Body Problem' },
  ],
  default: 'sol-earth-moon',
  get: () => sim.selectedSystem,
  set: (v) => sim.loadSystem(v),
}
```

---

### Metrics Readout

A named group of key-value rows. Values are read from `getState()` using the specified keys. Updates every frame automatically.

```js
{
  type: 'metrics',
  id: 'body-data',
  label: 'Body Telemetry',
  // Keys must match keys returned by getState()
  fields: [
    { key: 'angularVelocity', label: 'omega', unit: 'rad/s' },
    { key: 'totalEnergy',     label: 'E',     unit: 'J' },
    { key: 'elapsed',         label: 'Elapsed', unit: 'days' },
  ],
}
```

---

### HTML Block

Free-form HTML injected into the panel. For explanations, diagrams, etc.

```js
{
  type: 'html',
  content: '<p>This simulator explores...</p>',
}
```

---

### Button

```js
{
  type: 'button',
  id: 'add-body',
  label: 'Add Body',
  onClick: () => sim.addRandomBody(),
}
```

---

### Separator

Visual horizontal rule between controls.

```js
{ type: 'separator' }
```

---

## Imperative API

After initialization, the `GeckoUI` instance exposes these methods for dynamic modifications.

### Panel operations

```js
// Add a new panel at runtime
ui.addPanel({ id, title, collapsed, controls });

// Add a control to an existing panel
ui.addControl(panelId, controlConfig);

// Remove a panel
ui.removePanel(panelId);

// Programmatically expand or collapse a panel
ui.expandPanel(panelId);
ui.collapsePanel(panelId);
```

### State operations

```js
// Programmatically trigger export (same as user clicking Export)
ui.exportState();

// Set the playing state from simulation code (syncs the play/pause button icon)
ui.setPlaying(true);

// Force a one-time refresh of all reactive bindings
ui.refresh();
```

### Metrics

```js
// Push a single metric value (alternative to getState() polling)
ui.setMetric(key, value);
```

### Debug console

```js
// If debugConsole: true, console.log is auto-intercepted.
// To manually push a message:
ui.debugLog('Gravity sphere registered Earth.');
```

---

## Events

The library emits named events the AI can listen to:

```js
ui.on('play',   () => sim.start());
ui.on('pause',  () => sim.pause());
ui.on('reset',  () => sim.reset());

// Fired after a state JSON is successfully loaded
ui.on('import', (stateObj) => sim.restoreState(stateObj));

// Fired when any control value changes
// event: { id: 'control-id', value: newValue }
ui.on('change', (event) => console.log(event));

// Fired every animation frame while playing (library owns the rAF loop)
ui.on('tick', (dt) => sim.step(dt));
```

**Note on loop ownership:** The library fires a `tick` event every animation frame while in playing state. The AI simulation loop MUST listen to `tick` to integrate its physics. The library does NOT call `requestAnimationFrame` when paused.

---

## Layout and DOM Structure

The library injects the following structure into `document.body`:

```
body
+-- #gecko-sidebar  (fixed, right side, 320px wide by default)
|   +-- #gecko-topbar      (title + play/pause/reset + export/import icons)
|   +-- #gecko-camera      (zoom/rotate buttons, if camera config present)
|   +-- #gecko-panels      (declarative collapsible panel list)
|   +-- #gecko-debug       (debug console, if enabled)
+-- canvas (untouched; offset by sidebar width via body padding)
```

The sidebar is 320px wide by default. Override with `sidebarWidth: 380` in config.
The canvas and its container are automatically offset so they do not overlap the sidebar.

---

## Full Usage Example (Finite Speed of Gravity)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Finite Speed of Gravity</title>
</head>
<body>
<canvas id="c"></canvas>

<!-- 1. Inline gecko-ui.js source here verbatim -->
<script>
/* === BEGIN gecko-ui.js v1.0 === */
// ... full library source inlined here by the AI generation pipeline
/* === END gecko-ui.js === */
</script>

<!-- 2. External rendering library -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- 3. Simulation code -->
<script>
const sim = new GravitySim();
const cam = new CameraController();

const ui = new GeckoUI({
  canvas: document.getElementById('c'),
  language: 'en',
  title: 'Finite Speed of Gravity',
  accentColor: '#00e5ff',

  getState: () => ({
    bodies:  sim.bodies.length,
    spheres: sim.spheres.length,
    elapsed: sim.days.toFixed(1),
    years:   (sim.days / 365.25).toFixed(2),
  }),

  onExport: () => sim.exportState(),
  onImport: (s) => sim.importState(s),
  onReset:  () => sim.reset(),

  camera: {
    onZoomIn:      () => cam.zoom(+0.5),
    onZoomOut:     () => cam.zoom(-0.5),
    onRotateXPos:  () => cam.rotateX(+5),
    onRotateXNeg:  () => cam.rotateX(-5),
    onRotateZPos:  () => cam.rotateZ(+5),
    onRotateZNeg:  () => cam.rotateZ(-5),
    getCameraInfo: () => ({ dist: cam.distance.toFixed(1), rotX: cam.rx, rotZ: cam.rz }),
  },

  debugConsole: true,
  debugConsoleLines: 20,

  panels: [
    {
      id: 'systems',
      title: 'Solar System Models',
      collapsed: false,
      controls: [
        {
          type: 'dropdown',
          id: 'system-select',
          label: 'Active Model',
          options: [
            { value: 'sol-earth-moon', label: 'Sol - Earth - Moon' },
            { value: 'inner-solar',    label: 'Inner Solar System' },
            { value: 'three-body',     label: 'Three-Body Problem' },
          ],
          default: 'sol-earth-moon',
          get: () => sim.selectedSystem,
          set: (v) => sim.loadSystem(v),
        },
        { type: 'separator' },
        { type: 'button', id: 'export-system', label: 'Export System JSON',
          onClick: () => sim.exportSystem() },
        { type: 'button', id: 'import-system', label: 'Import System JSON',
          onClick: () => sim.importSystem() },
      ],
    },
    {
      id: 'sim-config',
      title: 'Simulator Configuration',
      collapsed: false,
      controls: [
        {
          type: 'vector-input',
          id: 'system-velocity',
          label: 'System Velocity',
          unit: 'km/s',
          default: { x: 0.0, y: 0.0, z: 250.0 },
          get: () => sim.systemVelocity,
          set: (v) => { sim.systemVelocity = v; },
          applyOnIcon: true,
        },
        {
          type: 'number-input',
          id: 'gravity-speed',
          label: 'Gravity Speed',
          unit: 'C',
          default: 1.0,
          min: 0.001,
          get: () => sim.gravitySpeed,
          set: (v) => { sim.gravitySpeed = v; },
          applyOnIcon: true,
        },
        {
          type: 'number-input',
          id: 'radiation-period',
          label: 'Radiation Period',
          unit: 'days',
          default: 1.0,
          min: 0.001,
          get: () => sim.radiationPeriod,
          set: (v) => { sim.radiationPeriod = v; },
          applyOnIcon: true,
        },
        { type: 'separator' },
        { type: 'checkbox', id: 'trace',      label: 'Trace',
          get: () => sim.traceMode,      set: (v) => { sim.traceMode = v; } },
        { type: 'checkbox', id: 'details',    label: 'Details',
          get: () => sim.detailsMode,    set: (v) => { sim.detailsMode = v; } },
        { type: 'checkbox', id: 'comparison', label: 'Comparison',
          get: () => sim.comparisonMode, set: (v) => { sim.comparisonMode = v; } },
      ],
    },
    {
      id: 'data',
      title: 'Data',
      collapsed: true,
      controls: [
        {
          type: 'metrics',
          id: 'telemetry',
          label: '',
          fields: [
            { key: 'bodies',  label: 'Bodies',  unit: '' },
            { key: 'spheres', label: 'Spheres', unit: '' },
            { key: 'elapsed', label: 'Elapsed', unit: 'days' },
            { key: 'years',   label: '',        unit: 'years' },
          ],
        },
      ],
    },
    {
      id: 'explanation',
      title: 'How it works',
      collapsed: true,
      controls: [
        { type: 'html', content: '<p>This simulator models gravity as a field that propagates at a finite speed. Change <strong>Gravity Speed</strong> (in multiples of c) to explore what happens when gravity is faster or slower than light.</p>' },
      ],
    },
  ],
});

ui.on('tick', (dt) => {
  sim.step(dt);
  renderer.render(scene, camera);
});
</script>
</body>
</html>
```

---

## Built-in i18n Strings

The library ships with translations for all its own chrome labels.

| Key | English | Spanish |
|---|---|---|
| play | Play | Reproducir |
| pause | Pause | Pausar |
| reset | Reset | Reiniciar |
| export | Export State | Exportar Estado |
| import | Import State | Importar Estado |
| importError | Invalid state file | Archivo de estado invalido |
| confirmDelete | Are you sure? | estas seguro? |
| debug | Debug Console | Consola de Depuracion |

Panel titles and control labels are always provided by the AI and are not auto-translated.

---

## What the AI Does NOT Need to Write

When using this library, the AI simulation code does NOT need to write:

- Any HTML for the sidebar, panels, or controls
- Any CSS for the UI (the library inlines its own styles)
- Play/pause/reset button logic or DOM
- Export/import button logic, file download, or file picker
- Camera control button DOM
- Debug console DOM or console.log interception
- Real-time metric display polling loop
- Slider validation or sync logic
- Number input validation (positive numbers, restore-on-invalid)

The AI only needs to:
1. Inline gecko-ui.js (the generation pipeline does this automatically)
2. Write the simulation logic (physics, Three.js scene, etc.)
3. Call `new GeckoUI(config)` with the appropriate bindings
4. Listen to `ui.on('tick', ...)` for the animation loop

---

## Versioning and File Location

The library version is embedded as `GeckoUI.VERSION = '1.0'`.

When the GECKO backend generates a simulator, it reads the full library source from:
```
knowledge/schema/gecko-ui.js
```
and inlines it verbatim between these markers in the output HTML:
```
/* === BEGIN gecko-ui.js v1.0 === */
/* === END gecko-ui.js === */
```
