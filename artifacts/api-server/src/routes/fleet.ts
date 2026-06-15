import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  agents,
  alerts,
  evaluations,
  metricPoints,
  type KpiLayer,
  type LayerKey,
  type Severity,
} from "@workspace/db";
import {
  GetFleetSummaryResponse,
  GetFleetKpisResponse,
  ListFleetAlertsQueryParams,
  ListFleetAlertsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const LAYER_LABELS: Record<LayerKey, string> = {
  efficacy: "Eficácia",
  efficiency: "Eficiência",
  adoption: "Adoção",
  governance: "Governança",
  value: "Valor",
};

const LAYER_ORDER: LayerKey[] = [
  "efficacy",
  "efficiency",
  "adoption",
  "governance",
  "value",
];

function severityFromScore(score: number): Severity {
  if (score >= 80) return "stable";
  if (score >= 65) return "medium";
  if (score >= 50) return "high";
  return "critical";
}

const round1 = (n: number) => Math.round(n * 10) / 10;

router.get("/fleet/summary", requireAuth, async (_req, res) => {
  const allAgents = await db.select().from(agents);
  const allAlerts = await db.select().from(alerts);

  const byVerdict = { promote: 0, mentor: 0, retire: 0, observation: 0 };
  const bySeverity = { critical: 0, high: 0, medium: 0, stable: 0 };
  const platformCounts = new Map<string, number>();
  let healthSum = 0;
  let valueSum = 0;
  let costSum = 0;

  for (const a of allAgents) {
    byVerdict[a.currentVerdict] += 1;
    bySeverity[a.severity] += 1;
    platformCounts.set(a.platform, (platformCounts.get(a.platform) ?? 0) + 1);
    healthSum += a.healthScore;
    valueSum += a.monthlyValue;
    costSum += a.monthlyCost;
  }

  const activeAlerts = allAlerts.filter((a) => a.status === "active").length;

  const data = GetFleetSummaryResponse.parse({
    totalAgents: allAgents.length,
    byVerdict,
    bySeverity,
    byPlatform: [...platformCounts.entries()].map(([platform, count]) => ({
      platform,
      count,
    })),
    avgHealthScore: allAgents.length
      ? Math.round(healthSum / allAgents.length)
      : 0,
    activeAlerts,
    estimatedMonthlyValue: valueSum,
    estimatedMonthlyCost: costSum,
    connectedPlatforms: platformCounts.size,
  });

  res.json(data);
});

router.get("/fleet/kpis", requireAuth, async (_req, res) => {
  const allAgents = await db.select().from(agents);
  const allEvaluations = await db
    .select()
    .from(evaluations)
    .orderBy(desc(evaluations.evaluatedAt));
  const allPoints = await db.select().from(metricPoints);

  // Latest evaluation per agent.
  const latestByAgent = new Map<string, typeof allEvaluations[number]>();
  for (const e of allEvaluations) {
    if (!latestByAgent.has(e.agentId)) latestByAgent.set(e.agentId, e);
  }

  // Monthly trend across the whole fleet.
  const monthAcc = new Map<
    string,
    {
      efficacy: number;
      efficiency: number;
      adoption: number;
      governance: number;
      value: number;
      n: number;
    }
  >();
  for (const p of allPoints) {
    const period = p.timestamp.toISOString().slice(0, 7);
    const acc =
      monthAcc.get(period) ??
      {
        efficacy: 0,
        efficiency: 0,
        adoption: 0,
        governance: 0,
        value: 0,
        n: 0,
      };
    acc.efficacy += p.efficacy;
    acc.efficiency += p.efficiency;
    acc.adoption += p.adoption;
    acc.governance += p.governance;
    acc.value += p.value;
    acc.n += 1;
    monthAcc.set(period, acc);
  }

  const trend = [...monthAcc.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, a]) => {
      const efficacy = round1(a.efficacy / a.n);
      const efficiency = round1(a.efficiency / a.n);
      const adoption = round1(a.adoption / a.n);
      const governance = round1(a.governance / a.n);
      const value = round1(a.value / a.n);
      const health = round1(
        (efficacy + efficiency + adoption + governance + value) / 5,
      );
      return { period, efficacy, efficiency, adoption, governance, value, health };
    });

  const prev = trend.length > 1 ? trend[trend.length - 2] : undefined;
  const curr = trend.length > 0 ? trend[trend.length - 1] : undefined;

  // Fleet-wide 5-layer averages from the latest evaluation of each agent.
  const layers = LAYER_ORDER.map((key) => {
    let sum = 0;
    let count = 0;
    let agentsAtRisk = 0;
    for (const e of latestByAgent.values()) {
      const layer = (e.layers as KpiLayer[]).find((l) => l.key === key);
      if (!layer) continue;
      sum += layer.score;
      count += 1;
      if (layer.score < 65) agentsAtRisk += 1;
    }
    const score = count ? round1(sum / count) : 0;
    const trendDelta =
      curr && prev ? round1(curr[key] - prev[key]) : 0;
    return {
      key,
      label: LAYER_LABELS[key],
      score,
      severity: severityFromScore(score),
      trend: trendDelta,
      agentsAtRisk,
    };
  });

  let monthlyValue = 0;
  let monthlyCost = 0;
  let profitableAgents = 0;
  for (const a of allAgents) {
    monthlyValue += a.monthlyValue;
    monthlyCost += a.monthlyCost;
    if (a.monthlyValue > a.monthlyCost) profitableAgents += 1;
  }
  const netValue = monthlyValue - monthlyCost;
  const roiPercent = monthlyCost > 0 ? round1((netValue / monthlyCost) * 100) : 0;

  const sortedByHealth = [...allAgents].sort(
    (a, b) => b.healthScore - a.healthScore,
  );
  const toRef = (a: typeof allAgents[number]) => ({
    id: a.id,
    name: a.name,
    platform: a.platform,
    role: a.role,
    healthScore: a.healthScore,
    currentVerdict: a.currentVerdict,
    severity: a.severity,
  });

  const data = GetFleetKpisResponse.parse({
    layers,
    trend,
    roi: { monthlyValue, monthlyCost, netValue, roiPercent, profitableAgents },
    topPerformers: sortedByHealth.slice(0, 3).map(toRef),
    atRisk: sortedByHealth.slice(-3).reverse().map(toRef),
    totalEvaluations: allEvaluations.length,
  });

  res.json(data);
});

router.get("/fleet/alerts", requireAuth, async (req, res) => {
  const query = ListFleetAlertsQueryParams.parse(req.query);

  const rows = await db
    .select({
      id: alerts.id,
      agentId: alerts.agentId,
      agentName: agents.name,
      pattern: alerts.pattern,
      patternType: alerts.patternType,
      severity: alerts.severity,
      hypothesis: alerts.hypothesis,
      recommendation: alerts.recommendation,
      detectedAt: alerts.detectedAt,
      status: alerts.status,
    })
    .from(alerts)
    .innerJoin(agents, eq(alerts.agentId, agents.id))
    .orderBy(desc(alerts.detectedAt));

  const filtered = rows.filter(
    (r) =>
      (!query.severity || r.severity === query.severity) &&
      (!query.status || r.status === query.status),
  );

  const data = ListFleetAlertsResponse.parse(
    filtered.map((r) => ({
      ...r,
      detectedAt: r.detectedAt.toISOString(),
    })),
  );

  res.json(data);
});

export default router;
