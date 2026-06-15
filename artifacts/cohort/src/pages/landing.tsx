import { Link } from "wouter";
import {
  Fingerprint,
  Layers,
  Gavel,
  AlertTriangle,
  Users,
  Plug,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const layers = [
  { label: "Eficácia", score: 88, tone: "good" },
  { label: "Eficiência", score: 74, tone: "warn" },
  { label: "Adoção", score: 81, tone: "good" },
  { label: "Governança", score: 67, tone: "warn" },
  { label: "Valor", score: 92, tone: "good" },
] as const;

const features = [
  {
    icon: Fingerprint,
    title: "Admissão & Identidade",
    desc: "Descubra agentes via conectores e admita-os na frota com identidade e Carteira de Trabalho versionada.",
  },
  {
    icon: Layers,
    title: "Avaliação em 5 camadas",
    desc: "Eficácia, eficiência, adoção, governança e valor — uma leitura sistêmica, não métrica isolada.",
  },
  {
    icon: Gavel,
    title: "Veredito do Comitê",
    desc: "Promover, Mentorar ou Aposentar — com confiança, janela de execução e próximas três ações.",
  },
  {
    icon: AlertTriangle,
    title: "Detector de Vitória Ilusória",
    desc: "Cruza KPIs para flagrar padrões antagônicos antes que virem incidente.",
  },
  {
    icon: Users,
    title: "Comitê & Governança",
    desc: "Dono de negócio, técnico e sponsor por agente — trilha auditável de cada veredito.",
  },
  {
    icon: Plug,
    title: "Plug-and-play",
    desc: "Conecta nas plataformas onde os agentes já rodam. Primeiro insight antes do café esfriar.",
  },
];

const verdicts = [
  { label: "Promover", icon: TrendingUp, color: "#34d399", count: "12" },
  { label: "Mentorar", icon: Minus, color: "#fbbf24", count: "7" },
  { label: "Aposentar", icon: TrendingDown, color: "#f87171", count: "3" },
];

const ACCENT = "#e8744a";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#e8744a]/30">
      {/* ── Cinematic aurora backdrop ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="aurora-a absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full blur-[120px] opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(232,116,74,0.55), rgba(232,116,74,0) 70%)",
          }}
        />
        <div
          className="aurora-b absolute top-1/4 right-[-15%] h-[70vh] w-[70vh] rounded-full blur-[120px] opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(72,138,120,0.6), rgba(72,138,120,0) 70%)",
          }}
        />
        <div
          className="aurora-a absolute bottom-[-20%] left-1/3 h-[60vh] w-[60vh] rounded-full blur-[120px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(96,120,180,0.5), rgba(96,120,180,0) 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[#0a0a0b]/30" />
      </div>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-30 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-[4.5rem] py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center font-bold text-[#0a0a0b]"
              style={{ background: ACCENT }}
            >
              C
            </div>
            <span className="font-semibold tracking-tight text-lg">Cohort</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full px-5 py-2 text-sm font-semibold text-[#0a0a0b] transition-transform hover:scale-[1.03]"
              style={{ background: ACCENT }}
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm mb-8">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: ACCENT }}
          />
          Governança contínua para frotas de agentes de IA
        </div>

        <h1 className="text-[15vw] leading-[0.86] sm:text-7xl md:text-8xl font-extrabold tracking-[-0.03em]">
          Sua força de
          <br />
          trabalho de IA,
          <br />
          <span className="font-display-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#e8744a] via-[#f0a17e] to-[#88b8a8]">
            sob julgamento.
          </span>
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <p className="max-w-xl text-lg text-zinc-400 leading-relaxed">
            Cada agente em produção com identidade, donos e veredito periódico.
            Cohort cruza KPIs em{" "}
            <span className="text-zinc-100 font-medium">5 camadas</span>, detecta
            vitórias ilusórias e decide com dados:{" "}
            <span className="text-zinc-100 font-medium">promover</span>,{" "}
            <span className="text-zinc-100 font-medium">mentorar</span> ou{" "}
            <span className="text-zinc-100 font-medium">aposentar</span>.
          </p>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-[#0a0a0b] transition-transform hover:scale-[1.03]"
              style={{ background: ACCENT }}
            >
              Criar conta
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-base font-semibold text-zinc-100 backdrop-blur-sm transition-colors hover:bg-white/[0.07]"
            >
              Acessar painel
            </Link>
          </div>
        </div>

        {/* Floating product preview */}
        <div className="mt-20 relative">
          <div
            className="absolute -inset-x-10 -top-10 bottom-0 -z-10 blur-3xl opacity-30"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(232,116,74,0.4), transparent 70%)",
            }}
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-2xl shadow-black/50 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Perfil de desempenho
                </p>
                <p className="text-lg font-semibold">Frota · 22 agentes em campanha</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Saúde média
                </p>
                <p className="text-3xl font-bold" style={{ color: ACCENT }}>
                  80
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3.5">
                {layers.map((l) => (
                  <div key={l.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-zinc-300">{l.label}</span>
                      <span className="tabular-nums font-semibold">{l.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${l.score}%`,
                          background:
                            l.tone === "good"
                              ? "linear-gradient(90deg, #488a78, #34d399)"
                              : "linear-gradient(90deg, #d98a3a, #fbbf24)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:content-start">
                {verdicts.map((v) => (
                  <div
                    key={v.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex md:items-center gap-3 flex-col md:flex-row text-center md:text-left"
                  >
                    <v.icon
                      className="h-5 w-5 mx-auto md:mx-0"
                      style={{ color: v.color }}
                    />
                    <div>
                      <p className="text-xl font-bold tabular-nums leading-none">
                        {v.count}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{v.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The loop ── */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
            {["Admissão", "Avaliação", "Veredito"].map((step, i) => (
              <div key={step} className="flex items-center gap-4 sm:gap-3">
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-[#0a0a0b]"
                    style={{ background: ACCENT }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </div>
                {i < 2 && (
                  <ArrowRight className="h-4 w-4 text-zinc-400 rotate-90 sm:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl mb-14">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: ACCENT }}
          >
            A camada de gestão da sua frota
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Outras ferramentas mostram o que o agente fez.{" "}
            <span className="font-display-serif italic font-normal text-zinc-400">
              Cohort responde se ele deve continuar.
            </span>
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-[#0a0a0b]/60 p-7 transition-colors hover:bg-white/[0.03]"
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10"
                style={{ background: "rgba(232,116,74,0.12)" }}
              >
                <f.icon className="h-5 w-5" style={{ color: ACCENT }} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 px-8 py-16 text-center md:py-20">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(80% 120% at 50% 0%, rgba(232,116,74,0.28), rgba(10,10,11,0) 70%)",
            }}
          />
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
            Cada agente.{" "}
            <span className="font-display-serif italic font-normal">
              Cada ciclo.
            </span>{" "}
            Um veredito.
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400 mb-9 text-lg">
            Admita seus primeiros agentes em minutos e tenha o primeiro veredito
            do comitê ainda hoje.
          </p>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-[#0a0a0b] transition-transform hover:scale-[1.03]"
            style={{ background: ACCENT }}
          >
            Criar conta gratuita
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded flex items-center justify-center text-xs font-bold text-[#0a0a0b]"
              style={{ background: ACCENT }}
            >
              C
            </div>
            <span className="font-medium text-zinc-300">Cohort</span>
          </div>
          <p>Sua força de trabalho de IA, sob julgamento contínuo.</p>
        </div>
      </footer>
    </div>
  );
}
