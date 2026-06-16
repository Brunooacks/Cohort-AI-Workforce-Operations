import { AppLayout } from "@/components/layout";
import { useListAgents } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Plus, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { ErrorState } from "@/components/query-state";
import { useAppShell } from "@/lib/app-shell";
import {
  PageHeading,
  StatusBadge,
  VerdictBadge,
  FilterChip,
  AgentDisc,
  Eyebrow,
} from "@/components/cohort";

const STATUS_FILTERS: { key: string; label: string; status?: string }[] = [
  { key: "all", label: "Todos" },
  { key: "flagged", label: "Em alerta", status: "flagged" },
  { key: "retiring", label: "Recalibrando", status: "retiring" },
  { key: "observation", label: "Probation", status: "observation" },
  { key: "active", label: "Ativos", status: "active" },
];

function formatCurrencyK(value: number) {
  return `R$ ${(value / 1000).toFixed(1)}k`;
}

export default function AgentsPage() {
  const { search, perspective } = useAppShell();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: agents, isLoading, isError, refetch } = useListAgents({
    search: search || undefined,
  });

  const counts = (status?: string) =>
    status ? (agents?.filter((a) => a.status === status).length ?? 0) : (agents?.length ?? 0);

  const filteredAgents = agents?.filter(
    (a) => statusFilter === "all" || a.status === statusFilter,
  );

  const needAttention = agents?.filter((a) => a.status === "flagged" || (a.activeAlerts ?? 0) > 0).length ?? 0;
  const onboarding = agents?.filter((a) => a.status === "observation").length ?? 0;

  return (
    <AppLayout breadcrumbs={[{ label: "Workspace" }, { label: "Portfólio" }]}>
      <div className="space-y-7 animate-in fade-in duration-500">
        <PageHeading
          eyebrow="Workspace"
          title="Portfólio"
          subtitle={
            agents
              ? `${agents.length} agentes na frota · ${needAttention} precisam de atenção · ${onboarding} em onboarding`
              : "Carteira de trabalho e desempenho de toda a frota."
          }
          action={
            <Button asChild>
              <Link href="/admissao">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar agente
              </Link>
            </Button>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </span>
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              active={statusFilter === f.key}
              onClick={() => setStatusFilter(f.key)}
              count={counts(f.status)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>

        {isError ? (
          <ErrorState title="Não foi possível carregar os agentes" onRetry={() => refetch()} />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-card-border">
                  <TableHead className="py-3"><Eyebrow>Agente · Papel</Eyebrow></TableHead>
                  <TableHead><Eyebrow>{perspective === "platform" ? "Plataforma · Versão" : "Plataforma"}</Eyebrow></TableHead>
                  <TableHead><Eyebrow>Status</Eyebrow></TableHead>
                  <TableHead className="text-right"><Eyebrow>Saúde</Eyebrow></TableHead>
                  <TableHead className="text-right"><Eyebrow>Valor líq.</Eyebrow></TableHead>
                  <TableHead><Eyebrow>Veredito</Eyebrow></TableHead>
                  <TableHead className="w-[44px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="ml-auto h-4 w-[40px]" /></TableCell>
                        <TableCell><Skeleton className="ml-auto h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                ) : filteredAgents && filteredAgents.length > 0 ? (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id} className="group cursor-pointer border-card-border">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <AgentDisc name={agent.name} />
                          <div className="min-w-0">
                            <Link
                              href={`/agentes/${agent.id}`}
                              className="block truncate font-medium text-foreground hover:underline"
                            >
                              {agent.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">{agent.role}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {perspective === "platform" ? (
                          <span className="font-mono text-xs">
                            {agent.platform} · v{agent.version}
                          </span>
                        ) : (
                          <span className="capitalize">{agent.platform}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={agent.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-end gap-1.5 font-mono text-sm tabular-nums">
                          {agent.activeAlerts ? (
                            <AlertTriangle className="h-3 w-3 text-chart-3" />
                          ) : null}
                          {agent.healthScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                        {typeof agent.monthlyValue === "number" && typeof agent.monthlyCost === "number"
                          ? formatCurrencyK(agent.monthlyValue - agent.monthlyCost)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <VerdictBadge verdict={agent.currentVerdict} />
                      </TableCell>
                      <TableCell>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Link href={`/agentes/${agent.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                      {agents && agents.length > 0
                        ? "Nenhum agente para os filtros atuais."
                        : "Nenhum agente encontrado."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
