import { AppLayout } from "@/components/layout";
import {
  useGetFleetSummary,
  useListFleetDecisions,
  useListFleetAlerts,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Gavel, AlertTriangle, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { ErrorState } from "@/components/query-state";
import { PageHeading, StatCard, VerdictBadge, Pill, AgentDisc } from "@/components/cohort";
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

export default function CommandPage() {
  const {
    data: summary,
    isLoading: loadingSummary,
    isError: errorSummary,
    refetch: refetchSummary,
  } = useGetFleetSummary();
  const {
    data: decisions,
    isLoading: loadingDecisions,
    isError: errorDecisions,
    refetch: refetchDecisions,
  } = useListFleetDecisions();
  const {
    data: alerts,
    isLoading: loadingAlerts,
    isError: errorAlerts,
    refetch: refetchAlerts,
  } = useListFleetAlerts();

  const hasError = errorSummary || errorDecisions || errorAlerts;

  const pending = decisions?.filter((d) => d.decision === "pending") ?? [];
  const recent =
    decisions
      ?.filter((d) => d.decision !== "pending")
      .sort((a, b) => {
        const da = a.decidedAt ? Date.parse(a.decidedAt) : 0;
        const db = b.decidedAt ? Date.parse(b.decidedAt) : 0;
        return db - da;
      }) ?? [];

  return (
    <AppLayout breadcrumbs={[{ label: "Operação" }, { label: "Comando" }]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeading
          eyebrow="Operação"
          title="Comando"
          subtitle="Seu posto de comando: decisões do comitê pendentes, vereditos recentes e o pulso geral da frota."
          action={
            <Button asChild variant="outline">
              <Link href="/frota">
                Ver painel completo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          }
        />

        {hasError && (
          <ErrorState
            title="Não foi possível carregar o comando"
            description="Tente novamente em instantes."
            onRetry={() => {
              if (errorSummary) refetchSummary();
              if (errorDecisions) refetchDecisions();
              if (errorAlerts) refetchAlerts();
            }}
          />
        )}

        {/* Stat row */}
        {loadingSummary ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total de agentes"
              value={summary.totalAgents}
              delta={`${summary.connectedPlatforms} plataformas conectadas`}
            />
            <StatCard
              icon={Gavel}
              label="Decisões pendentes"
              value={summary.pendingDecisions}
              delta="Aguardando o comitê"
              tone={summary.pendingDecisions > 0 ? "warn" : "neutral"}
            />
            <StatCard
              icon={AlertTriangle}
              label="Alertas ativos"
              value={summary.activeAlerts}
              delta="Padrões ilusórios detectados"
              tone={summary.activeAlerts > 0 ? "down" : "neutral"}
            />
            <StatCard
              icon={Activity}
              label="Saúde média"
              value={
                <span>
                  {summary.avgHealthScore}
                  <span className="text-xl text-muted-foreground">/100</span>
                </span>
              }
              delta="Índice consolidado da frota"
            />
          </div>
        ) : null}

        {/* Pending decisions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={`${cardTitleSerif} flex items-center gap-2`}>
                <Gavel className="h-4 w-4 text-chart-2" /> Decisões pendentes
              </CardTitle>
              <CardDescription>Vereditos propostos aguardando aprovação do comitê</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDecisions ? (
              <div className="grid gap-3 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : pending.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {pending.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col gap-3 rounded-lg border border-card-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <AgentDisc name={d.agentName} />
                        <div className="min-w-0">
                          <Link
                            href={`/agentes/${d.agentId}`}
                            className="block truncate font-medium text-foreground hover:underline"
                          >
                            {d.agentName}
                          </Link>
                          <span className="truncate text-xs text-muted-foreground">{d.agentRole}</span>
                        </div>
                      </div>
                      <VerdictBadge verdict={d.verdict} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">{platformLabel(d.platform)}</span>
                      <span>
                        Confiança{" "}
                        <span className="font-mono tabular-nums text-foreground">{d.confidence}%</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Janela: {d.executionWindow}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/agentes/${d.agentId}`}>Revisar</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-card-border bg-muted/30 p-8 text-center">
                <ShieldCheck className="mb-2 h-8 w-8 text-chart-1 opacity-50" />
                <p className="text-sm font-medium">Nenhuma decisão pendente</p>
                <p className="text-xs text-muted-foreground">O comitê está em dia com os vereditos.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent decisions + active alerts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className={cardTitleSerif}>Decisões recentes</CardTitle>
              <CardDescription>Histórico de vereditos resolvidos pelo comitê</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingDecisions ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)
              ) : recent.length > 0 ? (
                recent.map((d) => (
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
                          {d.decidedBy ?? "—"} · {fmtDate(d.decidedAt)}
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
                  Nenhuma decisão registrada ainda.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className={`${cardTitleSerif} flex items-center gap-2`}>
                  <AlertTriangle className="h-4 w-4 text-chart-3" /> Alertas
                </CardTitle>
                <CardDescription>Detector de Vitória Ilusória</CardDescription>
              </div>
              <Link
                href="/alertas"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAlerts ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
              ) : alerts && alerts.length > 0 ? (
                alerts.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    href={`/agentes/${a.agentId}`}
                    className="flex flex-col gap-1 rounded-lg border border-card-border bg-card p-3 hover-elevate"
                  >
                    <span className="truncate text-sm font-medium">{a.pattern}</span>
                    <span className="truncate text-xs text-muted-foreground">{a.agentName}</span>
                  </Link>
                ))
              ) : (
                <div className="flex h-24 items-center justify-center text-center text-sm text-muted-foreground">
                  Nenhum alerta ativo.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
