"""AI Generation Pipeline Service for GECKO.

Handles Step 1 (Concept Modeling & Proposal Generation) of the agentic pipeline.
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from gecko.config import WORKSPACE_ROOT, settings
from gecko.services import file_io, gemini, knowledge


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


# --- Step 2: Visualization Design ---

def build_step2_prompt(proposal: Dict[str, Any]) -> str:
    """Assemble LLM prompt for Step 2 Visualization Design."""
    return f"""Task: Create a Visualization Design Plan for GECKO Simulator.

Approved Proposal:
{json.dumps(proposal, indent=2)}

=== INSTRUCTIONS ===
Define the detailed visualization, rendering layout, camera controls, color palette, and UI panel structure for this simulator.
Respond ONLY with a valid JSON object wrapped in ```json ... ``` containing:
- "layout_type": "full-canvas-with-sidebar"
- "camera_setup": Description of initial camera position, angle, FOV, or view bounds
- "rendering_details": How agents and environment elements are rendered (shapes, materials, lines, colors)
- "visual_aids": Vectors, trajectory trails, force arrows, grid planes, labels
- "panels": Array of panel specs [{{ "id": str, "title": str, "controls": [...] }}]
- "theme": Description of color scheme and aesthetic parameters
"""


def parse_step2(raw_output: str) -> Dict[str, Any]:
    """Parse JSON visualization plan from Step 2 LLM output."""
    if not raw_output:
        return _fallback_viz_plan("Empty LLM output")

    json_match = re.search(r"```(?:json)?\s*\n({.*?})\n```", raw_output, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        json_match = re.search(r"({.*})", raw_output, re.DOTALL)
        json_str = json_match.group(1) if json_match else raw_output

    try:
        data = json.loads(json_str)
        if isinstance(data, dict) and "layout_type" in data:
            return data
    except Exception:
        pass

    return _fallback_viz_plan(raw_output)


def _fallback_viz_plan(context_raw: str) -> Dict[str, Any]:
    return {
        "layout_type": "full-canvas-with-sidebar",
        "camera_setup": "Perspective camera at (0, 15, 30) looking at origin (0, 0, 0)",
        "rendering_details": "Spheres for bodies, ambient + directional lighting, dark canvas background",
        "visual_aids": ["Velocity vectors", "Trajectory traces", "Coordinate grid plane"],
        "panels": [
            {
                "id": "environment_panel",
                "title": "Environment",
                "controls": ["gravity", "time_scale"],
            },
            {
                "id": "agent_panel",
                "title": "Agents",
                "controls": ["mass", "velocity"],
            },
        ],
        "theme": "Dark space theme with neon accents",
        "raw_text": context_raw,
    }


async def step2_visualization_design(proposal: Dict[str, Any]) -> Dict[str, Any]:
    """Run Step 2 of AI pipeline: Visualization Design."""
    prompt = build_step2_prompt(proposal)
    raw_llm = await gemini.generate_async(prompt)
    return parse_step2(raw_llm)


# --- Step 3: Physics & Logic Model ---

def build_step3_prompt(proposal: Dict[str, Any], viz_plan: Dict[str, Any]) -> str:
    """Assemble LLM prompt for Step 3 Physics Model."""
    return f"""Task: Create a Physics & Simulation Model for GECKO Simulator.

Approved Proposal:
{json.dumps(proposal, indent=2)}

Visualization Design:
{json.dumps(viz_plan, indent=2)}

