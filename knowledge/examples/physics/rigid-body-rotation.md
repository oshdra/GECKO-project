---
name: "Rotation of Rigid Bodies"
domain: physics
tags: [rotation, 3D, angular-momentum, inertia, torque, moment-of-inertia]
strategies_used: [multi-body-constraint]
complexity: intermediate
rendering_library: three.js
language: en

agents:
  - name: MassPoint
    attributes: [mass, radius, position_x, position_y, position_z, color]
    behaviors: [fixed_relative_position, contributes_to_inertia]

environment:
  type: 3D
  physics: rigid_body_rotation
  attributes: [gravity, torque_applied, angular_velocity_x, angular_velocity_y, angular_velocity_z, total_mass, inertia_tensor, rotational_energy]

interactions:
  - trigger: drag_agent
    effect: apply_torque
  - trigger: slider_change
    effect: modify_angular_velocity
  - trigger: add_remove_agent
    effect: recalculate_inertia_tensor

evolution_path:
  - version: 1
    description: "Single random rigid body, apply torques, observe rotation"
  - version: 2
    description: "Multiple independent bodies"
  - version: 3
    description: "Mass redistribution demo (figure skater arms-in/out animation)"
  - version: 4
    description: "Spinning top stability simulation (minimum angular velocity for verticality)"
  - version: 5
    description: "Earth rotation model with layered agents (core, mantle, crust), temperature coupling, ice formation, meteorite impact events"
---

# Rotation of Rigid Bodies

## Concept

"Rotation of rigid bodies made from different parts" — exploring how the distribution of mass affects rotational behavior. The core insight is that *where* mass is located matters as much as *how much* mass there is.

## Model

Each agent is a sphere with mass and a fixed position relative to the center of mass. Together they form a rigid body. The body has angular velocity across three axes, and the user can apply torques by dragging individual agents.

This decomposition works because the user's intuition about "heavy parts" and "light parts" maps directly to visible, draggable spheres. The moment of inertia becomes *tangible* — move a heavy sphere outward and watch rotation slow down.

## Visualization

- **Three.js** 3D scene with rotatable camera
- Spheres representing mass points, sized proportional to mass
- Color-coded by contribution to moment of inertia (hot colors = high contribution)
- Angular velocity arrows on center of mass
- Translucent connecting lines showing rigid structure
- Real-time display: total mass, inertia tensor components, angular velocity per axis, rotational energy

## Interactions

- **Drag agents** to apply torque at that position
- **Sliders** for angular velocity per axis
- **Add/remove spheres** to change the rigid body configuration
- **Export/import** state and agent population as JSON

## Key physics

```
I = Σ mᵢrᵢ²           (moment of inertia)
L = Iω                  (angular momentum)
τ = dL/dt               (torque)
K = ½Iω²               (rotational kinetic energy)
```

The key demonstrations:
- Conservation of angular momentum: L is constant when no external torque
- Figure skater effect: reducing I increases ω (pull masses inward → faster spin)
- Stability: rotation about the axis with intermediate moment of inertia is unstable (tennis racket theorem)

## Expected Evolution

1. **v1**: Single random rigid body, apply torques, observe rotation
2. **v2**: Multiple independent bodies to compare
3. **v3**: Figure skater — animate masses moving inward/outward while angular momentum is conserved
4. **v4**: Spinning top — find the minimum angular velocity for stable vertical rotation (precession and nutation)
5. **v5**: Earth model — layered agents (core, mantle, crust) with temperature coupling, ice formation at poles, and meteorite impact events that change the rotation
