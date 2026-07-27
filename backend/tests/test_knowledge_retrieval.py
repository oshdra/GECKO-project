"""Tests for Knowledge Retrieval Service (Phase 4)."""

import pytest
from pathlib import Path
from gecko.services import knowledge


def test_search_strategies_retrieves_matching_strategies(tmp_path: Path):
    strat_dir = tmp_path / "strategies"
    strat_dir.mkdir()

    (strat_dir / "field-interaction.md").write_text(
        """---
name: "Field Interaction"
domains: [physics, astronomy]
aliases: [gravity, electrostatics]
tags: [field, continuous]
---
Field interaction narrative description.
""",
        encoding="utf-8",
    )

    results = knowledge.search_strategies(query="gravity", base_dir=tmp_path)
    assert len(results) >= 1
    assert results[0]["meta"]["name"] == "Field Interaction"


def test_search_examples_retrieves_linked_examples(tmp_path: Path):
    ex_dir = tmp_path / "examples" / "physics"
    ex_dir.mkdir(parents=True)

    (ex_dir / "finite-speed-gravity.md").write_text(
        """---
name: "Finite Speed of Gravity"
domain: physics
strategies_used: ["Field Interaction"]
tags: [gravity, physics]
---
Finite speed gravity narrative.
""",
        encoding="utf-8",
    )

    results = knowledge.search_examples(strategies=["Field Interaction"], base_dir=tmp_path)
    assert len(results) >= 1
    assert results[0]["meta"]["name"] == "Finite Speed of Gravity"


def test_search_agents_retrieves_agent_catalog(tmp_path: Path):
    agents_dir = tmp_path / "agents"
    agents_dir.mkdir()

    (agents_dir / "physics-agents.md").write_text(
        """---
name: "Physics Agents"
---
## Gravity (Finite Speed Sphere)
Model gravity as an expanding sphere.
""",
        encoding="utf-8",
    )

    results = knowledge.search_agents(query="gravity", base_dir=tmp_path)
    assert len(results) >= 1
    assert "Physics Agents" in results[0]["name"]
