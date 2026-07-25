---
name: "gradient-descent"
status: stable
aliases: ["optimization", "loss landscape", "hill climbing", "simulated annealing", "genetic algorithm", "fitness landscape", "machine learning", "neural network training", "local minimum", "saddle point"]
domains: [mathematics, CS, ML, physics, economics]
dimensionality: [2D, 3D]
typical_rendering: [three.js, p5.js, d3.js]
language: en

agent_pattern:
  description: "Each agent is a point traversing a landscape (function surface), following a descent/ascent rule toward optima"
  typical_attributes: [position_x, position_y, value, gradient_x, gradient_y, learning_rate, momentum, velocity, color]
  typical_behaviors: [evaluate_function, compute_gradient, step_toward_optimum, escape_local_minimum]

environment_pattern:
  description: "A mathematical function surface (loss landscape) that agents navigate; the surface can be fixed or deformable"
  typical_attributes: [function_definition, global_minimum, local_minima, saddle_points, surface_resolution]

interaction_patterns:
  - trigger: user_click_surface
    effect: place_agent_at_position
  - trigger: parameter_slider
    effect: modify_learning_rate_momentum_or_function
  - trigger: step_button
    effect: advance_one_optimization_step
  - trigger: user_modify_surface
    effect: deform_loss_landscape

visualization_hints:
  - "3D surface with contour lines or color-coded height"
  - "Agents as spheres/dots rolling on the surface"
  - "Trajectory trace showing optimization path"
  - "Arrows showing gradient direction at agent position"
  - "Side panel showing loss value over time (convergence curve)"
  - "Highlight local minima, global minimum, and saddle points"
---

# Gradient Descent / Optimization Landscapes

## When to use this strategy

Use when the concept involves **navigating a mathematical landscape to find optimal points**. The learner builds intuition about why optimization is hard, why different algorithms work, and what "getting stuck" means.

Good candidates:
- Gradient descent visualization for ML learning
- Loss landscape exploration (why neural networks converge or don't)
- Simulated annealing (escaping local minima with temperature)
- Genetic algorithms (population of agents on a fitness landscape)
- Hill climbing and its limitations
- Potential energy surfaces in chemistry
- Economic utility maximization

## Modeling reasoning

Optimization is abstract and mathematical — but a ball rolling on a hilly surface is viscerally understandable. By making the function surface visible and letting the user place "balls" (agents) on it, they can:
- See why starting position matters (different basins of attraction)
- Watch gradient descent "oscillate" in narrow valleys
- Compare algorithms (SGD vs momentum vs Adam) side by side
- Deform the surface and see how the optimal path changes

## Key mathematics / logic

**Gradient descent:**
```
θ_new = θ - η × ∇f(θ)
```

**Momentum:**
```
v_new = β × v - η × ∇f(θ)
θ_new = θ + v_new
```

**Simulated annealing acceptance:**
```
P(accept worse) = exp(-ΔE / T)
```

**Common test functions:**
```
Rosenbrock: f(x,y) = (1-x)² + 100(y-x²)²
Rastrigin:  f(x,y) = 20 + x² + y² - 10(cos(2πx) + cos(2πy))
Himmelblau: f(x,y) = (x²+y-11)² + (x+y²-7)²
```

## Pitfalls

- **Surface rendering performance**: High-resolution 3D surfaces are expensive. Use a grid mesh (100×100 is usually enough) and interpolate.
- **Learning rate sensitivity**: Too large → divergence; too small → no visible movement. Show both failure modes.
- **Dimensionality**: Real ML landscapes are 1000+ dimensional. Acknowledge this limitation to the learner — the 2D/3D view is a projection.

## Composability

- Combines with `particle-system` for genetic algorithms (population of agents on the landscape)
- Combines with `state-machine` for discrete optimization (simulated annealing with state transitions)

## Related strategies

- `particle-system` — for genetic algorithms where many agents explore the landscape simultaneously
- `field-interaction` — when the "landscape" is a physical force field, not a mathematical function
- `spatial-grid` — for discrete optimization on a grid (combinatorial problems)
