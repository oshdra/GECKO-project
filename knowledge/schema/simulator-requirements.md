# Simulator Requirements

Every GECKO-generated simulator must include the following features, regardless of domain or complexity.

## Mandatory UI Elements

### Controls Panel
- Sliders and/or inputs for **all relevant environment attributes** (physics constants, global parameters)
- Sliders and/or inputs for **agent-specific attributes** that the user should be able to tune
- All controls must have labels, units, and reasonable min/max/step values
- Changes should take effect in real-time (no "apply" button needed)

### State Display
- Real-time readout of **key simulation metrics** relevant to the concept
- Examples: angular velocity, energy, population count, temperature, score
- Should update every frame or at regular intervals

### Export / Import State
- **Export**: Save the full simulation state as a JSON file (download to user's machine)
- **Import**: Load a previously exported state JSON and restore the simulation
- State must include: all agent attributes, environment attributes, simulation time, and RNG seed if applicable

### Agent Management
- If the simulator supports variable agent populations:
  - **Add agents**: UI to create new agents with configurable attributes
  - **Remove agents**: Click-to-remove or selection-based removal
  - **Export agent population**: Download all agent data as JSON
  - **Import agent population**: Load a population JSON
- If agents are fixed (e.g., a rigid body with set structure), this can be simplified to a configuration panel

### Visual Aids
- **Vectors**: Arrows for velocity, force, acceleration, spin, etc. where relevant
- **Trajectories**: Trace lines showing past positions (toggleable)
- **Labels**: Agent names or key values displayed near agents (toggleable)
- **Grids/axes**: Reference lines for spatial orientation (toggleable)
- All visual aids should be toggleable to avoid visual clutter

### Responsive Layout
- The **canvas/3D view must fill the available space** without requiring scrolling
- Controls should be in a collapsible side panel or overlay
- Usable on a standard laptop screen (1366×768 minimum)
- Touch-friendly controls where possible (for tablet use)

## Rendering Library Selection Guide

| Scenario | Recommended Library |
|---|---|
| 3D physics, rigid bodies, orbital mechanics, 3D space | Three.js |
| 3D with complex physics (collisions, joints, ragdoll) | Babylon.js |
| 2D simulations, cellular automata, particle systems | p5.js or Canvas 2D API |
| Abstract / data-driven / graph visualization | D3.js |
| Lightweight 2D + charting hybrid | Chart.js + Canvas |

## Code Requirements

- **Self-contained**: All CSS and JS inline in a single HTML file
- **No server required**: Opens in any modern browser
- **UTF-8 charset**
- **External libraries loaded via CDN** (Three.js, p5.js, etc.)
- **Commented code**: Key physics/logic sections should have explanatory comments
- **Performance**: Target 30+ FPS for the default configuration
