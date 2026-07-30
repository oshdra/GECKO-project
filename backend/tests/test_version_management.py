import json
from pathlib import Path
from gecko.services import file_io, ai_pipeline


def test_chat_file_io(temp_simulators_dir):
    sim_id = "test-simulator"
    chat = file_io.get_simulator_chat(sim_id, base_dir=temp_simulators_dir)
    assert isinstance(chat, list)

    msg = {"role": "user", "content": "Add orbital trace lines", "timestamp": "2026-07-30T12:00:00"}
    updated_chat = file_io.add_chat_message(sim_id, msg, base_dir=temp_simulators_dir)
    assert len(updated_chat) >= 1
    assert updated_chat[-1]["content"] == "Add orbital trace lines"

    sim_data = file_io.get_simulator(sim_id, base_dir=temp_simulators_dir)
    assert "chat" in sim_data
    assert len(sim_data["chat"]) >= 1


def test_assemble_and_save_iteration(temp_simulators_dir):
    sim_id = "test-simulator"
    proposal = {
        "concept_name": "Test Simulator",
        "summary": "Updated with orbital trace lines",
        "agents": [{"name": "Body A", "attributes": ["pos"], "behaviors": ["move"]}],
        "environment": {"type": "3D", "physics": "newtonian", "attributes": []},
        "interactions": [],
    }
    viz_plan = {"layout_type": "full-canvas-with-sidebar"}
    physics_model = {"integration_method": "Verlet"}
    html_code = "<!DOCTYPE html><html><body>/* GECKO_UI_JS */ v2</body></html>"

    result = ai_pipeline.assemble_and_save_iteration(
        sim_id=sim_id,
        proposal=proposal,
        viz_plan=viz_plan,
        physics_model=physics_model,
        html_code=html_code,
        change_summary="Added orbital trace lines",
        base_dir=temp_simulators_dir,
    )

    assert result["version"] == 2
    assert Path(result["html_path"]).exists()
    assert "v2.html" in result["html_path"]

    versions = file_io.get_simulator_versions(sim_id, base_dir=temp_simulators_dir)
    assert "v1.html" in versions
    assert "v2.html" in versions

    html_content = file_io.get_simulator_html(sim_id, "v2.html", base_dir=temp_simulators_dir)
    assert "v2" in html_content
