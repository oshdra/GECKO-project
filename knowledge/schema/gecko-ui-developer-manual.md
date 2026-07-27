# GeckoUI Developer Manual & API Guide

**Version:** 1.0  
**Target Audience:** Human Developers & Maintainers  
**Source File:** [`gecko-ui.js`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui.js)  

---

## 1. Overview & Architectural Design

`GeckoUI` is a lightweight, zero-dependency, vanilla JavaScript UI library tailored for GECKO simulators. While GECKO relies on AI agents to generate interactive web simulations automatically, **human developers** maintain `gecko-ui.js`, extend its capabilities, and embed or customize it in standalone web applications.

### Key Architectural Principles
- **Zero Build Step & Zero Dependencies:** Written in plain ES6 Vanilla JavaScript. It requires no npm packages, transpilation, or external stylesheets.
- **Embedded Style Injection:** CSS is dynamically injected into `<head>` via `injectCSS()`, defining standard CSS custom properties (variables) for dark theme styling.
- **Fixed Sidebar Layout:** Automates sidebar DOM creation (`#gecko-sidebar`) and automatically offsets document body (`body { padding-right: 320px !important }`) to ensure the canvas/renderer content area is never obscured.
- **Hybrid Reactive & Event-Driven Engine:**
  - **Polling / Getter Sync:** Polling functions (`get()`, `getState()`, `getCameraInfo()`) run inside a `requestAnimationFrame` loop to keep controls and telemetry metrics updated frame-by-frame.
  - **Event Bus:** Emits lifecycle events (`play`, `pause`, `reset`, `tick`, `import`, `change`) to decouple UI controls from simulation physics logic.
- **Built-in Internationalization (i18n):** Native support for English (`en`) and Spanish (`es`) out of the box for core UI labels.

---

## 2. Quick Start & Integration Guide

### 2.1 Standard Script Tag Inclusion
Include `gecko-ui.js` before your main simulator code.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GECKO Simulator Example</title>
</head>
<body>
  <canvas id="sim-canvas"></canvas>

  <!-- 1. Include GeckoUI Library -->
  <script src="gecko-ui.js"></script>

  <!-- 2. Simulation Logic -->
  <script>
    const canvas = document.getElementById('sim-canvas');
    let speed = 2.0;

    const ui = new GeckoUI({
      canvas: canvas,
      title: 'Particle Velocity Sim',
      language: 'en',
      accentColor: '#00e5ff',
      getState: () => ({ speed }),
      onPlay: () => console.log('Simulation started'),
      onPause: () => console.log('Simulation paused'),
      onReset: () => { speed = 2.0; },
      panels: [
        {
          id: 'controls',
          title: 'Parameters',
          controls: [
            {
              type: 'slider',
              id: 'speed-ctrl',
              label: 'Speed',
              min: 0,
              max: 10,
              step: 0.1,
              get: () => speed,
              set: (v) => { speed = v; }
            }
          ]
        }
      ]
    });
  </script>
