---
name: "collision-response"
status: stable
aliases: ["bouncing", "impact", "momentum transfer", "elastic collision", "inelastic collision", "spin", "contact physics", "ball physics", "sports physics", "billiards", "pong"]
domains: [physics, sports, engineering, game-design]
dimensionality: [2D, 3D]
typical_rendering: [three.js, babylon.js, p5.js]
language: en

agent_pattern:
  description: "Each agent is a body with momentum that interacts with other agents through discrete contact events"
  typical_attributes: [mass, position, velocity, angular_velocity, radius, restitution_coefficient, friction_coefficient, surface_properties]
  typical_behaviors: [moves_ballistically, detects_contact, transfers_momentum, applies_spin]

environment_pattern:
  description: "A space with global forces (gravity, air resistance) and boundary surfaces that participate in collisions"
  typical_attributes: [gravity, air_resistance, boundary_surfaces, coefficient_of_restitution, time_step]

interaction_patterns:
  - trigger: agent_contact_agent
    effect: momentum_and_spin_transfer
  - trigger: agent_contact_surface
    effect: bounce_with_friction_and_spin
  - trigger: user_control
    effect: set_initial_velocity_angle_spin
  - trigger: parameter_slider
    effect: modify_physics_constants

visualization_hints:
  - "Velocity vectors as arrows on each agent"
  - "Spin/angular velocity shown as rotating texture or curved arrows"
  - "Trajectory traces as fading lines behind each agent"
  - "Color flash or particle burst on collision events"
  - "Ghost projections showing predicted trajectory before launch"
---

# Collision Response

## When to use this strategy

Use when the concept centers on **what happens when objects hit each other** — how momentum, energy, and spin are transferred during contact events. The key learning moment is the collision itself and its aftermath.

Good candidates:
- Ball sports physics (ping pong, billiards, tennis, golf)
- Car crash mechanics
- Particle accelerator collisions
- Newton's cradle
- Asteroid impacts

## Modeling reasoning

Collisions are among the most intuitive physics experiences — everyone has bounced a ball. But the *details* (why a spinning ping pong ball curves, why a glancing blow sends a billiard ball sideways) are rich with physics. The agent model works because each body carries its own state (velocity, spin) and collisions are discrete events that transform those states.

The learner's exploration arc is typically:
1. "What happens if I hit it harder?" → momentum transfer
2. "What happens if I hit it at an angle?" → vector decomposition
3. "What happens if I add spin?" → angular momentum and the Magnus effect
4. "What if air resistance matters?" → drag forces and realistic trajectories

## Key mathematics / logic

**Elastic collision (1D, equal masses):**
```
v₁' = v₂,   v₂' = v₁     (velocities simply swap)
```

**General elastic collision (1D):**
```
v₁' = ((m₁-m₂)v₁ + 2m₂v₂) / (m₁+m₂)
v₂' = ((m₂-m₁)v₂ + 2m₁v₁) / (m₁+m₂)
```

**Coefficient of restitution (inelastic):**
```
e = -(v₁' - v₂') / (v₁ - v₂)
```
Where e=1 is perfectly elastic, e=0 is perfectly inelastic.

**Magnus effect (spin-induced curve):**
```
F_magnus = C_L × ρ × A × v × ω
```
Direction perpendicular to both velocity and spin axis.

**Air resistance (drag):**
```
F_drag = ½ × C_d × ρ × A × v²
```

## Pitfalls

- **Tunneling**: At high speeds, agents can pass through each other between frames. Use continuous collision detection or reduce timestep.
- **Spin complexity**: Full 3D spin with friction is hard to get right. Start with 2D or axis-aligned spin and add complexity gradually.
- **Energy conservation**: Accumulation of floating-point errors can cause energy to grow. Monitor total kinetic energy and warn if it diverges.
- **Surface interactions**: A ball bouncing on a table is not just a collision — friction, spin, and the surface normal all matter. Model the table/paddle as agents too.

## Composability

- Combines with `field-interaction` when colliding bodies are also in a gravitational or magnetic field
- Combines with `multi-body-constraint` when the colliding objects are themselves rigid bodies (not point masses)
- Combines with `particle-system` for explosion/fragmentation effects after collision

## Related strategies

- `field-interaction` — when the force is continuous (gravity pulling), not discrete (impact event)
- `particle-system` — when there are so many collisions that individual tracking is impractical (use statistical methods instead)
- `multi-body-constraint` — when the interesting part is the internal structure of the colliding body, not the collision itself
