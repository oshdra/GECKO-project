---
name: "Finite Speed of Gravity"
domain: physics
tags: [gravity, 3D, orbital-mechanics, speed-of-light, general-relativity, retarded-potential, solar-system, N-body]
strategies_used: [field-interaction]
complexity: advanced
rendering_library: three.js
language: bilingual
original_language: es

agents:
  - name: CelestialBody
    attributes: [name, type, mass, radius, position_3d, velocity_3d, acceleration_map, is_initialized]
    behaviors: [emits_gravitational_spheres, responds_to_gravitational_spheres, moves_under_total_acceleration]
  - name: IdealBody
    attributes: [name, mass, position_3d, velocity_3d, acceleration_vectors]
    behaviors: [newtonian_gravity_with_all_peers, creates_buoys, serves_as_reference]
  - name: GravitationalSphere
    attributes: [origin_body, origin_position, radius, mass, registered_bodies, state]
    behaviors: [expands_at_gravity_speed, registers_entering_bodies, triggers_acceleration_calculation, marks_as_processed]

environment:
  type: 3D
  physics: newtonian_gravity_with_finite_propagation
  attributes:
    - gravity_speed         # multiple of c (default: 1.0c)
    - radiation_period      # time step in days (default: 1.0)
    - gravitational_constant
    - system_velocity_vector  # bulk motion of entire system (km/s)

interactions:
  - trigger: gravitational_sphere_reaches_body
    effect: calculate_acceleration_from_sphere_origin
  - trigger: parameter_change
    effect: modify_gravity_speed_or_radiation_period
  - trigger: comparison_mode_toggle
    effect: show_ideal_bodies_alongside_real_bodies
  - trigger: trace_mode_toggle
    effect: draw_trajectory_lines
  - trigger: system_selector
    effect: load_different_solar_system_model

evolution_path:
  - version: 1
    description: "Sol-Tierra-Luna system, gravity speed = 1c, observe stable orbits"
  - version: 2
    description: "6-body system (Sol through Jupiter), observe Keplerian orbits with finite-speed corrections"
  - version: 3
    description: "Three-body problem configuration, explore chaotic sensitivity"
  - version: 4
    description: "Variable gravity speed (0.5c to 10c), observe orbital stability/instability"
  - version: 5
    description: "Comparison mode: side-by-side finite-speed vs instantaneous gravity"
---

# Finite Speed of Gravity — Solar System Simulator

## Concept

Today we consider the speed of gravity and the speed of light to be equal (c ≈ 299,792 km/s). But what would happen if gravity propagated at a different speed? This simulator lets the user explore that question by making the speed of gravity a configurable variable and observing how it affects the evolution of a solar system.

This is the founding concept that inspired the GECKO project.

## Model

The model introduces a novel abstraction: **Gravitational Spheres**. Instead of computing instantaneous gravity between all body pairs (the Newtonian approximation), each body periodically emits an expanding sphere that carries its gravitational influence outward. Other bodies feel the gravitational pull only when a sphere reaches them — and the force is calculated using the emitter's position *at the time of emission*, not its current position.

This creates a **retarded potential** effect: bodies respond to where other bodies *were*, not where they *are*.

### Agent types

1. **CelestialBody**: A star, planet, or satellite with mass, position, velocity. Generates gravitational spheres and responds to incoming ones.
2. **IdealBody**: A paired reference body that uses standard Newtonian gravity (instantaneous). By comparing a CelestialBody's position with its IdealBody pair, the user can see the cumulative effect of finite gravity speed.
3. **GravitationalSphere**: An expanding sphere emitted by each CelestialBody every radiation period. Tracks which bodies it has registered (affected). Once all bodies are registered, it's marked as "processed" and removed from memory.

### The initialization phase

Because gravitational spheres take time to reach distant bodies, the simulator needs an initialization phase where spheres are emitted and expanded until every body has been "reached" by every other body's spheres at least once. During this phase, CelestialBodies mirror their IdealBody's position. Only after initialization does the finite-speed effect begin to diverge.

## Visualization

- **Three.js** 3D scene
- Stars: yellow spheres with PointLight, largest visible size
- Planets: blue spheres, medium size
- Satellites: white spheres, smallest size
- Camera initially on z-axis, looking at origin (0,0,0)
- The most massive body is fixed at scene origin ("Reference Base") — all other positions are relative
- Proportion factor `ppr` maps AU to scene units
- **Trace mode**: trajectory lines per body (same color as body)
- **Comparison mode**: IdealBodies shown as red wireframe spheres alongside their CelestialBody pairs
- **Details panel**: velocity, theoretical difference, elapsed time, camera info, sphere count

## Interactions

- **System selection**: Combo box to choose which solar system model to simulate
- **System editor**: Full CRUD for solar system models — add/remove bodies, edit attributes, import/export JSON
- **Simulation controls**: Play/pause, reset, camera zoom and rotation
- **Parameter sliders**: Gravity speed (in multiples of c), radiation period (in days), system velocity vector (km/s per axis)
- **Mode toggles**: Trace (trajectory lines), Details (data panel), Comparison (ideal bodies)

## Key physics

**Gravitational acceleration (sphere-based):**
```
a = G × M_sphere / r²
```
where `r` is the distance from the CelestialBody to the *center of the gravitational sphere* (the position where the emitter was at emission time).

**Sphere expansion:**
```
new_radius = old_radius + (gravity_speed × radiation_period)
```

**Position integration:**
```
v_total = v_initial + Σ(acceleration_vectors) × dt + system_velocity
new_position = old_position + v_total × dt
```

## Default solar system models

1. **Sol - Tierra - Luna**: Distances reflect real AU separations
2. **Sol - Mercurio - Venus - Tierra - Marte - Júpiter**: Inner solar system + Jupiter
3. **Three-body problem**: A known configuration from three-body dynamics research

## Expected Evolution

The natural growth path for this simulator is expanding the range of experiments:
- Add more bodies and observe stability limits
- Add collision detection for close approaches
- Add mass variation (what if a star loses mass?)
- Add gravitational wave visualization (ripples on a mesh)

---

## Original Prompt (es)

> **Note**: The original Spanish prompt that inspired this simulator and the GECKO project is preserved at [PromptGravedadFinita.txt](file:///home/mark/PromptGravedadFinita.txt). It contains the complete algorithmic specification including the initialization phase, gravitational sphere mechanics, visualization algorithms, and UI layout.
