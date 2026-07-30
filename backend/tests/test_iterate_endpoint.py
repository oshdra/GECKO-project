import json
from unittest.mock import AsyncMock
import pytest
from gecko.services import gemini


def test_get_chat_endpoint(client, temp_simulators_dir):
    response = client.get("/api/simulators/test-simulator/chat")
    assert response.status_code == 200
    chat = response.json()
    assert isinstance(chat, list)


def test_iterate_endpoint_not_found(client, temp_simulators_dir):
    response = client.post("/api/simulators/non-existent/iterate", json={"request": "Make red"})
    assert response.status_code == 404


def test_iterate_endpoint_empty_request(client, temp_simulators_dir):
    response = client.post("/api/simulators/test-simulator/iterate", json={"request": "  "})
    assert response.status_code == 400


def test_iterate_endpoint_success(client, temp_simulators_dir, monkeypatch):
    mock_llm_responses = [
        # Step 1 proposal
        json.dumps({
            "concept_name": "Test Simulator",
            "domain": "physics",
            "summary": "Added red color accent",
            "rendering_library": "three.js",
            "agents": [{"name": "Body", "attributes": ["color"], "behaviors": ["render"]}],
            "environment": {"type": "3D", "physics": "newtonian", "attributes": []},
            "interactions": [],
            "visualization_plan": "Red color theme",
        }),
        # Step 2 viz design
        json.dumps({
            "layout_type": "full-canvas-with-sidebar",
            "camera_setup": "Perspective",
            "rendering_details": "Red spheres",
            "visual_aids": [],
            "panels": [],
            "theme": "Red space theme",
        }),
        # Step 3 physics model
        json.dumps({
            "physics_type": "Newtonian",
            "integration_method": "Verlet",
            "state_variables": {},
            "equation_definitions": [],
            "boundary_conditions": "Open",
            "metrics": [],
        }),
        # Step 4 HTML
        "<!DOCTYPE html><html><head><script>/* GECKO_UI_JS */</script></head><body>Red Simulator v2</body></html>",
    ]

    async def mock_generate_async(prompt):
        if mock_llm_responses:
            return mock_llm_responses.pop(0)
        return "{}"

    monkeypatch.setattr(gemini, "generate_async", mock_generate_async)

    # Need to also monkeypatch settings.simulators_path so run_iteration_pipeline_sse uses temp_simulators_dir
    monkeypatch.setattr("gecko.services.file_io.settings.gecko_simulators_dir", str(temp_simulators_dir))

    response = client.post("/api/simulators/test-simulator/iterate", json={"request": "Change body color to red"})
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    lines = response.text.split("\n\n")
    events = []
    for line in lines:
        if line.startswith("data: "):
            events.append(json.loads(line.replace("data: ", "")))

    assert len(events) >= 4
    done_event = [e for e in events if e.get("step") == 4 and e.get("status") == "done"][0]
    assert done_event["simulator_id"] == "test-simulator"
    assert done_event["version"] == 2
