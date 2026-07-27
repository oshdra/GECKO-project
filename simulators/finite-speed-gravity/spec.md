---
name: "Finite Speed of Gravity"
domain: physics
tags: [gravity, 3D, orbital-mechanics, speed-of-light, general-relativity, retarded-potential, solar-system, N-body]
strategies_used: [field-interaction]
complexity: advanced
rendering_library: three.js
language: bilingual
original_language: es

agents:
  - name: CelestialBody
    attributes: [name, type, mass, radius, position_3d, velocity_3d, acceleration_map, is_initialized]
    behaviors: [emits_gravitational_spheres, responds_to_gravitational_spheres, moves_under_total_acceleration]
  - name: IdealBody
    attributes: [name, mass, position_3d, velocity_3d, acceleration_vectors]
    behaviors: [newtonian_gravity_with_all_peers, creates_buoys, serves_as_reference]
  - name: GravitationalSphere
    attributes: [origin_body, origin_position, radius, mass, registered_bodies, state]
    behaviors: [expands_at_gravity_speed, registers_entering_bodies, triggers_acceleration_calculation, marks_as_processed]

environment:
  type: 3D
  physics: newtonian_gravity_with_finite_propagation
  attributes:
    - gravity_speed
    - radiation_period
    - gravitational_constant
    - system_velocity_vector

interactions:
  - trigger: gravitational_sphere_reaches_body
    effect: calculate_acceleration_from_sphere_origin
  - trigger: parameter_change
    effect: modify_gravity_speed_or_radiation_period

evolution_path:
  - version: 1
    description: "Sol-Tierra-Luna system, gravity speed = 1c, observe stable orbits"
---

# Finite Speed of Gravity Simulator

This simulator models gravitational interaction under finite propagation speeds (retarded potentials) vs instantaneous Newtonian gravity.
