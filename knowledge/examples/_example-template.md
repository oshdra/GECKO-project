---
# GECKO Worked Example Template
# Copy this file to create a new example.
# File location: knowledge/examples/<domain>/<example-name>.md
#
# Examples can be in English, Spanish, or bilingual.
# If the original source was in Spanish, preserve the original language in a
# `## Original Prompt (es)` section and provide an English translation above.

name: "Example Name"
domain: physics                           # physics | biology | economics | mathematics | CS | ...
tags: [tag1, tag2, tag3]
strategies_used: [strategy-name]          # links to knowledge/strategies/<name>.md
complexity: beginner                      # beginner | intermediate | advanced
rendering_library: three.js
language: en                              # en | es | bilingual

agents:
  - name: AgentTypeName
    attributes: [attr1, attr2]
    behaviors: [behavior1, behavior2]

environment:
  type: 3D                                # 2D | 3D
  physics: physics_model_name
  attributes: [attr1, attr2]

interactions:
  - trigger: user_action
    effect: simulation_response

evolution_path:
  - version: 1
    description: "MVP version"
  - version: 2
    description: "Next iteration"
---

# Example Name

## Concept

What is being explored and why it's interesting for a learner.

## Model

How agents represent the concept. Why this decomposition was chosen.

## Visualization

How the simulation should look — rendering library, visual aids, camera setup.

## Interactions

What the user can do — controls, sliders, drag behaviors.

## Key physics / logic

The core equations or rules, explained at the level a curious learner would appreciate.

## Expected Evolution

How this simulator could grow across versions.
