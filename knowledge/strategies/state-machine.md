---
name: "state-machine"
status: stable
aliases: ["finite automaton", "cellular automaton", "game of life", "turing machine", "traffic light", "protocol", "state transition", "markov chain", "decision tree"]
domains: [CS, game-theory, biology, engineering, logic]
dimensionality: [2D]
typical_rendering: [p5.js, "canvas 2D", d3.js]
language: en

agent_pattern:
  description: "Each agent occupies one of a finite set of named states and transitions between them based on rules involving neighbors, inputs, or probabilities"
  typical_attributes: [state, position, transition_history, timer, color]
  typical_behaviors: [evaluate_transition_rules, change_state, broadcast_state_to_neighbors]

environment_pattern:
  description: "Defines the state space, transition rules, and optionally a spatial grid where agents reside"
  typical_attributes: [state_set, transition_rules, grid_size, update_mode]

interaction_patterns:
  - trigger: neighbor_state
    effect: evaluate_transition_rule
  - trigger: user_click_agent
    effect: manually_set_state
  - trigger: parameter_slider
    effect: modify_transition_probability_or_threshold
  - trigger: step_button
    effect: advance_one_generation

visualization_hints:
  - "Each state mapped to a distinct color"
  - "Grid layout for cellular automata"
  - "State transition diagram shown alongside the simulation"
  - "Generation counter and state population histogram"
  - "Step-by-step mode with highlights on agents about to transition"
---

# State Machine Systems

## When to use this strategy

Use when the concept involves **agents that switch between discrete states** based on rules — and the interesting behavior emerges from how state transitions propagate through a population or grid.

Good candidates:
- Conway's Game of Life and other cellular automata
- Traffic flow simulation (cars with states: moving, stopped, yielding)
- Epidemic models (S → I → R as explicit states)
- Digital logic circuits
- Markov chains and random walks
- Rock-paper-scissors dynamics
- Voting models and opinion dynamics

## Modeling reasoning

State machines make the *rules* visible. Each agent is a simple object that says "I am in state X" and checks its local rules to decide the next state. The learner can:
- Edit the rules and immediately see the effect on global behavior
- Paint initial conditions by clicking on agents
- Watch phase transitions as rule parameters change
- Discover that simple rules → complex behavior (the core lesson of cellular automata)

## Key mathematics / logic

**Conway's Game of Life:**
```
if alive and (neighbors < 2 or neighbors > 3): die
if alive and (neighbors == 2 or neighbors == 3): survive
if dead and neighbors == 3: become alive
```

**General transition rule (probabilistic):**
```
P(state_next | state_current, neighbor_states) = f(rule_table)
```

**Markov chain:**
```
P(Xₜ₊₁ = j | Xₜ = i) = pᵢⱼ
```

## Pitfalls

- **Update order matters**: Synchronous (all agents update at once from previous state) vs. asynchronous (agents update one at a time) gives different results. Default to synchronous and make it a toggle.
- **Boundary conditions**: Wrap-around (torus) vs. dead-border changes behavior. Make it configurable.
- **State explosion**: More than 5-6 states becomes hard to visualize with colors. Use clear, distinct colors and a legend.

## Composability

- Combines with `spatial-grid` (most cellular automata live on a grid)
- Combines with `population-dynamics` when counting agents in each state over time
- Combines with `network-flow` for state machines on networks (opinion spread on social graphs)

## Related strategies

- `spatial-grid` — the spatial substrate; `state-machine` is the logic layer
- `population-dynamics` — when you care about population counts, not individual state transitions
- `particle-system` — when agents move continuously rather than occupying discrete states
