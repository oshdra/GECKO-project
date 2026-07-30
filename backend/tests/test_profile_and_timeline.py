from gecko.routes.simulators import compute_frontmatter_diff


def test_profile_endpoints(client):
    # GET profile
    get_res = client.get("/api/profile")
    assert get_res.status_code == 200
    data = get_res.json()
    assert "alias" in data
    assert "avatar_color" in data

    # POST profile update
    post_res = client.post("/api/profile", json={"alias": "Quantum Explorer", "avatar_color": "#ff0055"})
    assert post_res.status_code == 200
    updated = post_res.json()
    assert updated["alias"] == "Quantum Explorer"
    assert updated["avatar_color"] == "#ff0055"


def test_timeline_endpoint(client, temp_simulators_dir):
    res = client.get("/api/simulators/test-simulator/timeline")
    assert res.status_code == 200
    timeline = res.json()
    assert isinstance(timeline, list)
    assert len(timeline) >= 1
    assert timeline[0]["version"] == 1
    assert "diff" in timeline[0]


def test_compute_frontmatter_diff():
    v1 = {"name": "Sim", "version": 1, "domain": "physics"}
    v2 = {"name": "Sim Updated", "version": 2, "domain": "physics", "tags": ["new"]}

    diff = compute_frontmatter_diff(v1, v2)
    assert "tags" in diff["added"]
    assert "name" in diff["changed"]
    assert "version" in diff["changed"]
    assert diff["changed"]["version"]["from"] == 1
    assert diff["changed"]["version"]["to"] == 2
