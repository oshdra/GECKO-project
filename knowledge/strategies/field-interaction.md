---
name: "field-interaction"
status: stable
aliases: ["gravity", "gravitational field", "electromagnetic field", "force field", "field propagation", "radiation", "wave propagation", "finite speed interaction"]
domains: [physics, astrophysics, electromagnetism]
dimensionality: [2D, 3D]
typical_rendering: [three.js, babylon.js]
language: en

agent_pattern:
  description: "Each agent is a body that both generates and responds to a field that permeates the environment"
  typical_attributes: [mass, charge, position, velocity, radius, type, name]
  typical_behaviors: [generates_field, responds_to_field, moves_under_acceleration, orbits]

environment_pattern:
  description: "A continuous space where fields propagate — optionally at finite speed — and exert forces on agents"
  typical_attributes: [field_speed, gravitational_constant, time_step, damping, boundary_conditions]

interaction_patterns:
  - trigger: field_reaches_agent
    effect: calculate_acceleration_and_update_velocity
  - trigger: parameter_slider
    effect: modify_field_speed_or_constant
  - trigger: user_click_drag
    effect: place_or_move_agent

visualization_hints:
  - "Show field propagation as expanding transparent spheres or wavefronts"
  - "Use trajectory traces (lines) to show orbital paths"
  - "Color-code agents by type (stars=yellow, planets=blue, moons=white)"
  - "Arrows for velocity and acceleration vectors"
  - "Optionally show 'ideal' reference bodies for comparison with/without field delay"
---

# Field Interaction

## When to use this strategy

Use when the concept involves **bodies interacting through a continuous field** — gravity, electromagnetism, or any force that propagates through space. Especially powerful when the user wants to explore **what happens when the interaction isn't instantaneous** (finite propagation speed).

This is the right strategy when:
- Objects exert forces on each other at a distance
- The force depends on distance (inverse square law, etc.)
- The user wants to see orbits, trajectories, or multi-body dynamics
- There's a propagation delay or wave-like behavior in the interaction

## Modeling reasoning

The core insight is the separation between **the source of the field** and **the effect of the field**. In classical Newtonian gravity, we pretend the field is instantaneous — but physically, gravitational effects propagate at the speed of light. By making the propagation speed a variable, the user can explore:

- Why instantaneous gravity is a good approximation for slow systems
- What breaks when gravity is slower or faster than light
- How retarded potentials affect orbital stability

The agent decomposition is natural: each celestial body is an agent. The field propagation can be modeled as expanding spheres (gravitational wavefronts) that "register" agents as they reach them.

## Key mathematics / logic

**Newtonian gravitational acceleration:**
```
a = G * M / r²
```
Where `r` is the distance between the agent and the field source (or the center of the expanding field sphere).

**Field propagation:**
```
sphere_radius(t) = field_speed × t
```
An agent feels the gravitational pull of another agent only when the field sphere from that agent reaches it. The force is calculated using the *position where the source was when it emitted the field*, not where it is now.

**Velocity and position integration (Euler or Verlet):**
```
v(t+dt) = v(t) + a(t) × dt
x(t+dt) = x(t) + v(t+dt) × dt
```

## Pitfalls

- **Unit coherence**: Mixing AU, km, km/s, solar masses, and days requires careful conversion. Define a unit system early and document every conversion factor.
- **N-body scaling**: With N agents, each emitting field spheres every timestep, memory grows as O(N × T). Prune spheres that have already reached all agents.
- **Integration accuracy**: Simple Euler integration accumulates energy errors. For long-running orbital simulations, consider symplectic integrators (Leapfrog/Verlet).
- **Visualization scale**: Planetary systems span enormous distance ratios. Use a proportion factor (`ppr`) to map AU to scene units, and resize bodies for visibility rather than physical accuracy.

## Composability

- Combines with `multi-body-constraint` when agents form rigid structures (e.g., binary star systems treated as one body)
- Combines with `collision-response` when agents can collide (e.g., asteroid impacts)
- Combines with `particle-system` for debris fields or accretion disks

## Related strategies

- `multi-body-constraint` — when agents have fixed relative positions (rigid bodies), not free orbital motion
- `particle-system` — when agents are independent and numerous (thousands), without detailed pair interactions
- `oscillation-system` — when the field itself oscillates (electromagnetic waves, sound)
