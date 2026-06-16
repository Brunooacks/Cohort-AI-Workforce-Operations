---
name: Cohort severity enums
description: Two distinct severity enums in the Cohort API — alerts vs evaluation layers — that share three values but differ on the fourth.
---

Cohort has **two different `severity` enums** in the generated API, which is easy to conflate:

- **Fleet alerts** (`/api/fleet/alerts`): `critical | high | medium | antecedent`
- **Evaluation layers / agents** (`scoreEvaluation`, agent detail layers): `critical | high | medium | stable`

They share the first three values but the fourth differs (`antecedent` for alerts vs `stable` for evaluations).

**Why:** a shared `SeverityBadge`/`SEVERITY_MAP` and the alerts page filter chips must include BOTH `antecedent` and `stable`, or one surface silently drops a valid value. A redesign once removed the `antecedent` alert filter, losing the ability to filter a real severity class.

**How to apply:** when touching `SeverityBadge` (cohort.tsx `SEVERITY_MAP`) or alert/evaluation filter UIs, keep all five keys (`critical, high, medium, antecedent, stable`). Confirm the exact enum from `lib/api-zod/src/generated/api.ts` per endpoint rather than assuming one global enum.
