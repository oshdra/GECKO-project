import shutil
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from gecko.main import app
from gecko.services import file_io


@pytest.fixture
def temp_simulators_dir(monkeypatch):
    """Create a temporary simulators directory for testing."""
    temp_dir = Path(tempfile.mkdtemp())
    
    # Mock settings.gecko_simulators_dir to point to temp_dir
    monkeypatch.setattr(file_io.settings, "gecko_simulators_dir", str(temp_dir))
    
    # Create a sample simulator
    file_io.create_simulator(
        name="Test Simulator",
        domain="physics",
        tags=["test", "gravity"],
        spec_body="# Test Simulator Spec",
        base_dir=temp_dir,
    )
    
    # Create sample HTML file
    sim_dir = temp_dir / "test-simulator"
    html_file = sim_dir / "v1.html"
    html_file.write_text("<!DOCTYPE html><html><body>Test</body></html>", encoding="utf-8")
    
    yield temp_dir
    
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def client(temp_simulators_dir):
    """Return FastAPI TestClient."""
    return TestClient(app)
