---
name: "multi-body-constraint"
status: stable
aliases: ["rigid body", "linked particles", "molecular structure", "connected masses", "composite object", "inertia tensor", "moment of inertia"]
domains: [physics, chemistry, engineering, materials]
dimensionality: [2D, 3D]
typical_rendering: [three.js, babylon.js]
language: en

agent_pattern:
  description: "Each agent is a point-mass with fixed spatial relationships to other agents, forming a composite rigid structure"
  typical_attributes: [mass, radius, position_x, position_y, position_z, color, relative_offset]
  typical_behaviors: [fixed_relative_position, contributes_to_inertia, contributes_to_center_of_mass]

environment_pattern:
  description: "Tracks aggregate properties of the composite body (center of mass, inertia tensor) and applies external forces/torques"
  typical_attributes: [gravity, applied_torque, angular_velocity_x, angular_velocity_y, angular_velocity_z, total_energy, total_mass, inertia_tensor]

interaction_patterns:
  - trigger: user_drag_agent
    effect: apply_torque_at_agent_position
  - trigger: parameter_slider
    effect: modify_angular_velocity_or_torque
  - trigger: add_remove_agent
    effect: recalculate_aggregate_properties

visualization_hints:
  - "Show aggregate property (e.g. inertia tensor) as color-mapped overlay on agents"
  - "Arrows for angular velocity vector on center of mass"
  - "Translucent lines connecting agents to show rigid constraints"
  - "Size or opacity of agents proportional to their contribution to moment of inertia"
  - "Trajectory trace for center of mass"
---

# Multi-Body Constraint Systems

## When to use this strategy

Use when the concept involves **multiple discrete objects whose spatial relationships are fixed** and whose collective behavior produces emergent aggregate properties. The key question the learner explores is: *how does the arrangement of parts affect the behavior of the whole?*

Good candidates:
- Rigid body rotation (moment of inertia depends on mass distribution)
- Molecular geometry (how bond angles affect molecular properties)
- Structural engineering (load distribution in a truss)
- Figure skater spin (conservation of angular momentum with changing configuration)

## Modeling reasoning

The power of this strategy is that individual agents are **dead simple** (point masses at fixed positions), but the **system's behavior is emergent** and often counterintuitive. By letting the user add, remove, and reposition masses, they build physical intuition about:

- Why a figure skater spins faster with arms pulled in
- Why a long thin rod is easier to spin than a thick disk of the same mass
- How the inertia tensor determines wobble and precession

The constraint (fixed relative positions) is what makes the system a *rigid body* rather than a particle cloud. The environment manages the rotation equations using the aggregate inertia tensor computed from all agents.

## Key mathematics / logic

**Center of mass:**
```
R_cm = Σ(mᵢ × rᵢ) / Σ(mᵢ)
```

**Moment of inertia (single axis):**
```
I = Σ mᵢ × dᵢ²
```
where `dᵢ` is the perpendicular distance from agent `i` to the rotation axis.

**Angular momentum:**
```
L = I × ω
```

**Torque:**
```
τ = dL/dt = I × α    (for constant I)
```

**Rotational kinetic energy:**
```
K = ½ × I × ω²
```

## Pitfalls

- Don't model at too fine a granularity — the user should be able to *see* and *count* the agents. 5–20 agents is the sweet spot.
- Enforce the rigid constraint in the physics step: agents must not drift apart. Recalculate positions from center of mass + relative offsets after each rotation update.
- For 3D rotation, use quaternions or rotation matrices — Euler angles suffer from gimbal lock.

## Composability

- Combines with `field-interaction` when the rigid body exists in a gravitational or electromagnetic field
- Combines with `collision-response` when multiple rigid bodies can collide
- Extends naturally to `oscillation-system` for vibrating structures (relax the rigid constraint to spring constraints)

## Related strategies

- `particle-system` — when agents are *independent*, not constrained to each other
- `field-interaction` — when the environment itself (force field) is the interesting part, not the internal structure
- `oscillation-system` — when constraints are elastic (springs) rather than rigid
