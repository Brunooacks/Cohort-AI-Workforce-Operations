import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Eyebrow: tiny uppercase tracked microlabel ───────────── */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── PageHeading: editorial serif title + eyebrow + subtitle ── */
export function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight leading-[1.05] text-foreground">
          {title}
        </h1>
        {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

/* ── StatCard: outline icon + eyebrow + big serif number ────── */
export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone = "neutral",
}: {
  icon?: LucideIcon;
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  tone?: "neutral" | "up" | "down" | "warn";
}) {
  const deltaTone =
    tone === "up"
      ? "text-chart-1"
      : tone === "down"
        ? "text-chart-3"
        : tone === "warn"
          ? "text-chart-2"
          : "text-muted-foreground";
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-5">
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/70" strokeWidth={1.75} />}
      </div>
      <div className="font-serif text-[2.25rem] font-medium leading-none tracking-tight">{value}</div>
      {delta && <div className={cn("text-xs font-medium", deltaTone)}>{delta}</div>}
    </div>
  );
}

/* ── Pill / status badges ───────────────────────────────────── */
type Tone = "sage" | "ochre" | "terracotta" | "red" | "blue" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  sage: "bg-chart-1/15 text-chart-1",
  ochre: "bg-chart-2/20 text-chart-2",
  terracotta: "bg-chart-3/15 text-chart-3",
  red: "bg-chart-4/15 text-chart-4",
  blue: "bg-chart-5/15 text-chart-5",
  muted: "bg-muted text-muted-foreground",
};

export function Pill({
  tone = "muted",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.07em]",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Ativo", tone: "sage" },
  flagged: { label: "Em alerta", tone: "terracotta" },
  observation: { label: "Probation", tone: "ochre" },
  retiring: { label: "Recalibrando", tone: "blue" },
  retired: { label: "Aposentado", tone: "muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, tone: "muted" as Tone };
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

const VERDICT_MAP: Record<string, { label: string; tone: Tone }> = {
  promote: { label: "Promover", tone: "sage" },
  mentor: { label: "Mentorar", tone: "ochre" },
  retire: { label: "Aposentar", tone: "terracotta" },
  observation: { label: "Observar", tone: "blue" },
};

export function VerdictBadge({ verdict }: { verdict: string }) {
  const v = VERDICT_MAP[verdict] ?? { label: verdict, tone: "muted" as Tone };
  return <Pill tone={v.tone}>{v.label}</Pill>;
}

const SEVERITY_MAP: Record<string, { label: string; tone: Tone }> = {
  critical: { label: "Crítica", tone: "red" },
  high: { label: "Alta", tone: "terracotta" },
  medium: { label: "Média", tone: "ochre" },
  antecedent: { label: "Antecedente", tone: "blue" },
  stable: { label: "Estável", tone: "sage" },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_MAP[severity] ?? { label: severity, tone: "muted" as Tone };
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

/* ── FilterChip: pill toggle with optional count ────────────── */
export function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn("tabular-nums", active ? "text-primary-foreground/70" : "text-muted-foreground/60")}>
          · {count}
        </span>
      )}
    </button>
  );
}

/* ── Avatar disc with initial, colored by hashed name ───────── */
const DISC_TONES = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/25 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-5/20 text-chart-5",
  "bg-primary/15 text-primary",
];

export function AgentDisc({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();
  let hash = 0;
  for (let i = 0; i < (name?.length ?? 0); i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const tone = DISC_TONES[hash % DISC_TONES.length];
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 text-2xl"
      : size === "sm"
        ? "h-8 w-8 text-xs"
        : "h-10 w-10 text-sm";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-serif font-medium",
        sizeClass,
        tone,
        className,
      )}
    >
      {initial}
    </div>
  );
}