</body>
</html>
```

---

## 3. Configuration Reference (`new GeckoUI(config)`)

The `GeckoUI` constructor accepts a single configuration object with the following properties:

| Option | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `canvas` | `HTMLElement` | **Yes** | — | Canvas or main container element for the simulator. |
| `language` | `'en' \| 'es'` | No | `'en'` | Interface language selection. Sets internal labels (`t`). |
| `title` | `string` | No | `'GECKO'` | Header title displayed in the top bar. |
| `sidebarWidth` | `number` | No | `320` | Width of the sidebar in pixels (`px`). |
| `accentColor` | `string` | No | `'#00e5ff'` | Primary theme accent color (HEX, RGB, or HSL). |
| `getState` | `Function` | No | `null` | Returns flat object `{ key: value }` polled every frame for metrics. |
| `onExport` | `Function` | No | `null` | Returns JSON-serializable object downloaded when Export is clicked. |
| `onImport` | `Function` | No | `null` | Callback executed when user imports a state JSON file (`(stateObj) => {}`). |
| `onPlay` | `Function` | No | `null` | Event hook called when simulation playback is started. |
| `onPause` | `Function` | No | `null` | Event hook called when simulation playback is paused. |
| `onReset` | `Function` | No | `null` | Event hook called when reset button is pressed. |
| `panels` | `Array<PanelConfig>` | No | `[]` | Array of declarative panel configurations. |
| `camera` | `CameraConfig` | No | `null` | Configuration object for 3D camera controls. |
| `debugConsole` | `boolean` | No | `false` | Enables embedded debug console panel at sidebar bottom. |
| `debugConsoleLines`| `number` | No | `20` | Maximum visible lines retained in debug console log buffer. |

---

## 4. Control Types Catalog

`GeckoUI` supports 9 declarative control types within panel definitions (`panels[].controls[]`).

### 4.1 `slider`
Interactive range slider with value readout badge.

```javascript
{
  type: 'slider',
  id: 'gravity',
  label: 'Gravity Constant',
  unit: 'm/s²',          // Optional unit label
  min: 0,
  max: 20,
  step: 0.1,
  value: 9.8,            // Initial fallback value
  get: () => sim.gravity,// Read current value on refresh
  set: (v) => { sim.gravity = v; }
}
```

### 4.2 `number-input`
Validated numerical text field. Reverts to previous valid value if input is invalid or `< min`.

```javascript
{
  type: 'number-input',
  id: 'mass',
  label: 'Object Mass',
  unit: 'kg',
  min: 0.001,            // Exclusive lower bound validation
  default: 1.0,
  applyOnIcon: true,     // Optional checkmark button for instant commit
  get: () => sim.mass,
  set: (v) => { sim.mass = v; }
}
```

### 4.3 `vector-input`
Three-axis vector input row (`X`, `Y`, `Z`) with optional commit icon.

```javascript
{
  type: 'vector-input',
  id: 'velocity',
  label: 'Initial Velocity',
  unit: 'm/s',
  default: { x: 0, y: 10, z: 0 },
  applyOnIcon: true,
  get: () => sim.velocity, // Returns { x, y, z }
  set: (vec) => { sim.velocity = vec; }
}
```

### 4.4 `checkbox`
Boolean checkbox toggle.

```javascript
{
  type: 'checkbox',
  id: 'show-vectors',
  label: 'Show Force Vectors',
  default: true,
  get: () => sim.showVectors,
  set: (val) => { sim.showVectors = val; }
}
```

### 4.5 `dropdown`
Select dropdown menu.

```javascript
{
  type: 'dropdown',
  id: 'integrator',
  label: 'Integration Method',
  options: [
    { value: 'euler', label: 'Euler' },
    { value: 'rk4', label: 'Runge-Kutta 4' }
  ],
  default: 'rk4',
  get: () => sim.integrator,
  set: (val) => sim.setIntegrator(val)
}
```

### 4.6 `metrics`
Real-time telemetry readout displaying values from `getState()` or `setMetric()`.

```javascript
{
  type: 'metrics',
  id: 'telemetry',
  fields: [
    { key: 'fps', label: 'FPS' },
    { key: 'energy', label: 'Total Energy', unit: 'J' }
  ]
}
```

### 4.7 `html`
Injects arbitrary HTML content into the panel (ideal for notes, equations, or visual guides).

```javascript
{
  type: 'html',
  content: '<p style="color:#aaa;">Drag agents with mouse to apply force.</p>'
}
```

### 4.8 `button`
Action button stretching full panel width.

```javascript
{
  type: 'button',
  id: 'clear-particles',
  label: 'Clear All Particles',
  onClick: () => sim.clearParticles()
}
```

### 4.9 `separator`
Horizontal rule divider line.

```javascript
{ type: 'separator' }
```

---

## 5. Camera Controls & Debug Console Integration

### 5.1 Camera Controls Configuration
Pass a `camera` object to render a 6-button grid for 3D navigation and telemetry readout.

```javascript
camera: {
  onZoomIn: () => cam.zoom(-1),
  onZoomOut: () => cam.zoom(+1),
  onRotateXPos: () => cam.rotateX(+5),
  onRotateXNeg: () => cam.rotateX(-5),
  onRotateZPos: () => cam.rotateZ(+5),
  onRotateZNeg: () => cam.rotateZ(-5),
  getCameraInfo: () => ({
    dist: cam.distance.toFixed(1),
    rotX: cam.rotX.toFixed(0) + '°'
  })
}
```

### 5.2 Embedded Debug Console
Setting `debugConsole: true` intercepts standard `console.log` and `console.error` calls, displaying log output directly in an auto-scrolling terminal pane at the bottom of the sidebar.

```javascript
ui.debugLog('Custom debug message');
```

---

## 6. Events & Animation Loop

`GeckoUI` manages a native `requestAnimationFrame` loop (`_startLoop`).

### Event Bus API

```javascript
// Register event handler
ui.on('play', () => sim.resume());
ui.on('pause', () => sim.pause());
ui.on('reset', () => sim.reset());
ui.on('import', (data) => sim.load(data));
ui.on('change', ({ id, value }) => console.log(`Control ${id} changed to`, value));

