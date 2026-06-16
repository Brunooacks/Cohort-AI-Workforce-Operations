import { AppLayout } from "@/components/layout";
import { useGetAgent, useGetAgentMetrics, useDecideVerdict } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { getGetAgentQueryKey, getGetAgentMetricsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ErrorState } from "@/components/query-state";
import {
  AgentDisc,
  Pill,
  StatusBadge,
  VerdictBadge,
  SeverityBadge,
  Eyebrow,
} from "@/components/cohort";

const cardTitleSerif = "font-serif text-lg font-medium tracking-tight";

function MetricChart({ agentId }: { agentId: string }) {
  const { data: metrics, isLoading, isError, refetch } = useGetAgentMetrics(agentId, "30d", {
    query: { enabled: !!agentId, queryKey: getGetAgentMetricsQueryKey(agentId, "30d") },
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;
  if (isError)
    return <ErrorState compact title="Não foi possível carregar as métricas" onRetry={() => refetch()} />;
  if (!metrics || metrics.length === 0)
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-card-border bg-muted/20 text-sm text-muted-foreground">
        Nenhum dado de métrica disponível para os últimos 30 dias.
      </div>
    );

  const formattedData = metrics.map((m) => ({
    ...m,
    date: new Date(m.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Line type="monotone" dataKey="value" name="Valor" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="efficacy" name="Eficácia" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="efficiency" name="Eficiência" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="adoption" name="Adoção" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="governance" name="Governança" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getDirectionIcon(direction?: string) {
  if (direction === "up") return <ArrowUpRight className="h-3 w-3 text-chart-1" />;
  if (direction === "down") return <ArrowDownRight className="h-3 w-3 text-chart-3" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

const tabTrigger =
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-0 py-3 text-muted-foreground font-medium";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const { toast } = useToast();

  const { data: detail, isLoading, isError, refetch } = useGetAgent(agentId, {
    query: { enabled: !!agentId, queryKey: getGetAgentQueryKey(agentId) },
  });

  const decideVerdict = useDecideVerdict();

  const handleDecision = (decision: "approved" | "disagreed" | "exported") => {
    decideVerdict.mutate(
      { agentId, data: { decision } },
      {
        onSuccess: () => {
          toast({
            title: "Decisão registrada",
            description: `Veredito ${
              decision === "approved" ? "aprovado" : decision === "disagreed" ? "discordado" : "exportado"
            } com sucesso.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetAgentQueryKey(agentId) });
        },
        onError: () => {
          toast({ title: "Erro", description: "Não foi possível registrar a decisão.", variant: "destructive" });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Portfólio", href: "/agentes" }, { label: "Carregando…" }]}>
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout breadcrumbs={[{ label: "Portfólio", href: "/agentes" }, { label: "Erro" }]}>
        <ErrorState title="Não foi possível carregar o agente" onRetry={() => refetch()} />
      </AppLayout>
    );
  }

  if (!detail) {
    return (
      <AppLayout breadcrumbs={[{ label: "Portfólio", href: "/agentes" }, { label: "Não encontrado" }]}>
        <div className="flex h-64 items-center justify-center text-muted-foreground">Agente não encontrado.</div>
      </AppLayout>
    );
  }

  const { agent, identity, owners, latestEvaluation, currentVerdict } = detail;

  return (
    <AppLayout breadcrumbs={[{ label: "Portfólio", href: "/agentes" }, { label: agent.name }]}>
      <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
        {/* Header Profile */}
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-card-border bg-card p-6 md:flex-row">
          <div className="flex gap-5">
            <AgentDisc name={agent.name} size="lg" />
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{agent.name}</h1>
                <StatusBadge status={agent.status} />
              </div>
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{agent.platform}</span>
                <span>·</span>
                <span className="font-mono">v{agent.version}</span>
                <span>·</span>
                <span>{agent.role}</span>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">{agent.bio}</p>

              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <Eyebrow>Dono de negócio</Eyebrow>
                  <span className="mt-0.5 block font-medium">{owners.businessOwner}</span>
                </div>
                <div>
                  <Eyebrow>Dono técnico</Eyebrow>
                  <span className="mt-0.5 block font-medium">{owners.technicalOwner}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 rounded-lg border border-card-border bg-background/60 px-5 py-4">
            <Eyebrow>Saúde geral</Eyebrow>
            <div className="font-serif text-5xl font-medium leading-none tabular-nums">{agent.healthScore}</div>
            <VerdictBadge verdict={agent.currentVerdict} />
          </div>
        </div>

        {/* Decisão recomendada */}
        {currentVerdict && currentVerdict.decision === "pending" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Eyebrow>Decisão recomendada</Eyebrow>
                  <VerdictBadge verdict={currentVerdict.verdict} />
                  <span className="text-xs font-medium text-primary">
                    Confiança {currentVerdict.confidence}%
                  </span>
                </div>
                <p className="mb-1 max-w-2xl text-sm font-medium text-foreground/90">{currentVerdict.rationale}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Sponsor: {currentVerdict.suggestedSponsor}</span>
                  <span>Janela: {currentVerdict.executionWindow}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDecision("disagreed")}>
                  <X className="mr-1 h-4 w-4" /> Discordar
                </Button>
                <Button size="sm" onClick={() => handleDecision("approved")}>
                  <Check className="mr-1 h-4 w-4" /> Aprovar veredito
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="evaluation" className="w-full">
          <TabsList className="h-auto w-full justify-start space-x-6 rounded-none border-b border-card-border bg-transparent p-0">
            <TabsTrigger value="evaluation" className={tabTrigger}>Avaliação KPI</TabsTrigger>
            <TabsTrigger value="identity" className={tabTrigger}>Carteira de Trabalho</TabsTrigger>
            <TabsTrigger value="actions" className={tabTrigger}>Plano de Ação</TabsTrigger>
          </TabsList>

          <TabsContent value="evaluation" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {latestEvaluation?.layers.map((layer) => (
                <Card key={layer.key} className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-card-border bg-secondary/30 px-4 py-3">
                    <Eyebrow>{layer.label}</Eyebrow>
                    <span className="font-serif text-xl font-medium tabular-nums">{layer.score}</span>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <SeverityBadge severity={layer.severity} />
                    {layer.metrics.map((metric, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{metric.label}</span>
                          {getDirectionIcon(metric.direction)}
                        </div>
                        <div className="font-mono text-sm tabular-nums">
                          {metric.value}{" "}
                          <span className="text-xs font-normal text-muted-foreground">{metric.unit}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className={cardTitleSerif}>Histórico de Performance</CardTitle>
                <CardDescription>Série temporal das 5 camadas nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart agentId={agentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className={cardTitleSerif}>Diretrizes de Autonomia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Eyebrow>Nível</Eyebrow>
                    <div className="mt-1.5">
                      <Pill tone="blue">{identity.autonomyLevel}</Pill>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{identity.autonomyNotes}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-chart-1">Deve fazer</h4>
                      <ul className="space-y-1.5 text-sm">
                        {identity.shouldDo.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <Check className="h-4 w-4 shrink-0 text-chart-1" /> <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-chart-3">Não deve fazer</h4>
                      <ul className="space-y-1.5 text-sm">
                        {identity.shouldNotDo.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <X className="h-4 w-4 shrink-0 text-chart-3" /> <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className={cardTitleSerif}>Caso de Negócio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{identity.businessCase.description}</p>
                  <div className="grid grid-cols-3 gap-4 border-t border-card-border pt-4">
                    <div>
                      <Eyebrow>Baseline</Eyebrow>
                      <span className="mt-1 block font-mono text-sm tabular-nums">{identity.businessCase.baseline}</span>
                    </div>
                    <div>
                      <Eyebrow>Meta</Eyebrow>
                      <span className="mt-1 block font-mono text-sm tabular-nums">{identity.businessCase.targetPayback}</span>
                    </div>
                    <div>
                      <Eyebrow>Atual</Eyebrow>
                      <span className="mt-1 block font-mono text-sm tabular-nums text-primary">{identity.businessCase.actualPayback}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle className={cardTitleSerif}>Próximas Ações Sugeridas</CardTitle>
                <CardDescription>Geradas pelo comitê para o veredito atual</CardDescription>
              </CardHeader>
              <CardContent>
                {currentVerdict && currentVerdict.nextActions.length > 0 ? (
                  <div className="space-y-3">
                    {currentVerdict.nextActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between rounded-lg border border-card-border bg-card p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{action.action}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Responsável: {action.owner}</p>
                        </div>
                        <Pill tone="muted">{action.due}</Pill>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma ação pendente.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
