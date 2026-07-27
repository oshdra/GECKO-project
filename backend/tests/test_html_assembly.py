import json
from pathlib import Path
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from gecko.main import app
from gecko.services import ai_pipeline

client = TestClient(app)


def test_step2_prompt_and_parse():
    proposal = {
        "concept_name": "Pendulum Motion",
        "domain": "physics",
        "rendering_library": "three.js",
    }
    prompt = ai_pipeline.build_step2_prompt(proposal)
    assert "Pendulum Motion" in prompt
    assert "layout_type" in prompt

    raw_json = '```json\n{"layout_type": "full-canvas-with-sidebar", "camera_setup": "Perspective"}\n```'
    parsed = ai_pipeline.parse_step2(raw_json)
    assert parsed["layout_type"] == "full-canvas-with-sidebar"

    fallback = ai_pipeline.parse_step2("invalid json")
    assert fallback["layout_type"] == "full-canvas-with-sidebar"


def test_step3_prompt_and_parse():
    proposal = {"concept_name": "Pendulum Motion"}
    viz_plan = {"layout_type": "full-canvas-with-sidebar"}

    prompt = ai_pipeline.build_step3_prompt(proposal, viz_plan)
    assert "Pendulum Motion" in prompt

    raw_json = '```json\n{"integration_method": "Verlet", "state_variables": {"theta": 0.5}}\n```'
    parsed = ai_pipeline.parse_step3(raw_json)
    assert parsed["integration_method"] == "Verlet"

    fallback = ai_pipeline.parse_step3("")
    assert fallback["integration_method"] == "Verlet"


def test_step4_prompt_and_parse_html():
    proposal = {"concept_name": "Pendulum Motion", "rendering_library": "three.js"}
    viz_plan = {"layout_type": "full-canvas-with-sidebar"}
    physics_model = {"integration_method": "Verlet"}

    prompt = ai_pipeline.build_step4_prompt(proposal, viz_plan, physics_model)
    assert "Pendulum Motion" in prompt
    assert "three.min.js" in prompt

    raw_html_output = "```html\n<!DOCTYPE html>\n<html><head></head><body><h1>Pendulum</h1></body></html>\n```"
    parsed_html = ai_pipeline.parse_step4_html(raw_html_output)
    assert "<!DOCTYPE html>" in parsed_html
    assert "Pendulum" in parsed_html

    fallback_html = ai_pipeline.parse_step4_html("")
    assert "<!DOCTYPE html>" in fallback_html
    assert "GeckoUI" in fallback_html


def test_assemble_and_save_simulator(tmp_path):
    proposal = {
        "concept_name": "Double Pendulum",
        "domain": "physics",
        "summary": "Chaotic double pendulum simulation",
        "rendering_library": "three.js",
        "agents": [{"name": "Bob 1", "attributes": ["angle"], "behaviors": ["rotate"]}],
        "environment": {"type": "2D", "physics": "lagrangian_mechanics", "attributes": ["g"]},
        "interactions": [],
    }
    viz_plan = {"visualization_plan": "2D canvas trace"}
    physics_model = {"integration_method": "RK4"}
    raw_html = "<!DOCTYPE html><html><head><script>/* GECKO_UI_JS */</script></head><body></body></html>"

    result = ai_pipeline.assemble_and_save_simulator(
        proposal, viz_plan, physics_model, raw_html, base_dir=tmp_path
    )

    sim_id = result["id"]
    assert sim_id == "double-pendulum"

    sim_dir = tmp_path / sim_id
    assert sim_dir.exists()

    v1_html = sim_dir / "v1.html"
    assert v1_html.exists()
    html_content = v1_html.read_text(encoding="utf-8")
    assert "GeckoUI" in html_content  # gecko-ui.js inlined

    spec_md = sim_dir / "spec.md"
    assert spec_md.exists()
    spec_content = spec_md.read_text(encoding="utf-8")
    assert "name: Double Pendulum" in spec_content
    assert "## Concept" in spec_content

    chat_json = sim_dir / "chat.json"
    assert chat_json.exists()
    chat_content = json.loads(chat_json.read_text(encoding="utf-8"))
    assert len(chat_content) == 2


@pytest.mark.asyncio
async def test_execute_generation_route(tmp_path):
    proposal = {
        "concept_name": "Orbit Test",
        "domain": "physics",
        "summary": "Gravitational orbit test",
        "rendering_library": "three.js",
    }

    with patch("gecko.services.gemini.generate_async", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.side_effect = [
            '```json\n{"layout_type": "full-canvas-with-sidebar"}\n```',
            '```json\n{"integration_method": "Verlet"}\n```',
            '```html\n<!DOCTYPE html><html><head><script>/* GECKO_UI_JS */</script></head><body></body></html>\n```',
        ]

        response = client.post("/api/generate/execute", json={"proposal": proposal, "concept": "Orbit Test"})
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        assert "data: " in response.text
        assert '"step": 2' in response.text
        assert '"step": 3' in response.text
        assert '"step": 4' in response.text
