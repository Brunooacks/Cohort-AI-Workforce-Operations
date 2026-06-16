import { AppLayout } from "@/components/layout";
import { useGetFleetGovernance } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ShieldCheck, Scale, Eye, AlertTriangle, UserCheck } from "lucide-react";
import { ErrorState } from "@/components/query-state";
import { PageHeading, StatCard, StatusBadge, VerdictBadge, Pill, AgentDisc, Eyebrow } from "@/components/cohort";
import { platformLabel } from "@/lib/platforms";

const cardTitleSerif = "font-serif text-xl font-medium tracking-tight";

const DECISION_MAP: Record<string, { label: string; tone: "sage" | "ochre" | "terracotta" | "blue" | "muted" }> = {
  pending: { label: "Pendente", tone: "ochre" },
  approved: { label: "Aprovada", tone: "sage" },
  disagreed: { label: "Discordada", tone: "terracotta" },
  exported: { label: "Exportada", tone: "blue" },
};

function DecisionBadge({ decision }: { decision: string }) {
  const d = DECISION_MAP[decision] ?? { label: decision, tone: "muted" as const };
  return <Pill tone={d.tone}>{d.label}</Pill>;
}

function fmtDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "—";
}

export default function GovernancePage() {
  const { data, isLoading, isError, refetch } = useGetFleetGovernance();
  const summary = data?.summary;

  return (
    <AppLayout breadcrumbs={[{ label: "Governança" }, { label: "Governança" }]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeading
          eyebrow="Governança"
          title="Governança da Frota"
          subtitle="Conformidade, cadeia de responsabilidade por dono de negócio e trilha de auditoria dos vereditos do comitê."
        />

        {isError ? (
          <ErrorState
            title="Não foi possível carregar a governança"
            description="Tente novamente em instantes."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            {/* Stat row */}
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : summary ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  icon={ShieldCheck}
                  label="Conformes"
                  value={
                    <span>
                      {summary.compliantAgents}
                      <span className="text-xl text-muted-foreground">/{summary.totalAgents}</span>
                    </span>
                  }
                  delta="Agentes em conformidade"
                  tone="up"
                />
                <StatCard
                  icon={Scale}
                  label="Score de governança"
                  value={
                    <span>
                      {summary.avgGovernanceScore}
                      <span className="text-xl text-muted-foreground">/100</span>
                    </span>
                  }
                  delta="Média da frota"
                />
                <StatCard
                  icon={Eye}
                  label="Em revisão"
                  value={summary.agentsInReview}
                  delta="Sob observação do comitê"
                  tone={summary.agentsInReview > 0 ? "warn" : "neutral"}
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Alertas abertos"
                  value={summary.openAlerts}
                  delta="Pendências de governança"
                  tone={summary.openAlerts > 0 ? "down" : "neutral"}
                />
                <StatCard
                  icon={UserCheck}
                  label="Totalmente atribuídos"
                  value={
                    <span>
                      {summary.fullyOwnedAgents}
                      <span className="text-xl text-muted-foreground">/{summary.totalAgents}</span>
                    </span>
                  }
                  delta="Com comitê completo"
                />
              </div>
            ) : null}

            {/* Responsibility chain */}
            <div className="space-y-4">
              <Eyebrow>Cadeia de responsabilidade</Eyebrow>
              {isLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-56 rounded-xl" />
                  ))}
                </div>
              ) : data && data.responsibilityChain.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {data.responsibilityChain.map((group) => (
                    <Card key={group.businessOwner}>
                      <CardHeader>
                        <CardTitle className={`${cardTitleSerif} flex items-center justify-between`}>
                          <span className="truncate">{group.businessOwner}</span>
                          <span className="shrink-0 font-mono text-sm font-normal tabular-nums text-muted-foreground">
                            {group.agentCount} agente{group.agentCount === 1 ? "" : "s"}
                          </span>
                        </CardTitle>
                        <CardDescription>Dono de negócio responsável</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {group.agents.map((a) => (
                          <div
                            key={a.id}
                            className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <AgentDisc name={a.name} size="sm" />
                                <div className="min-w-0">
                                  <Link
                                    href={`/agentes/${a.id}`}
                                    className="block truncate text-sm font-medium text-foreground hover:underline"
                                  >
                                    {a.name}
                                  </Link>
                                  <span className="truncate text-xs text-muted-foreground">{a.role}</span>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <StatusBadge status={a.status} />
                                <span className="font-mono text-sm tabular-nums">{a.governanceScore}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="truncate">
                                Técnico: <span className="text-foreground">{a.technicalOwner}</span>
                              </span>
                              <span className="truncate">
                                Sponsor: <span className="text-foreground">{a.governanceSponsor}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-card-border text-sm text-muted-foreground">
                  Nenhuma cadeia de responsabilidade definida.
                </div>
              )}
            </div>

            {/* Audit trail */}
            <Card>
              <CardHeader>
                <CardTitle className={cardTitleSerif}>Trilha de auditoria</CardTitle>
                <CardDescription>Vereditos do comitê e suas resoluções</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)
                ) : data && data.auditTrail.length > 0 ? (
                  data.auditTrail.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-card p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <AgentDisc name={d.agentName} size="sm" />
                        <div className="min-w-0">
                          <Link
                            href={`/agentes/${d.agentId}`}
                            className="block truncate text-sm font-medium text-foreground hover:underline"
                          >
                            {d.agentName}
                          </Link>
                          <span className="truncate text-xs text-muted-foreground">
                            {platformLabel(d.platform)} · {d.decidedBy ?? "—"} · {fmtDate(d.decidedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <VerdictBadge verdict={d.verdict} />
                        <DecisionBadge decision={d.decision} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                    Nenhum registro de auditoria ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
