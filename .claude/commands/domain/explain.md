---
allowed-tools: mcp__memory__*, Task, Read
description: Explain domain model with entities, relationships, and ubiquitous language
argument-hint: {area_name:string}
---

# Explain Domain

Display comprehensive domain model explanation: entities, value objects, aggregates, relationships, and ubiquitous language glossary.

## 1. Load Domain Model
- Validate area_name non-empty
- Find domain model: Documents/Areas/{area_name}/DOMAIN_MODEL.md
- Verify file exists
- Read complete specification

## 2. Generate Explanation
Delegate to solution-engineer:
```
ROLE: Domain Model Explainer

TASK: Create user-friendly explanation of domain model "{area_name}"

DOMAIN MODEL: {domain_model_content}

OUTPUT FORMAT:

1. OVERVIEW (2-3 sentences)
   - Purpose of this bounded context
   - Key responsibilities
   - Integration with other contexts

2. ENTITIES TABLE
   | Entity | Type | Key Properties | Purpose |
   |--------|------|----------------|---------|

3. VALUE OBJECTS TABLE
   | Value Object | Properties | Immutability Rule |
   |--------------|------------|-------------------|

4. AGGREGATES
   For each aggregate:
   - Root: {root_entity}
   - Members: {member_entities}
   - Boundary Rule: {consistency_rule}

5. RELATIONSHIP DIAGRAM (ASCII)
   Show entity relationships with cardinality

6. DOMAIN SERVICES
   | Service | Purpose | Key Operations |
   |---------|---------|----------------|

7. UBIQUITOUS LANGUAGE GLOSSARY
   {term}: {definition}
   (alphabetical order)

8. KEY INVARIANTS
   - {invariant_id}: {rule_description}

Use clear, educational formatting for developers learning the domain.
```

## 3. Display Explanation
Show formatted explanation with visual hierarchy

**Note**: Educational command for understanding domain architecture. Useful for onboarding and domain knowledge sharing.
