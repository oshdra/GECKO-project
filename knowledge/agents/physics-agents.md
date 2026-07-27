# Physics Agents

This collection describes reusable agent definitions for physics-based GECKO simulators. These agent models can be composed and adapted to fit various simulation needs.

## Gravity (Finite Speed Sphere)
Model gravity as a sphere that is generated every *S* seconds. It lives in a 3D space, and its initial position is identical to the position of the mass body that generates it at a moment *t*. And while the original body will change position with time, the gravity sphere will never do it. At time 0 (when created) its radius is 0, and it expands at the Speed of Gravity by Unit of time (so speed of gravity can be set by the user), and after that all bodies inside the volume of the gravity sphere are affected by it. Once all mass bodies inside a simulation have been affected by this gravity sphere, it may be discarded.

## Gravity (Instantaneous / Newtonian) - Alternative
Model gravity as an instantaneous, continuous force vector acting between all mass-bearing agents. Instead of emitting spatial fields, each agent iterates through all other mass agents at every time step and calculates a gravitational pull directly proportional to their masses and inversely proportional to the square of the distance between them. This is the classical N-body approach, which is computationally simpler for small numbers of bodies and assumes an infinite speed of gravity.

## Ping Pong Physics
- **Ball Agent**: A lightweight spherical agent with attributes for position, linear velocity, spin (angular velocity), mass, and aerodynamic drag. Its core behavior includes updating its trajectory via projectile motion, applying the Magnus effect based on its spin and velocity, and undergoing elastic collisions (bouncing) when intersecting other agents.
- **Paddle Agent**: A rigid body agent restricted to a specific movement plane. It possesses position, velocity, and a "restitution" (bounciness) coefficient. Its behavior is driven by external input (player or AI). During a collision with the Ball Agent, it transfers momentum and applies tangential friction to alter the ball's spin based on the paddle's relative velocity and angle.
- **Table / Net Agents**: Static environmental agents representing physical boundaries. They possess physical dimensions, friction, and restitution coefficients. They do not update their positions but act as collision targets that trigger state changes in the Ball Agent (e.g., reversing vertical velocity upon bouncing on the table, or stopping the ball when hitting the net).

## Rotation of Rigid Masses
- **RigidBody Agent**: Represents a solid physical object. It possesses a center of mass, total mass, a moment of inertia tensor (defining how mass is distributed), angular velocity, and a 3D orientation (quaternion or Euler angles). Its primary behavior is integrating applied torques to update its angular velocity, thereby rotating the object around its center of mass over time.
- **Mass Point / Node Agent**: Used when a rigid body is modeled as a collection of connected points rather than a single solid primitive. Each Mass Point has a specific mass and a fixed relative distance to the center of the RigidBody. Its behavior is to contribute to the parent body's total moment of inertia.
- **Force / Thruster Agent**: An agent attached to a specific local coordinate on a RigidBody. It generates a directional force vector. Its behavior is to apply a linear force; the simulation environment then computes the resulting torque on the parent RigidBody by taking the cross product of the applied force vector and the point's distance from the center of mass.
