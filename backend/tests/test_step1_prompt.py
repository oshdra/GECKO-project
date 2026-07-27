"""Tests for Step 1 Prompt Construction and Proposal Parsing (Phase 4)."""

import pytest
from gecko.services import ai_pipeline


def test_build_step1_prompt_includes_all_sections():
    strategies = [{"name": "Field Interaction", "narrative": "Field strategy text"}]
    examples = [{"name": "Finite Speed Gravity", "narrative": "Gravity example text"}]
    agents = [{"name": "Physics Agents", "narrative": "Sphere agent definition"}]
    schema = "name: schema_test"

    prompt = ai_pipeline.build_step1_prompt(
        user_request="Quantum Entanglement",
        strategies=strategies,
        examples=examples,
        agents=agents,
        spec_schema=schema,
    )

    assert "Quantum Entanglement" in prompt
    assert "Field Interaction" in prompt
    assert "Finite Speed Gravity" in prompt
    assert "Sphere agent definition" in prompt
    assert "schema_test" in prompt


def test_parse_proposal_handles_valid_json_codeblock():
    raw_llm = """Here is the concept proposal:

```json
{
  "concept_name": "Orbital Resonance",
  "domain": "astronomy",
  "summary": "Exploring gravitational resonance between orbiting moons.",
  "rendering_library": "three.js",
  "agents": [
    {
      "name": "Planet",
      "attributes": ["mass", "position"],
      "behaviors": ["orbit"]
    }
  ],
  "environment": {
    "type": "3D",
    "physics": "keplerian",
    "attributes": ["g_constant"]
  },
  "interactions": [],
  "visualization_plan": "3D solar system view",
  "spec_draft_yaml": "name: Orbital Resonance"
}
```
"""
    proposal = ai_pipeline.parse_proposal(raw_llm)
    assert proposal["concept_name"] == "Orbital Resonance"
    assert proposal["domain"] == "astronomy"
    assert len(proposal["agents"]) == 1
    assert proposal["agents"][0]["name"] == "Planet"


def test_parse_proposal_fallback_on_invalid_input():
    proposal = ai_pipeline.parse_proposal("Invalid unstructured text output")
    assert "concept_name" in proposal
    assert proposal["concept_name"] == "Custom Concept Explorer"