=== INSTRUCTIONS ===
Define the mathematical physics model, numerical integration algorithm, state variables, and collision/interaction rules.
Respond ONLY with a valid JSON object wrapped in ```json ... ``` containing:
- "physics_type": Description of core equations (e.g. Newton's 2nd Law, gravity, collision response)
- "integration_method": Euler, Verlet, or RK4
- "state_variables": List of simulation state variables and default values
- "equation_definitions": Math formulas / algorithm steps in natural language or pseudocode
- "boundary_conditions": Handling of boundaries or infinity
- "metrics": List of real-time metrics to calculate and display (e.g. kinetic energy, momentum, count)
"""


def parse_step3(raw_output: str) -> Dict[str, Any]:
    """Parse JSON physics model from Step 3 LLM output."""
    if not raw_output:
        return _fallback_physics_model("Empty LLM output")

    json_match = re.search(r"```(?:json)?\s*\n({.*?})\n```", raw_output, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        json_match = re.search(r"({.*})", raw_output, re.DOTALL)
        json_str = json_match.group(1) if json_match else raw_output

    try:
        data = json.loads(json_str)
        if isinstance(data, dict) and "integration_method" in data:
            return data
    except Exception:
        pass

    return _fallback_physics_model(raw_output)


def _fallback_physics_model(context_raw: str) -> Dict[str, Any]:
    return {
        "physics_type": "Newtonian gravity & kinematic updates",
        "integration_method": "Verlet",
        "state_variables": {"gravity_constant": 1.0, "time_step": 0.016},
        "equation_definitions": [
            "F = G * m1 * m2 / r^2",
            "a = F / m",
            "v = v + a * dt",
            "x = x + v * dt",
        ],
        "boundary_conditions": "Open space with wrap-around boundaries",
        "metrics": ["Kinetic Energy", "Potential Energy", "Total Energy"],
        "raw_text": context_raw,
    }


async def step3_physics_model(proposal: Dict[str, Any], viz_plan: Dict[str, Any]) -> Dict[str, Any]:
    """Run Step 3 of AI pipeline: Physics & Logic Model."""
    prompt = build_step3_prompt(proposal, viz_plan)
    raw_llm = await gemini.generate_async(prompt)
    return parse_step3(raw_llm)


# --- Step 4: HTML Code Generation ---

def build_step4_prompt(
    proposal: Dict[str, Any], viz_plan: Dict[str, Any], physics_model: Dict[str, Any]
) -> str:
    """Assemble LLM prompt for Step 4 HTML Generation."""
    lib = proposal.get("rendering_library", "three.js").lower()

    if "three" in lib:
        cdn_script = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
    elif "p5" in lib:
        cdn_script = '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"></script>'
    elif "d3" in lib:
        cdn_script = '<script src="https://d3js.org/d3.v7.min.js"></script>'
    else:
        cdn_script = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'

    return f"""Task: Generate complete, single-file standalone HTML code for the GECKO simulator.

Concept Title: {proposal.get('concept_name')}
Rendering Library: {lib}

Approved Proposal:
{json.dumps(proposal, indent=2)}

Visualization Design:
{json.dumps(viz_plan, indent=2)}

Physics & Logic Model:
{json.dumps(physics_model, indent=2)}

=== REQUIREMENTS ===
1. Return ONLY pure valid HTML wrapped in ```html ... ```.
2. Include CDN script tag: {cdn_script}
3. Place `/* GECKO_UI_JS */` comment inside a `<script>` block in `<head>` (the backend will inline gecko-ui.js here).
4. Full CSS reset so canvas fills screen with fixed right margin or padding for gecko-ui sidebar (`margin-right: 320px` or body reset).
5. In your JS logic:
   - Initialize the rendering engine (e.g. Three.js scene, camera, renderer, animation loop).
   - Instantiate `new GeckoUI(config)` with title "{proposal.get('concept_name')}", panels, controls (sliders, number-inputs, checkboxes, buttons, metrics), state export/import support.
   - Attach simulation update logic to `ui.on('tick', (dt) => {{ ... }})`.
   - Ensure visual elements update smoothly according to the physics model.
6. Must be a 100% self-contained working HTML page.
"""


def parse_step4_html(raw_output: str) -> str:
    """Parse pure HTML code string from LLM output."""
    if not raw_output:
        return _fallback_html("Custom Concept Explorer")

    html_match = re.search(r"```(?:html)?\s*\n(<!DOCTYPE html>.*?|<html>.*?)\n```", raw_output, re.DOTALL | re.IGNORECASE)
    if html_match:
        return html_match.group(1).strip()

    code_match = re.search(r"```(?:html)?\s*\n(.*?)\n```", raw_output, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()

    if "<!DOCTYPE html>" in raw_output or "<html" in raw_output.lower():
        return raw_output.strip()

    return _fallback_html("Custom Concept Explorer")


def _fallback_html(title: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ background: #0b0c10; color: #fff; overflow: hidden; font-family: sans-serif; }}
    #sim-canvas {{ width: calc(100vw - 320px); height: 100vh; display: block; }}
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    /* GECKO_UI_JS */
  </script>
</head>
<body>
  <div id="sim-canvas"></div>
  <script>
    const container = document.getElementById('sim-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 320) / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({{ antialias: true }});
    renderer.setSize(window.innerWidth - 320, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({{ color: 0x00e5ff, wireframe: true }});
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 10;

    let speed = 1.0;

    const ui = new GeckoUI({{
      title: "{title}",
      language: "en",
      accentColor: "#00e5ff",
      panels: [
        {{
          id: "params",
          title: "Parameters",
          expanded: true,
          controls: [
            {{
              type: "slider",
              id: "speed",
              label: "Rotation Speed",
              min: 0.1,
              max: 5,
              step: 0.1,
              value: speed,
              onChange: (v) => {{ speed = v; }}
            }}
          ]
        }}
      ]
    }});

    ui.on('tick', (dt) => {{
      sphere.rotation.x += 0.01 * speed;
      sphere.rotation.y += 0.01 * speed;
      renderer.render(scene, camera);
    }});

    window.addEventListener('resize', () => {{
      camera.aspect = (window.innerWidth - 320) / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth - 320, window.innerHeight);
    }});
  </script>
</body>
</html>
"""


async def step4_html_generation(
    proposal: Dict[str, Any], viz_plan: Dict[str, Any], physics_model: Dict[str, Any]
) -> str:
    """Run Step 4 of AI pipeline: HTML Code Generation."""
    prompt = build_step4_prompt(proposal, viz_plan, physics_model)
    raw_llm = await gemini.generate_async(prompt)
    return parse_step4_html(raw_llm)


# --- Assembly & Storage ---

def load_gecko_ui_js() -> str:
    """Load gecko-ui.js content from knowledge schema."""
    paths_to_try = [
        WORKSPACE_ROOT / "knowledge" / "schema" / "gecko-ui.js",
        Path(__file__).parents[4] / "knowledge" / "schema" / "gecko-ui.js",
    ]
    for p in paths_to_try:
        if p.exists() and p.is_file():
            return p.read_text(encoding="utf-8")
    return "/* gecko-ui.js fallback */"


def assemble_and_save_simulator(
    proposal: Dict[str, Any],
    viz_plan: Dict[str, Any],
    physics_model: Dict[str, Any],
    html_code: str,
    base_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Assemble final inlined HTML and write spec.md and v1.html to simulators/<slug>/."""
    gecko_ui_js = load_gecko_ui_js()

    if "/* GECKO_UI_JS */" in html_code:
        final_html = html_code.replace("/* GECKO_UI_JS */", gecko_ui_js)
    elif "gecko-ui.js" not in html_code and "GeckoUI" in html_code:
        script_tag = f"<script>\n{gecko_ui_js}\n</script>\n"
        if "</head>" in html_code:
            final_html = html_code.replace("</head>", f"{script_tag}</head>")
        else:
            final_html = f"{script_tag}\n{html_code}"
    else:
        final_html = html_code

    name = proposal.get("concept_name", "Custom Concept Explorer")
    sim_id = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not sim_id:
        sim_id = "simulator-" + datetime.now().strftime("%Y%m%d%H%M%S")

    today = datetime.now().strftime("%Y-%m-%d")

    frontmatter = {
        "name": name,
        "version": 1,
        "created": today,
        "modified": today,
        "domain": proposal.get("domain", "physics"),
        "language": "en",
        "tags": [proposal.get("domain", "physics")],
        "rendering_library": proposal.get("rendering_library", "three.js"),
        "agents": proposal.get("agents", []),
        "environment": proposal.get("environment", {"type": "3D", "physics": "custom", "attributes": []}),
        "interactions": proposal.get("interactions", []),
        "exports": ["state_json"],
    }

    body_md = f"""# {name}

## Concept
{proposal.get('summary', 'Interactive concept exploration.')}

## Model
Agents: {json.dumps(proposal.get('agents', []), indent=2)}

Environment: {json.dumps(proposal.get('environment', {}), indent=2)}

## Visualization
{viz_plan.get('visualization_plan', proposal.get('visualization_plan', '3D interactive canvas with gecko-ui controls.'))}

## Expected Evolution
Future versions will add enhanced interaction behaviors and numerical telemetry exports.
"""

    spec_content = file_io.dump_frontmatter(frontmatter, body_md)

    target_base = base_dir or settings.simulators_path
    sim_dir = target_base / sim_id
    sim_dir.mkdir(parents=True, exist_ok=True)

    (sim_dir / "v1.html").write_text(final_html, encoding="utf-8")
    (sim_dir / "spec.md").write_text(spec_content, encoding="utf-8")

    now_iso = datetime.now().isoformat()
    chat_data = [
        {"role": "user", "content": name, "timestamp": now_iso},
        {"role": "assistant", "content": proposal.get("summary", ""), "step": 1, "timestamp": now_iso},
    ]
    (sim_dir / "chat.json").write_text(json.dumps(chat_data, indent=2), encoding="utf-8")

    return {
        "id": sim_id,
        "name": name,
        "version": 1,
        "html_path": str(sim_dir / "v1.html"),
        "spec_path": str(sim_dir / "spec.md"),
    }

