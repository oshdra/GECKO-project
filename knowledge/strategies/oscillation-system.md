---
name: "oscillation-system"
status: stable
aliases: ["wave", "pendulum", "spring", "harmonic motion", "resonance", "vibration", "frequency", "beats", "coupled oscillators", "sound", "music", "standing wave"]
domains: [physics, music, engineering, biology]
dimensionality: [2D, 3D]
typical_rendering: [p5.js, three.js, "canvas 2D"]
language: en

agent_pattern:
  description: "Each agent oscillates around an equilibrium position; coupling between agents creates wave propagation, resonance, and beat patterns"
  typical_attributes: [position, velocity, equilibrium_position, amplitude, frequency, phase, damping, mass, spring_constant]
  typical_behaviors: [oscillate, couple_to_neighbor, transfer_energy, damp]

environment_pattern:
  description: "Defines the medium through which oscillations propagate, coupling strength, and boundary conditions (fixed, free, periodic)"
  typical_attributes: [coupling_strength, damping_coefficient, driving_frequency, driving_amplitude, boundary_type, wave_speed]

interaction_patterns:
  - trigger: neighbor_displacement
    effect: restoring_force_via_coupling
  - trigger: user_drag_agent
    effect: displace_from_equilibrium
  - trigger: parameter_slider
    effect: modify_frequency_damping_coupling
  - trigger: driving_force_toggle
    effect: add_periodic_external_force

visualization_hints:
  - "Agents as circles/spheres displaced from equilibrium line"
  - "Springs drawn as zigzag lines between coupled agents"
  - "Color or size encodes instantaneous energy (kinetic vs potential)"
  - "Waveform graph alongside spatial view"
  - "Fourier spectrum display to show frequency components"
---

# Oscillation Systems

## When to use this strategy

Use when the concept involves **periodic motion, waves, or vibrations** — anything where agents move back and forth around equilibrium and influence each other through coupling.

Good candidates:
- Simple and compound pendulums
- Coupled oscillators and normal modes
- Wave propagation (transverse, longitudinal)
- Standing waves and resonance
- Musical instrument physics (string, pipe, membrane)
- Molecular vibrations
- Electrical LC circuits (voltage/current oscillation)

## Modeling reasoning

Oscillations are everywhere but often invisible. By making each oscillator a visible agent connected by springs, the learner can *see* energy flow between agents, watch standing waves form, and discover resonance by tuning a driving frequency.

The agent model maps naturally: each oscillator is an agent with a restoring force toward equilibrium. Coupling creates the collective behavior (waves, normal modes).

## Key mathematics / logic

**Simple harmonic oscillator:**
```
x(t) = A × cos(ωt + φ)
ω = √(k/m)
```

**Coupled oscillators (two masses, three springs):**
```
m₁ẍ₁ = -k₁x₁ + k_c(x₂ - x₁)
m₂ẍ₂ = -k₂x₂ + k_c(x₁ - x₂)
```

**Wave equation (continuous limit):**
```
∂²u/∂t² = c² × ∂²u/∂x²
```

**Resonance condition:**
```
ω_driving = ω_natural → amplitude → ∞ (undamped)
```

## Pitfalls

- **Numerical stability**: Oscillators are sensitive to integration errors. Use Verlet integration instead of Euler to conserve energy.
- **Damping**: Without damping, simulations ring forever. Include a damping slider (default low but nonzero).
- **Phase visualization**: Phase is hard to see. Use color cycling or a phase space plot (x vs ẋ).

## Composability

- Combines with `multi-body-constraint` when the oscillating structure is a rigid body with elastic joints
- Combines with `spatial-grid` for wave propagation on a 2D membrane
- Combines with `field-interaction` when waves propagate through a field (electromagnetic waves)

## Related strategies

- `multi-body-constraint` — when connections are rigid, not elastic
- `particle-system` — when agents move freely (not oscillating around equilibrium)
- `spatial-grid` — when wave propagation is on a discrete lattice
