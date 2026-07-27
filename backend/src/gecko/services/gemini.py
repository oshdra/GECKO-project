"""Gemini API client service for GECKO AI Pipeline."""

import asyncio
from typing import AsyncIterator, Optional
import google.generativeai as genai

from gecko.config import settings

GECKO_SYSTEM_PROMPT = """You are GECKO AI, an expert agentic copilot specializing in modeling complex scientific and educational concepts into interactive web simulators.
You follow the Agent/Environment abstraction model:
- Agents: Objects with state attributes (mass, position, velocity, etc.) and defined behaviors.
- Environment: Space governing physics rules, global parameters, and agent interactions.
Always output structured, valid JSON proposals when requested during Step 1 of concept modeling.
"""


def get_api_key() -> str:
    """Resolve Gemini API key from settings."""
    return settings.gemini_api_key.strip() if settings.gemini_api_key else ""


def is_configured() -> bool:
    """Check if Gemini API key is configured."""
    return bool(get_api_key())


def generate(prompt: str, system_instruction: Optional[str] = None, model_name: str = "gemini-1.5-flash") -> str:
    """Synchronous generation using Gemini API with fallback for missing key/tests."""
    api_key = get_api_key()
    if not api_key:
        return _mock_proposal_response(prompt)

    genai.configure(api_key=api_key)
    system_text = system_instruction or GECKO_SYSTEM_PROMPT
    model = genai.GenerativeModel(model_name=model_name, system_instruction=system_text)

    response = model.generate_content(prompt)
    return response.text if response and response.text else ""


async def generate_async(prompt: str, system_instruction: Optional[str] = None, model_name: str = "gemini-1.5-flash") -> str:
    """Async wrapper for Gemini generation."""
    api_key = get_api_key()
    if not api_key:
        return _mock_proposal_response(prompt)

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, generate, prompt, system_instruction, model_name)


async def stream(prompt: str, system_instruction: Optional[str] = None, model_name: str = "gemini-1.5-flash") -> AsyncIterator[str]:
    """Stream response chunks asynchronously from Gemini API."""
    api_key = get_api_key()
    if not api_key:
        full_text = _mock_proposal_response(prompt)
        for chunk in [full_text[i:i+50] for i in range(0, len(full_text), 50)]:
            yield chunk
            await asyncio.sleep(0.05)
        return

    genai.configure(api_key=api_key)
    system_text = system_instruction or GECKO_SYSTEM_PROMPT
    model = genai.GenerativeModel(model_name=model_name, system_instruction=system_text)

    response = model.generate_content(prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text


def _mock_proposal_response(prompt: str) -> str:
    """Generate a realistic mock proposal response when API key is unconfigured."""
    concept = "Concept"
    for line in prompt.splitlines():
        if "User Request:" in line:
            concept = line.replace("User Request:", "").strip()
            break

    return f"""```json
{{
  "concept_name": "{concept}",
  "domain": "physics",
  "summary": "Interactive simulation exploring the principles of {concept}.",
  "rendering_library": "three.js",
  "agents": [
    {{
      "name": "Main Body",
      "attributes": ["mass", "position_x", "position_y", "position_z", "velocity_x", "velocity_y", "color"],
      "behaviors": ["update_position", "interact_with_field"]
    }},
    {{
      "name": "Field Sphere",
      "attributes": ["radius", "strength", "expansion_speed"],
      "behaviors": ["expand_over_time", "apply_force_to_contained_agents"]
    }}
  ],
  "environment": {{
    "type": "3D",
    "physics": "field_dynamics",
    "attributes": ["gravity_constant", "drag_coefficient", "time_scale"]
  }},
  "interactions": [
    {{
      "trigger": "drag_agent",
      "effect": "apply_external_impulse"
    }},
    {{
      "trigger": "change_slider",
      "effect": "update_environment_parameters"
    }}
  ],
  "visualization_plan": "A sleek 3D dark-mode canvas featuring interactive particle traces, force vector arrows, and real-time state displays.",
  "spec_draft_yaml": "name: '{concept}'\\nversion: 1\\ndomain: physics\\nrendering_library: three.js\\nagents:\\n  - name: Main Body\\n    attributes: [mass, position_x, position_y, position_z]\\n    behaviors: [update_position]\\nenvironment:\\n  type: 3D\\n  physics: field_dynamics\\n  attributes: [gravity_constant, drag_coefficient]"
}}
```"""
