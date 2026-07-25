---
name: "particle-system"
status: stable
aliases: ["swarm", "flock", "gas molecules", "brownian motion", "diffusion", "crowd", "boids", "emergent behavior", "self-organization"]
domains: [physics, biology, sociology, CS]
dimensionality: [2D, 3D]
typical_rendering: [p5.js, three.js]
language: en

agent_pattern:
  description: "Each agent is an independent particle with simple local rules; collective behavior emerges from many agents interacting"
  typical_attributes: [position, velocity, acceleration, mass, lifespan, color, size]
  typical_behaviors: [move, apply_local_rules, die_or_spawn, interact_with_neighbors]

environment_pattern:
  description: "A space (often bounded) with global forces and optional spatial partitioning for efficient neighbor queries"
  typical_attributes: [gravity, viscosity, temperature, boundary_type, wind, attraction_field]

interaction_patterns:
  - trigger: neighbor_proximity
    effect: apply_local_rule (separation, alignment, cohesion, attraction, repulsion)
  - trigger: parameter_slider
    effect: modify_global_force_or_rule_weight
  - trigger: user_click
    effect: spawn_or_attract_particles

visualization_hints:
  - "Particles as small dots or triangles (pointing in direction of velocity)"
  - "Color encodes speed, age, or cluster membership"
  - "Trail lines for a subset of particles to show flow patterns"
  - "Density heatmap overlay for large populations"
  - "No individual labels — the swarm IS the visualization"
---

# Particle Systems

## When to use this strategy

Use when the concept involves **many independent agents following simple local rules** that produce emergent collective behavior. The learner's 'aha' moment comes from seeing that complex, organized patterns arise from simple, decentralized rules.

Good candidates:
- Flocking/swarming (Boids algorithm)
- Gas behavior (Brownian motion, pressure, temperature)
- Crowd dynamics and evacuation
- Diffusion and osmosis
- Galaxy formation (many-body gravitational systems)
- Ant colony foraging

## Modeling reasoning

The key insight is **emergence**: no single particle "knows" the global pattern, yet the system self-organizes. By giving the user sliders to adjust the weight of local rules (separation distance, alignment strength, cohesion radius), they can watch order emerge from chaos — and see how small rule changes cause phase transitions.

Typically the number of agents is large (50–5000), so each agent must be computationally cheap. The environment often uses spatial hashing or a grid for neighbor lookups.

## Key mathematics / logic

**Boids rules (Reynolds, 1987):**
```
separation = -Σ (neighbor_pos - my_pos) / distance²    # avoid crowding
alignment  = average(neighbor_velocities)                # match heading
cohesion   = average(neighbor_positions) - my_pos        # move toward center
```

**Brownian motion:**
```
dx = random_gaussian(0, σ) × √dt
```

**Lennard-Jones potential (molecular attraction/repulsion):**
```
F(r) = 4ε × [12(σ/r)¹³ - 6(σ/r)⁷]
```

## Pitfalls

- **Performance**: N² neighbor checks kill frame rate. Use spatial hashing, quadtrees, or grid cells.
- **Parameter sensitivity**: Small changes in rule weights can cause dramatic behavior changes. Use normalized weights and smooth sliders.
- **Visual clutter**: With 1000+ particles, individual tracking is meaningless. Use aggregate visualizations (density, flow arrows, color gradients).

## Composability

- Combines with `field-interaction` for particles in a gravitational or electric field
- Combines with `spatial-grid` for cellular automata with particle-like mobile agents
- Combines with `collision-response` for granular material simulations

## Related strategies

- `field-interaction` — when the interaction is long-range and pair-specific, not local-rule-based
- `multi-body-constraint` — when agents are connected, not independent
- `population-dynamics` — when the focus is on birth/death rates rather than spatial movement
