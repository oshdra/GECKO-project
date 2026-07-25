---
name: "network-flow"
status: stable
aliases: ["graph", "network", "supply chain", "traffic network", "social network", "flow optimization", "routing", "shortest path", "neural network visualization"]
domains: [economics, logistics, CS, sociology, biology]
dimensionality: [2D]
typical_rendering: [d3.js, p5.js, "canvas 2D"]
language: en

agent_pattern:
  description: "Agents are nodes in a graph connected by edges; quantities (goods, information, influence) flow along edges according to capacity and cost rules"
  typical_attributes: [capacity, demand, supply, throughput, position, label, type]
  typical_behaviors: [receive_flow, send_flow, accumulate, deplete, route]

environment_pattern:
  description: "A graph topology (directed or undirected) with global flow conservation rules and optional optimization objectives"
  typical_attributes: [total_flow, edge_capacities, routing_algorithm, time_step]

interaction_patterns:
  - trigger: user_add_remove_edge
    effect: modify_graph_topology
  - trigger: user_adjust_capacity
    effect: recalculate_flow
  - trigger: parameter_slider
    effect: modify_demand_supply_or_cost
  - trigger: user_click_node
    effect: inspect_node_flows

visualization_hints:
  - "Nodes as circles, size proportional to throughput or capacity"
  - "Edges as arrows, thickness proportional to flow"
  - "Color gradient on edges (green=under capacity, yellow=near capacity, red=at capacity)"
  - "Animated dots moving along edges to show flow direction and speed"
  - "Sankey diagram mode for hierarchical flows"
---

# Network Flow

## When to use this strategy

Use when the concept involves **quantities moving through a connected structure** — the topology of connections is as important as the agents themselves.

Good candidates:
- Supply chain optimization
- Traffic flow in road networks
- Internet packet routing
- Blood circulation
- Economic input-output models
- Neural network forward pass visualization
- Electrical circuit analysis

## Modeling reasoning

Networks make invisible connections visible. The learner sees that changing one edge (cutting a road, increasing a supply line) ripples through the entire system. The agent-as-node model is natural: each node has local state (supply, demand, inventory) and edges define how flow moves between them.

## Key mathematics / logic

**Flow conservation (Kirchhoff's current law):**
```
Σ flow_in(node) = Σ flow_out(node)    (for all non-source, non-sink nodes)
```

**Max-flow min-cut theorem:**
```
max_flow(source → sink) = min_cut_capacity
```

**Shortest path (Dijkstra):**
```
dist[v] = min(dist[u] + weight(u,v)) for all edges (u,v)
```

## Pitfalls

- **Graph layout**: Force-directed layout (d3-force) works well for small graphs but can be chaotic for large ones. Let users pin nodes.
- **Flow animation speed**: Animated dots moving too fast are distracting; too slow is boring. Tie speed to flow magnitude.
- **Directed vs undirected**: Make this explicit in the UI. Arrows on directed edges are essential.

## Composability

- Combines with `state-machine` for agents at nodes that change state based on incoming flow
- Combines with `population-dynamics` for epidemic spread on networks
- Combines with `spatial-grid` when the network is a regular lattice

## Related strategies

- `spatial-grid` — when the network is a regular grid (lattice gas, cellular automata)
- `particle-system` — when flow is continuous rather than through discrete channels
- `state-machine` — when the focus is on node state transitions, not flow quantities
