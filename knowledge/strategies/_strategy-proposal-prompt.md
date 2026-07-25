# AI Strategy Proposal Prompt Template

This prompt template is used by the GECKO AI pipeline when a user's concept request
doesn't closely match any existing modeling strategy. The AI proposes a new strategy
that can be reviewed and added to the library.

---

## When to trigger

The backend triggers this prompt when:
1. Semantic search against `knowledge/strategies/` returns no results above the relevance threshold
2. OR the best-matching strategy has a low similarity score (< 0.6)
3. OR the AI explicitly states during Step 1 (Concept Modeling) that no existing strategy fits

---

## Prompt Template

```
You are analyzing a concept for the GECKO simulator system. The user wants to explore:

"{user_concept_description}"

You searched the existing modeling strategy library and found no strong match.
The closest strategies were:
{top_3_strategies_with_scores}

Your task: Propose a NEW modeling strategy that would serve this concept and similar
concepts in the same domain. The strategy should be general enough to be reusable
across multiple simulators, not specific to this one concept.

Output the strategy in the following YAML + Markdown format:

---
name: "strategy-name-in-kebab-case"
status: proposed
aliases: ["keyword1", "keyword2", "keyword3"]
domains: [domain1, domain2]
dimensionality: [2D, 3D]
typical_rendering: [library1, library2]
language: en

agent_pattern:
  description: "What do agents represent in this strategy?"
  typical_attributes: [attr1, attr2, attr3]
  typical_behaviors: [behavior1, behavior2]

environment_pattern:
  description: "What role does the environment play?"
  typical_attributes: [attr1, attr2]

interaction_patterns:
  - trigger: what_causes_interaction
    effect: what_happens

visualization_hints:
  - "How should this be visually represented?"
---

# Strategy Name

## When to use this strategy
[When is this the right pattern to use?]

## Modeling reasoning
[Why does this decomposition help the learner understand the concept?]

## Key mathematics / logic
[What are the core equations or rules?]

## Pitfalls
[What should the AI avoid when implementing this strategy?]

## Composability
[How does this strategy combine with existing ones?]

## Related strategies
[Which existing strategies are close but different, and why?]

IMPORTANT GUIDELINES:
- The strategy must fit within the GECKO Agent/Environment abstraction
- Agents must be concrete, countable objects the user can see and interact with
- The environment must have attributes that govern global behavior
- The strategy should be GENERAL — applicable to multiple concepts, not just this one
- Set status to "proposed" — a human will review before it becomes "stable"
- Reference existing strategies in the "Related strategies" section
- Include at least 3 aliases that users might type when describing concepts in this domain

Existing strategies in the library (for reference):
{list_of_all_strategy_names_and_one_line_descriptions}
```

---

## Post-proposal workflow

1. The AI generates the strategy proposal
2. The proposal is shown to the user alongside the simulator concept proposal (Step 1)
3. If the user approves:
   - The strategy file is saved to `knowledge/strategies/{name}.md` with `status: proposed`
   - The simulator proceeds to generation using the new strategy
4. A GECKO maintainer can later review `proposed` strategies and promote to `stable`
5. If the user rejects the strategy proposal, they can suggest modifications or point to an existing strategy

---

## Quality criteria for proposed strategies

A good strategy proposal should:
- [ ] Have a clear, descriptive name
- [ ] Cover a *class* of concepts, not just one specific concept
- [ ] Have at least 3 meaningful aliases
- [ ] Reference at least 2 related existing strategies
- [ ] Include concrete mathematics or logic (not just prose)
- [ ] Have at least 2 pitfalls from domain expertise
- [ ] Describe composability with at least 1 existing strategy
