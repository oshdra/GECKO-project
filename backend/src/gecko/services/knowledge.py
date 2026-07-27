"""Knowledge retrieval service for GECKO AI Pipeline.

Parses modeling strategies, worked examples, reusable agent catalogs,
and output schemas from the knowledge/ directory.
"""

from pathlib import Path
import re
from typing import Any, Dict, List, Optional
import yaml

from gecko.config import WORKSPACE_ROOT, settings


def get_knowledge_dir(base_dir: Optional[Path] = None) -> Path:
    """Get absolute path to knowledge directory."""
    if base_dir:
        return base_dir
    return WORKSPACE_ROOT / settings.gecko_knowledge_dir


def parse_markdown_with_yaml_frontmatter(file_path: Path) -> Dict[str, Any]:
    """Parse a markdown file containing YAML frontmatter."""
    if not file_path.exists():
        return {"meta": {}, "narrative": "", "file_path": str(file_path)}

    content = file_path.read_text(encoding="utf-8")
    frontmatter_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)

    if frontmatter_match:
        yaml_text = frontmatter_match.group(1)
        narrative = frontmatter_match.group(2).strip()
        try:
            meta = yaml.safe_load(yaml_text) or {}
        except Exception:
            meta = {}
    else:
        meta = {}
        narrative = content.strip()

    return {
        "meta": meta,
        "narrative": narrative,
        "file_path": str(file_path),
        "name": meta.get("name") or file_path.stem.replace("-", " ").title(),
    }


def search_strategies(query: str = "", base_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Search modeling strategies matching the query against aliases, domains, and tags."""
    k_dir = get_knowledge_dir(base_dir)
    strategies_dir = k_dir / "strategies"

    if not strategies_dir.exists():
        return []

    results: List[Dict[str, Any]] = []
    q = query.lower().strip()

    for md_file in sorted(strategies_dir.glob("*.md")):
        if md_file.name.startswith("_"):
            continue

        parsed = parse_markdown_with_yaml_frontmatter(md_file)
        meta = parsed["meta"]

        name = str(meta.get("name", parsed["name"])).lower()
        domains = [str(d).lower() for d in meta.get("domains", [])]
        aliases = [str(a).lower() for a in meta.get("aliases", [])]
        tags = [str(t).lower() for t in meta.get("tags", [])]
        narrative = parsed["narrative"].lower()

        # Relevance scoring
        score = 0
        if not q:
            score = 1
        else:
            if q in name or any(q in a for a in aliases):
                score += 5
            if any(q in d for d in domains):
                score += 3
            if any(q in t for t in tags):
                score += 2
            if q in narrative:
                score += 1

        if score > 0:
            parsed["score"] = score
            results.append(parsed)

    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return results[:3] if results else []


def search_examples(strategies: Optional[List[str]] = None, query: str = "", base_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Find worked examples linked to strategies or matching concept query."""
    k_dir = get_knowledge_dir(base_dir)
    examples_dir = k_dir / "examples"

    if not examples_dir.exists():
        return []

    strat_set = {s.lower() for s in (strategies or [])}
    q = query.lower().strip()

    results: List[Dict[str, Any]] = []

    for md_file in sorted(examples_dir.glob("**/*.md")):
        if md_file.name.startswith("_"):
            continue

        parsed = parse_markdown_with_yaml_frontmatter(md_file)
        meta = parsed["meta"]

        strats_used = [str(s).lower() for s in meta.get("strategies_used", [])]
        domain = str(meta.get("domain", "")).lower()
        tags = [str(t).lower() for t in meta.get("tags", [])]
        name = str(parsed["name"]).lower()

        score = 0
        if strat_set and any(s in strat_set for s in strats_used):
            score += 4
        if q:
            if q in name or q in domain:
                score += 3
            if any(q in t for t in tags):
                score += 2

        if score > 0 or not (strat_set or q):
            parsed["score"] = score
            results.append(parsed)

    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return results[:3]


def search_agents(query: str = "", base_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Search reusable agent definitions in knowledge/agents/ catalog."""
    k_dir = get_knowledge_dir(base_dir)
    agents_dir = k_dir / "agents"

    if not agents_dir.exists():
        return []

    results: List[Dict[str, Any]] = []
    q = query.lower().strip()

    for md_file in sorted(agents_dir.glob("*.md")):
        if md_file.name.startswith("_"):
            continue

        parsed = parse_markdown_with_yaml_frontmatter(md_file)
        content = parsed["narrative"]

        if not q or q in content.lower() or q in parsed["name"].lower():
            results.append(parsed)

    return results


def load_spec_schema(base_dir: Optional[Path] = None) -> str:
    """Load the formal GECKO spec YAML schema."""
    k_dir = get_knowledge_dir(base_dir)
    schema_file = k_dir / "schema" / "gecko-spec.schema.yaml"
    if schema_file.exists():
        return schema_file.read_text(encoding="utf-8")
    return ""
