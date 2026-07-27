def test_get_settings(client):
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert "gemini_api_key_set" in data
    assert "language" in data
    assert "profile" in data


def test_update_settings(client):
    payload = {
        "language": "es",
        "alias": "Test User",
        "avatar_color": "#ff0000"
    }
    response = client.post("/api/settings", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "es"
    assert data["profile"]["alias"] == "Test User"
    assert data["profile"]["avatar_color"] == "#ff0000"
