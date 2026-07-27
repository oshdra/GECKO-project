"""Tests for SSE Generate Endpoint (Phase 4)."""

import pytest
from fastapi.testclient import TestClient
from gecko.main import app

client = TestClient(app)


def test_generate_endpoint_streams_sse_events():
    response = client.post("/api/generate", json={"concept": "Black Hole Ergosphere"})
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    content = response.text
    assert "data: " in content
    assert '"step": 1' in content
    assert '"status": "done"' in content
    assert '"proposal":' in content


def test_generate_endpoint_rejects_empty_concept():
    response = client.post("/api/generate", json={"concept": "  "})
    assert response.status_code == 400
