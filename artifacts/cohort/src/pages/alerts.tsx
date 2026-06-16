import { AppLayout } from "@/components/layout";
import { useListFleetAlerts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ChevronRight, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";
import { ErrorState } from "@/components/query-state";
import { PageHeading, SeverityBadge, FilterChip, Eyebrow } from "@/components/cohort";

const SEVERITY_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "critical", label: "Crítica" },
  { key: "high", label: "Alta" },
  { key: "medium", label: "Média" },
  { key: "antecedent", label: "Antecedente" },
];

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativo" },
  { key: "acknowledged", label: "Reconhecido" },
  { key: "resolved", label: "Resolvido" },
];

export default function AlertsPage() {
  const { data: alerts, isLoading, isError, refetch } = useListFleetAlerts();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAlerts = alerts?.filter(
    (a) =>
      (severityFilter === "all" || a.severity === severityFilter) &&
      (statusFilter === "all" || a.status === statusFilter),
  );

  return (
    <AppLayout breadcrumbs={[{ label: "Governança" }, { label: "Detector de Vitória Ilusória" }]}>
      <div className="space-y-7 animate-in fade-in duration-500">
        <PageHeading
          eyebrow="Governança"
          title="Detector de Vitória Ilusória"
          subtitle="Monitoramento passivo que cruza as 5 camadas de KPIs em busca de contradições — ex.: adoção caindo enquanto o sucesso aparente sobe."
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Severidade</Eyebrow>
            {SEVERITY_FILTERS.map((f) => (
              <FilterChip key={f.key} active={severityFilter === f.key} onClick={() => setSeverityFilter(f.key)}>
                {f.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>Status</Eyebrow>
            {STATUS_FILTERS.map((f) => (
              <FilterChip key={f.key} active={statusFilter === f.key} onClick={() => setStatusFilter(f.key)}>
                {f.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {isError ? (
          <ErrorState title="Não foi possível carregar os alertas" onRetry={() => refetch()} />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableHead><Eyebrow>Padrão detectado</Eyebrow></TableHead>
                  <TableHead><Eyebrow>Severidade</Eyebrow></TableHead>
                  <TableHead><Eyebrow>Agente afetado</Eyebrow></TableHead>
                  <TableHead><Eyebrow>Hipótese do comitê</Eyebrow></TableHead>
                  <TableHead><Eyebrow>Detectado em</Eyebrow></TableHead>
                  <TableHead className="w-[44px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                ) : filteredAlerts && filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className="border-card-border">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Eye
                            className={`h-4 w-4 ${
                              alert.severity === "critical" ? "text-chart-4" : "text-chart-3"
                            }`}
                          />
                          {alert.pattern}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={alert.severity} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/agentes/${alert.agentId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {alert.agentName}
                        </Link>
                      </TableCell>
                      <TableCell
                        className="max-w-[300px] truncate text-sm text-muted-foreground"
                        title={alert.hypothesis}
                      >
                        {alert.hypothesis}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                        {new Date(alert.detectedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Link href={`/agentes/${alert.agentId}`}>
                          <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : alerts && alerts.length > 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                      Nenhum alerta para os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ShieldCheck className="mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm font-medium text-foreground">Nenhum alerta ativo.</p>
                        <p className="text-xs">A frota está operando sem contradições lógicas.</p>
                      </div>
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
