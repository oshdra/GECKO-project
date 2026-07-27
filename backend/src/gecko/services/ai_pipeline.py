"""AI Generation Pipeline Service for GECKO.

Handles Step 1 (Concept Modeling & Proposal Generation) of the agentic pipeline.
"""

import json
import re
from typing import Any, Dict, List, Optional

from gecko.services import gemini, knowledge


def build_step1_prompt(
    user_request: str,
    strategies: List[Dict[str, Any]],
    examples: List[Dict[str, Any]],
    agents: List[Dict[str, Any]],
    spec_schema: str,
) -> str:
    """Assemble LLM prompt for Step 1 Concept Modeling."""
    strat_text = "\n\n".join(
        f"--- Strategy: {s.get('name', 'Strategy')} ---\n{s.get('narrative', '')}"
        for s in strategies
    )

    example_text = "\n\n".join(
        f"--- Example: {e.get('name', 'Example')} ---\n{e.get('narrative', '')}"
        for e in examples
    )

    agent_text = "\n\n".join(
        f"--- Agent Catalog: {a.get('name', 'Agents')} ---\n{a.get('narrative', '')}"
        for a in agents
    )

    return f"""Task: Generate a GECKO Concept Proposal card for the following user request.

User Request: {user_request}

=== RELEVANT MODELING STRATEGIES ===
{strat_text if strat_text else "None matching."}

=== RELEVANT WORKED EXAMPLES ===
{example_text if example_text else "None matching."}

=== RELEVANT AGENT DEFINITIONS ===
{agent_text if agent_text else "None matching."}

=== GECKO SPEC SCHEMA ===
{spec_schema if spec_schema else "Standard GECKO Spec Schema"}

=== INSTRUCTIONS ===
Decompose the user's concept into the universal AGENT/ENVIRONMENT model.
Respond ONLY with a valid JSON object wrapped in ```json ... ``` containing the following keys:
- "concept_name": Title of the concept
- "domain": Domain category (e.g. physics, biology, mathematics, astronomy, economics)
- "summary": 2-3 sentence overview of what the simulator demonstrates
- "rendering_library": Recommended library (three.js, p5.js, d3.js, canvas2d, babylon.js)
- "agents": Array of objects [{{ "name": str, "attributes": [str], "behaviors": [str] }}]
- "environment": Object {{ "type": "2D"|"3D", "physics": str, "attributes": [str] }}
- "interactions": Array of objects [{{ "trigger": str, "effect": str }}]
- "visualization_plan": Description of layout, controls, and visual aids
- "spec_draft_yaml": Complete GECKO spec YAML frontmatter draft as a single string
"""


def parse_proposal(raw_output: str) -> Dict[str, Any]:
    """Parse JSON proposal from LLM output string."""
    if not raw_output:
        return _fallback_proposal("Empty LLM output")

    # Try extracting JSON code block
    json_match = re.search(r"```(?:json)?\s*\n({.*?})\n```", raw_output, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try finding raw json object
        json_match = re.search(r"({.*})", raw_output, re.DOTALL)
        json_str = json_match.group(1) if json_match else raw_output

    try:
        data = json.loads(json_str)
        if isinstance(data, dict) and "concept_name" in data:
            return data
    except Exception:
        pass

    return _fallback_proposal(raw_output)


def _fallback_proposal(context_raw: str) -> Dict[str, Any]:
    """Fallback proposal structure if parsing fails."""
    return {
        "concept_name": "Custom Concept Explorer",
        "domain": "physics",
        "summary": "Interactive concept simulator based on your request.",
        "rendering_library": "three.js",
        "agents": [
            {
                "name": "Primary Body",
                "attributes": ["position_x", "position_y", "position_z", "mass", "velocity"],
                "behaviors": ["update_kinematics", "interact_environment"],
            }
        ],
        "environment": {
            "type": "3D",
            "physics": "newtonian_mechanics",
            "attributes": ["gravity", "time_scale"],
        },
        "interactions": [
            {"trigger": "drag_agent", "effect": "apply_force"},
        ],
        "visualization_plan": "3D canvas with interactive controls panel and real-time state readouts.",
        "spec_draft_yaml": "name: Custom Concept Explorer\nversion: 1\ndomain: physics\nrendering_library: three.js",
        "raw_text": context_raw,
    }


async def step1_concept_modeling(user_request: str) -> Dict[str, Any]:
    """Run Step 1 of the AI pipeline: Concept Modeling."""
    strategies = knowledge.search_strategies(user_request)
    strat_names = [s.get("name", "") for s in strategies]
    examples = knowledge.search_examples(strat_names, query=user_request)
    agents = knowledge.search_agents(user_request)
    schema = knowledge.load_spec_schema()

    prompt = build_step1_prompt(user_request, strategies, examples, agents, schema)
    raw_llm = await gemini.generate_async(prompt)

    proposal = parse_proposal(raw_llm)
    return proposal
