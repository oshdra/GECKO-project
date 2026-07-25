---
name: "Physics of Ping Pong"
domain: physics
tags: [sports, 3D, spin, magnus-effect, collision, momentum, air-resistance, friction]
strategies_used: [collision-response]
complexity: intermediate
rendering_library: three.js
language: en

agents:
  - name: Ball
    attributes: [mass, position_3d, velocity_3d, angular_velocity_3d, radius, color]
    behaviors: [moves_ballistically, responds_to_gravity, responds_to_air_resistance, transfers_spin_on_contact]
  - name: Table
    attributes: [width, length, height, friction_coefficient, friction_zones]
    behaviors: [reflects_ball_with_friction, applies_spin_modification]
  - name: Paddle
    attributes: [orientation, velocity_at_contact, surface_friction, surface_elasticity, position]
    behaviors: [imparts_velocity_and_spin_to_ball, controlled_by_user]

environment:
  type: 3D
  physics: newtonian_with_spin_and_drag
  attributes: [gravity, air_resistance_coefficient, spin_decay_rate, magnus_coefficient]

interactions:
  - trigger: ball_contacts_paddle
    effect: transfer_momentum_and_spin
  - trigger: ball_contacts_table
    effect: bounce_with_friction_and_spin_modification
  - trigger: user_control_paddle
    effect: set_paddle_angle_and_swing_speed
  - trigger: parameter_slider
    effect: modify_air_resistance_spin_coefficient_friction

evolution_path:
  - version: 1
    description: "Ball, paddle, table. Control hit angle and force. Observe trajectory."
  - version: 2
    description: "Add spin control and visual spin arrows."
  - version: 3
    description: "Challenge mode: hit targets with specific spin/trajectory requirements."
  - version: 4
    description: "Physics editor: tune all physical constants and see the effect in real time."
---

# Physics of Ping Pong

## Concept

"The physics of ping pong balls hit by paddles and tables" — exploring how spin, angle, speed, and surface properties combine to create the rich trajectory behavior of a ping pong ball. The learner discovers why topspin makes a ball dive, why backspin makes it float, and why the table surface matters.

## Model

Three agent types capture the three surfaces a ping pong ball interacts with:

- **Ball**: mass, position, velocity (3D vector), spin (angular velocity vector). The ball is the primary agent — its trajectory is the observable.
- **Table**: width, length, texture map for variable friction zones. The table is a passive surface that modifies the ball's bounce.
- **Paddle**: orientation, velocity at contact, surface properties (rubber type). The paddle is the user's tool for imparting force and spin.

## Visualization

- **Three.js** (or Babylon.js for more advanced physics)
- Ball as textured sphere with visible rotation
- Table as textured rectangle with optional friction zone overlay
- Paddles as rectangles with angled orientation
- **Velocity vector**: arrow showing ball's direction and speed
- **Spin vector**: curved arrows showing rotation axis and magnitude
- **Trajectory trace**: fading line behind the ball
- **Ghost trajectory**: predicted path before the user swings

## Interactions

- **Control paddle** angle, swing speed, and contact point
- **Sliders** for air resistance, spin coefficient, table friction, gravity
- **Spin presets**: "topspin", "backspin", "sidespin" buttons for quick setup
- **Slow-motion toggle** to see collision physics in detail

## Key physics

**Magnus effect (spin-induced curve):**
```
F_magnus = C_L × ρ × A × v × ω
```
Direction is perpendicular to both velocity and spin axis — this is why topspin makes the ball curve downward.

**Air resistance:**
```
F_drag = ½ × C_d × ρ × A × v²
```

**Bounce with spin:**
```
v_normal' = -e × v_normal              (coefficient of restitution)
v_tangential' = v_tangential - μ × ω   (friction modifies tangential velocity)
ω' = ω - friction_transfer             (spin changes at each bounce)
```

## Expected Evolution

1. **v1**: Ball + paddle + table. Control hit angle and force. Observe trajectory.
2. **v2**: Add spin control. Show spin as curved arrows on the ball.
3. **v3**: Challenge mode — hit targets at specific positions with required spin/trajectory.
4. **v4**: Full physics editor — tune every constant (gravity, air density, rubber friction, table elasticity) and see the effect in real time.
