---
name: "spatial-grid"
status: stable
aliases: ["grid", "lattice", "cellular automata", "terrain", "heatmap", "diffusion grid", "tile map", "voxel", "pixel grid", "2D grid"]
domains: [biology, CS, geography, physics, ecology]
dimensionality: [2D]
typical_rendering: [p5.js, "canvas 2D", d3.js]
language: en

agent_pattern:
  description: "Each agent is a cell in a regular grid with local state that evolves based on the states of neighboring cells"
  typical_attributes: [state, value, temperature, elevation, population, color, age]
  typical_behaviors: [update_from_neighbors, diffuse, grow, decay, respond_to_external_input]

environment_pattern:
  description: "A regular 2D (or 3D) grid that defines the spatial substrate; the grid topology (square, hex, triangular) and boundary conditions shape behavior"
  typical_attributes: [grid_width, grid_height, cell_size, topology, boundary_condition, diffusion_rate, global_modifiers]

interaction_patterns:
  - trigger: neighbor_state
    effect: update_cell_value_via_rule
  - trigger: user_paint
    effect: set_cell_state_or_value
  - trigger: parameter_slider
    effect: modify_rule_parameters
  - trigger: step_button
    effect: advance_one_generation

visualization_hints:
  - "Each cell colored by state or value (continuous color scale or discrete palette)"
  - "Grid lines optional (toggle) — helps with small grids, distracting with large ones"
  - "Hover tooltip showing cell coordinates and exact value"
  - "Time-lapse animation showing evolution over many steps"
  - "Side panel with aggregate statistics (total population, average temperature, etc.)"
---

# Spatial Grid Systems

## When to use this strategy

Use when the concept involves **a spatial substrate where local interactions between neighboring cells drive global patterns**. The grid itself is the protagonist.

Good candidates:
- Heat diffusion (temperature spreading across a surface)
- Forest fire spread
- Terrain erosion and sediment transport
- Habitat mapping and species distribution
- Ising model (magnetic domains)
- Reaction-diffusion patterns (Turing patterns, zebra stripes)
- Urban growth simulation
- Heightmap generation (procedural terrain)

## Modeling reasoning

The grid makes space *tangible*. Each cell is a little world with one or two key values (temperature, population, state), and the user can paint initial conditions directly — a much more intuitive interface than typing coordinates. Patterns that emerge (spiral waves, fractal boundaries, diffusion gradients) are immediately visible.

## Key mathematics / logic

**Heat diffusion (discrete Laplacian):**
```
T_new[i][j] = T[i][j] + α × (T[i+1][j] + T[i-1][j] + T[i][j+1] + T[i][j-1] - 4×T[i][j])
```

**Reaction-diffusion (Gray-Scott model):**
```
A_new = A + (D_A × ∇²A - A×B² + f×(1-A)) × dt
B_new = B + (D_B × ∇²B + A×B² - (k+f)×B) × dt
```

**Forest fire (probabilistic):**
```
if tree and any_neighbor_burning: catch_fire with probability p
if burning: become_ash
if empty: grow_tree with probability g
```

## Pitfalls

- **Grid size vs. performance**: A 200×200 grid has 40,000 cells to update per frame. Use typed arrays and avoid object allocation per cell.
- **Neighbor definition**: Moore (8 neighbors) vs. von Neumann (4 neighbors) gives different diffusion patterns. Make it configurable.
- **Color mapping**: Continuous values need a good color scale (e.g., viridis, inferno). Avoid rainbow — it's perceptually non-uniform.

## Composability

- Combines with `state-machine` for cellular automata (grid provides space, state-machine provides rules)
- Combines with `population-dynamics` for spatially explicit predator-prey models
- Combines with `particle-system` for agents moving on a grid (lattice gas automata)
- Combines with `oscillation-system` for wave propagation on a 2D membrane

## Related strategies

- `state-machine` — the logic layer that drives cell transitions
- `particle-system` — when agents move freely rather than occupying fixed grid cells
- `network-flow` — when the connections between cells are irregular (graph, not grid)
