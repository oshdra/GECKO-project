---
name: "population-dynamics"
status: stable
aliases: ["predator prey", "lotka volterra", "epidemic", "SIR model", "growth", "carrying capacity", "ecosystem", "birth death", "logistic growth", "competition"]
domains: [biology, ecology, epidemiology, economics, sociology]
dimensionality: [2D]
typical_rendering: [p5.js, d3.js, "canvas 2D"]
language: en

agent_pattern:
  description: "Each agent belongs to a population type with birth, death, and interaction rates; the population count over time is the key observable"
  typical_attributes: [type, position, state, age, energy, reproduction_probability]
  typical_behaviors: [move_randomly, reproduce, die, consume, infect, recover]

environment_pattern:
  description: "A bounded space with resource distribution and carrying capacity that limits population growth"
  typical_attributes: [carrying_capacity, resource_regeneration_rate, space_size, season]

interaction_patterns:
  - trigger: agent_proximity_different_type
    effect: predation_or_infection_or_competition
  - trigger: parameter_slider
    effect: modify_birth_death_rates
  - trigger: time_progression
    effect: age_and_resource_depletion

visualization_hints:
  - "Agents as colored dots (one color per population type)"
  - "Real-time population graph (line chart) alongside spatial view"
  - "Phase portrait (population A vs population B)"
  - "Color intensity of environment cells showing resource availability"
---

# Population Dynamics

## When to use this strategy

Use when the concept involves **populations of agents that grow, shrink, and interact** over time. The learner explores how interaction rates (predation, infection, competition) and environmental constraints (resources, carrying capacity) shape population trajectories.

Good candidates:
- Predator-prey ecosystems (Lotka-Volterra)
- Epidemic spread (SIR, SEIR models)
- Competition and coexistence
- Logistic growth and carrying capacity
- Evolutionary dynamics (fitness-based selection)

## Modeling reasoning

Population dynamics sits at the intersection of two views:
1. **Equation-based** (Lotka-Volterra ODEs): elegant but abstract
2. **Agent-based** (individual organisms with rules): concrete and explorable

GECKO should use the agent-based view for visualization while optionally showing the ODE predictions as overlay curves. This lets the learner see *why* the equations work — and where they break down (stochastic extinction, spatial clustering, etc.).

## Key mathematics / logic

**Lotka-Volterra (predator-prey):**
```
dR/dt = αR - βRF          # prey: grows, eaten by predators
dF/dt = δβRF - γF         # predators: grow by eating, die naturally
```

**Logistic growth:**
```
dN/dt = rN(1 - N/K)       # r = growth rate, K = carrying capacity
```

**SIR epidemic model:**
```
dS/dt = -βSI/N
dI/dt = βSI/N - γI
dR/dt = γI
```

## Pitfalls

- **Stochastic extinction**: With small populations, random fluctuations can kill a species even when the ODE predicts survival. This is a feature, not a bug — highlight it to the learner.
- **Spatial effects matter**: Well-mixed (non-spatial) models miss spatial refugia and wave-like spread. Use a spatial view.
- **Time scale**: Population dynamics can be slow. Provide a speed slider and show multiple generations per frame.

## Composability

- Combines with `spatial-grid` for spatially explicit ecosystems or epidemic models on a lattice
- Combines with `state-machine` when agents have internal states (susceptible → infected → recovered)
- Combines with `network-flow` for epidemic spread on social networks

## Related strategies

- `particle-system` — when spatial movement is the focus, not population counts
- `state-machine` — when the internal state transitions of individual agents are more interesting than population-level dynamics
- `spatial-grid` — when the environment's spatial structure drives the dynamics