// Physics loop listener: 'tick' fires on every frame when isPlaying is true
ui.on('tick', (dt) => {
  sim.update(dt); // dt is delta time in seconds (capped at 0.1s)
});
```

---

## 7. Imperative API Reference

`GeckoUI` instances provide full programmatic control over panels, controls, and playback state:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `togglePlay()` | `()` | Toggles play/pause simulation state. |
| `setPlaying(playing)` | `(boolean)` | Explicitly sets play state (`true` / `false`) & updates topbar button. |
| `refresh()` | `()` | Executes all control `get()` calls and updates DOM elements manually. |
| `exportState()` | `()` | Triggers `onExport()` / `getState()` and initiates state `.json` file download. |
| `addPanel(config)` | `(PanelConfig)` | Dynamically appends a new collapsible panel. |
| `removePanel(id)` | `(string)` | Removes panel by ID. |
| `expandPanel(id)` | `(string)` | Programmatically expands a panel. |
| `collapsePanel(id)`| `(string)` | Programmatically collapses a panel. |
| `addControl(pId, ctrl)`| `(string, ControlConfig)`| Programmatically appends a control to an existing panel. |
| `setMetric(key, val)`| `(string, any)` | Directly updates a metrics readout key without `getState()`. |
| `debugLog(msg)` | `(string)` | Writes a raw string entry to the embedded debug console. |

---

## 8. Extension & Maintenance Guide for Human Developers

When modifying or expanding `gecko-ui.js` itself, follow these development guidelines:

1. **Maintaining Zero-Dependency Constraint:** Never add external libraries or imports. All CSS must remain inside `injectCSS()`.
2. **Adding New Languages (i18n):** Add translations to the `I18N` object at line 8 in [`gecko-ui.js`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui.js#L8-L43):
   ```javascript
   const I18N = {
     en: { ... },
     es: { ... },
     fr: { play: 'Jouer', pause: 'Pause', ... } // Example addition
   };
   ```
3. **Adding New Control Types:**
   - Extend the `switch (ctrlConfig.type)` statement in `addControl()` ([`gecko-ui.js:681`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui.js#L681)).
   - Implement DOM construction, event listeners, and `ctrlObj.refresh` callback for active-element protection.
4. **CSS Custom Properties (Theme Customization):**
   - Theme variables are attached to `:root` in `injectCSS()`. Modify default color tokens (`--gecko-bg`, `--gecko-bg-card`, `--gecko-accent`, `--gecko-border`) to tweak the visual design system.
