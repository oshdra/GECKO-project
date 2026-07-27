def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "0.1.0"}


def test_list_simulators(client, temp_simulators_dir):
    response = client.get("/api/simulators")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == "test-simulator"
    assert data[0]["version_count"] == 1


def test_get_simulator(client, temp_simulators_dir):
    response = client.get("/api/simulators/test-simulator")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-simulator"
    assert data["name"] == "Test Simulator"
    assert data["spec_body"] == "# Test Simulator Spec"
    assert "v1.html" in data["versions"]


def test_get_simulator_not_found(client, temp_simulators_dir):
    response = client.get("/api/simulators/non-existent")
    assert response.status_code == 404


def test_get_simulator_versions(client, temp_simulators_dir):
    response = client.get("/api/simulators/test-simulator/versions")
    assert response.status_code == 200
    versions = response.json()
    assert versions == ["v1.html"]


def test_get_simulator_html(client, temp_simulators_dir):
    response = client.get("/api/simulators/test-simulator/html/v1.html")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Test" in response.text


def test_create_simulator(client, temp_simulators_dir):
    payload = {
        "name": "New Orbit Sim",
        "domain": "astronomy",
        "tags": ["space", "orbits"],
        "rendering_library": "three.js",
        "language": "en",
        "spec_body": "# New Orbit Sim Spec",
    }
    response = client.post("/api/simulators", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "new-orbit-sim"
    assert data["name"] == "New Orbit Sim"


def test_delete_simulator(client, temp_simulators_dir):
    response = client.delete("/api/simulators/test-simulator")
    assert response.status_code == 200
    
    response_check = client.get("/api/simulators/test-simulator")
    assert response_check.status_code == 404


def test_static_gecko_ui_js(client):
    response = client.get("/static/gecko-ui.js")
    assert response.status_code == 200
    assert "GeckoUI" in response.text
