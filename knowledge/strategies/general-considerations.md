# General Considerations

## General aseveration

The standard case. Just create agents and environment that embodies the mathematics behind the aseveration, with the variables of the aseveration as the main parameters of the simulation.

## Test aseveration

When the objective is to understand a specific aseveration, one fun way to do it is to see what would happen if it was false. So, if you have one specific agent behaving with a set of rules scientifically approved, you can create a set of opposition agents that break one or more rules. Then in the simulator you can run the simulation with the original agent and with the opposition agents and compare the results. This can be very useful to understand the sensitivity of the system to specific rules or parameters.

Example: assert = "Gravity propagation velocity is equal to the speed of light"

So, you have a kind of agent that propagates gravity with the speed of light. You can create an opposition agent that propagates gravity at a speed X, where X is a variable of the simulator. Then you can run the simulation with both agents and compare the results.

In this cases, is good to have a variable that records the comparison between both agents. So, in the example, the distance between them, would make sense as an interesting variable to monitor and show in the UI.
