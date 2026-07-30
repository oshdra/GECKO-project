import json
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import yaml

from gecko.config import settings, WORKSPACE_ROOT

PROFILE_DIR = Path.home() / ".gecko"
PROFILE_FILE = PROFILE_DIR / "profile.json"


def parse_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """Parse YAML frontmatter and body from markdown file content."""
    pattern = r"^---\s*\n(.*?)\n---\s*\n(.*)$"
    match = re.match(pattern, content, re.DOTALL)
    if match:
        yaml_text, body = match.groups()
        try:
            data = yaml.safe_load(yaml_text) or {}
            return data, body.strip()
        except yaml.YAMLError:
            return {}, content.strip()
    return {}, content.strip()


def dump_frontmatter(data: Dict[str, Any], body: str) -> str:
    """Format YAML frontmatter and markdown body."""
    yaml_str = yaml.safe_dump(data, sort_keys=False, allow_unicode=True)
    return f"---\n{yaml_str}---\n\n{body}\n"


def list_simulators(base_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """List all simulators in the simulators directory."""
    target_dir = base_dir or settings.simulators_path
    if not target_dir.exists():
        target_dir.mkdir(parents=True, exist_ok=True)
        return []

    simulators = []
    for item in target_dir.iterdir():
        if item.is_dir():
            sim_id = item.name
            spec_file = item / "spec.md"
            metadata: Dict[str, Any] = {
                "id": sim_id,
                "name": sim_id.replace("-", " ").title(),
                "domain": "general",
                "version_count": 0,
                "versions": [],
                "last_modified": None,
            }

            if spec_file.exists():
                try:
                    content = spec_file.read_text(encoding="utf-8")
                    frontmatter, _ = parse_frontmatter(content)
                    metadata.update(frontmatter)
                    mtime = spec_file.stat().st_mtime
                    metadata["last_modified"] = datetime.fromtimestamp(mtime).isoformat()
                except Exception:
                    pass

            # Count HTML versions
            versions = get_simulator_versions(sim_id, base_dir=target_dir)
            metadata["versions"] = versions
            metadata["version_count"] = len(versions)

            simulators.append(metadata)

    return sorted(simulators, key=lambda s: s.get("last_modified") or "", reverse=True)


def get_simulator(sim_id: str, base_dir: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Get full metadata and spec content for a specific simulator."""
    target_dir = (base_dir or settings.simulators_path) / sim_id
    if not target_dir.exists() or not target_dir.is_dir():
        return None

    spec_file = target_dir / "spec.md"
    frontmatter = {}
    body = ""
    last_modified = None

    if spec_file.exists():
        content = spec_file.read_text(encoding="utf-8")
        frontmatter, body = parse_frontmatter(content)
        last_modified = datetime.fromtimestamp(spec_file.stat().st_mtime).isoformat()

    versions = get_simulator_versions(sim_id, base_dir=base_dir)
    chat = get_simulator_chat(sim_id, base_dir=base_dir)

    return {
        "id": sim_id,
        "name": frontmatter.get("name", sim_id.replace("-", " ").title()),
        "frontmatter": frontmatter,
        "spec_body": body,
        "versions": versions,
        "version_count": len(versions),
        "last_modified": last_modified,
        "chat": chat,
    }


def get_simulator_chat(sim_id: str, base_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Get chat history from chat.json for a simulator."""
    target_dir = (base_dir or settings.simulators_path) / sim_id
    chat_file = target_dir / "chat.json"
    if chat_file.exists() and chat_file.is_file():
        try:
            return json.loads(chat_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def add_chat_message(sim_id: str, message: Dict[str, Any], base_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Add a message to chat.json for a simulator."""
    target_dir = (base_dir or settings.simulators_path) / sim_id
    if not target_dir.exists():
        target_dir.mkdir(parents=True, exist_ok=True)

    chat = get_simulator_chat(sim_id, base_dir=base_dir)
    chat.append(message)
    chat_file = target_dir / "chat.json"
    chat_file.write_text(json.dumps(chat, indent=2), encoding="utf-8")
    return chat



def get_simulator_versions(sim_id: str, base_dir: Optional[Path] = None) -> List[str]:
    """Get sorted list of HTML versions for a simulator."""
    target_dir = (base_dir or settings.simulators_path) / sim_id
    if not target_dir.exists() or not target_dir.is_dir():
        return []

    versions = []
    for f in target_dir.glob("v*.html"):
        versions.append(f.name)

    def version_key(filename: str) -> int:
        match = re.search(r"v(\d+)\.html$", filename)
        return int(match.group(1)) if match else 0

    return sorted(versions, key=version_key)


def get_simulator_html(sim_id: str, version: str, base_dir: Optional[Path] = None) -> Optional[str]:
    """Get HTML file content for a specific simulator version."""
    target_dir = (base_dir or settings.simulators_path) / sim_id

    candidates = [
        version,
        f"{version}.html" if not version.endswith(".html") else version,
        f"v{version}.html" if not version.startswith("v") else version,
        f"v{version}" if not version.startswith("v") else version,
    ]

    for cand in candidates:
        if not cand.endswith(".html"):
            cand = f"{cand}.html"
        html_file = target_dir / cand
        if html_file.exists() and html_file.is_file():
            return html_file.read_text(encoding="utf-8")

    return None



def create_simulator(
    name: str,
    domain: str = "general",
    tags: Optional[List[str]] = None,
    rendering_library: str = "three.js",
    language: str = "en",
    spec_body: str = "",
    base_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Create a new simulator folder and spec.md stub."""
    target_base = base_dir or settings.simulators_path
    target_base.mkdir(parents=True, exist_ok=True)

    sim_id = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not sim_id:
        sim_id = "simulator-" + datetime.now().strftime("%Y%m%d%H%M%S")

    sim_dir = target_base / sim_id
    sim_dir.mkdir(parents=True, exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    frontmatter = {
        "name": name,
        "version": 1,
        "created": today,
        "modified": today,
        "domain": domain,
        "language": language,
        "tags": tags or [],
        "rendering_library": rendering_library,
        "agents": [],
        "environment": {"type": "3D", "physics": "custom", "attributes": []},
        "interactions": [],
    }

    body = spec_body or f"# {name}\n\nInteractive simulator for exploring {name}."
    spec_content = dump_frontmatter(frontmatter, body)

    spec_file = sim_dir / "spec.md"
    spec_file.write_text(spec_content, encoding="utf-8")

    return get_simulator(sim_id, base_dir=target_base) or {"id": sim_id}


def delete_simulator(sim_id: str, base_dir: Optional[Path] = None) -> bool:
    """Delete a simulator folder and all its contents."""
    target_dir = (base_dir or settings.simulators_path) / sim_id
    if target_dir.exists() and target_dir.is_dir():
        shutil.rmtree(target_dir)
        return True
    return False


def get_profile() -> Dict[str, Any]:
    """Get local profile from ~/.gecko/profile.json."""
    if PROFILE_FILE.exists():
        try:
            return json.loads(PROFILE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"alias": "Explorer", "avatar_color": "#00e5ff"}


def update_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    """Update local profile in ~/.gecko/profile.json."""
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    current = get_profile()
    current.update(data)
    PROFILE_FILE.write_text(json.dumps(current, indent=2), encoding="utf-8")
    return current
