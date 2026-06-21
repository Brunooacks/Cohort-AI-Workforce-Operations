---
name: Discovery draft metrics vs evaluation shape
description: Why AI-draft metric target/rationale are proposal-only and how 5-layer coverage is guaranteed at admission.
---

# Discovery draft metrics vs evaluation shape

The Admissão discovery flow produces `AgentDraft.proposedMetrics` with
`layer/label/unit/target/rationale`. These now flow through admission seeding
onto the stored evaluation.

**Goal-vs-actual is persisted:** `KpiMetric` carries optional `target` and
`rationale`. The draft's target/rationale are carried through
`proposedMetricsFromDraft` → `scoreEvaluation`; catalog/manual-default seeds get
targets from `SIGNAL_MAP[*].target` and `DEFAULT_LAYER_METRIC[*].target`. The
agent-detail `MetricRow` shows `target` as the goal (falling back to the static
`METRIC_TARGETS` label map for pre-existing rows) and `rationale` as a tooltip.

**Why:** `KpiMetric` is a jsonb interface field, so adding `target`/`rationale`
needs no DB migration — only the OpenAPI `KpiMetric` schema + codegen.

**How to apply:** Targets only persist for agents seeded/admitted AFTER this
change. The deterministic seed regenerates identical agents, so truncating
`agents` and restarting the API re-seeds the demo fleet with targets.

## 5-layer coverage guarantee
Every draft and every admission-seeded evaluation must cover all 5 layers
(efficacy/efficiency/adoption/governance/value). This is enforced
deterministically via `DEFAULT_LAYER_METRIC` fallback fill at BOTH draft
generation and admission seeding — never trust the LLM (or the user's edits)
to include all layers.

**Why:** Cohort's whole model is the 5-layer evaluation; an agent admitted
with a partial metric set yields an incomplete evaluation. The model can omit
layers and the UI lets users delete metric rows, so the guarantee lives in code.
