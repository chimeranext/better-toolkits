"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { COPY, LINKS, METHOD_GROUPS, STATS, VENTURES, type Lang } from "@/lib/copy";
import { MARKETPLACE_ADD, TOOLKITS } from "@/lib/toolkits";

// --- small building blocks --------------------------------------------------

function CopyButton({ text, label, copied, className }: { text: string; label: string; copied: string; className?: string }) {
  const [done, setDone] = useState(false);
  const onCopy = useCallback(() => {
    navigator.clipboard?.writeText(text).then(() => {
      setDone(true);
      track("copy_command", { command: text });
      setTimeout(() => setDone(false), 2000);
    });
  }, [text]);
  return (
    <button
      type="button"
      onClick={onCopy}
      data-event="copy_command"
      aria-label={label}
      className={cn(
        "shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
        done ? "bg-success text-black" : "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
    >
      {done ? copied : label}
    </button>
  );
}

function Terminal({ cmd, label, copied }: { cmd: string; label: string; copied: string }) {
  return (
    <div className="terminal-dark w-full overflow-hidden rounded-lg border border-border shadow-lg">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-destructive/80" />
        <span className="h-3 w-3 rounded-full bg-warning/80" />
        <span className="h-3 w-3 rounded-full bg-success/80" />
      </div>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="min-w-0 flex-1">
          <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed [overflow-wrap:anywhere]">
            <span className="select-none text-brand-tertiary">$ </span>
            {cmd}
          </code>
        </div>
        <CopyButton text={cmd} label={label} copied={copied} />
      </div>
    </div>
  );
}

/** Signature element: the hero terminal "installs" the ten real toolkits. */
function HeroTerminal({ label, copied, readyLine }: { label: string; copied: string; readyLine: string }) {
  return (
    <div className="terminal-dark w-full overflow-hidden rounded-xl border border-primary/25 text-left shadow-[0_0_80px_-12px_rgba(124,92,255,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/80" />
          <span className="h-3 w-3 rounded-full bg-warning/80" />
          <span className="h-3 w-3 rounded-full bg-success/80" />
          <span className="ml-3 hidden font-mono text-xs text-[#837C99] sm:inline">chimeranext — ~/your-startup</span>
        </div>
        <CopyButton text={MARKETPLACE_ADD} label={label} copied={copied} />
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed sm:text-sm lg:text-[15px]">
        <div className="whitespace-pre-wrap [overflow-wrap:anywhere]">
          <span className="select-none text-brand-tertiary">$ </span>
          <span className="font-semibold">{MARKETPLACE_ADD}</span>
        </div>
        {TOOLKITS.map((tk, i) => (
          <div key={tk.dir} className="hero-line whitespace-pre-wrap [overflow-wrap:anywhere]" style={{ animationDelay: `${0.55 + i * 0.22}s` }}>
            <span className="select-none text-success">✓ </span>
            <span className="text-brand-primary">{tk.dir}</span>
            <span className="text-[#837C99]"> v{tk.version} — installed</span>
          </div>
        ))}
        <div className="hero-line caret whitespace-pre-wrap pt-1" style={{ animationDelay: `${0.55 + TOOLKITS.length * 0.22 + 0.3}s` }}>
          <span className="select-none text-brand-accent">➜ </span>
          <span className="font-semibold">{readyLine}</span>
        </div>
      </div>
    </div>
  );
}

function CtaLink({
  href, event, children, variant = "solid", className,
}: {
  href: string; event: Parameters<typeof track>[0]; children: React.ReactNode; variant?: "solid" | "ghost" | "outline"; className?: string;
}) {
  return (
    <a
      href={href}
      data-event={event}
      onClick={() => track(event)}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors",
        variant === "solid" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-primary/60 text-foreground hover:bg-primary/10",
        variant === "ghost" && "text-brand-accent hover:underline",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Fluid container: ~1440px at 1080p, breathes up to 4K instead of pinning at 1024. */
const CONTAINER = "mx-auto w-full max-w-[min(90rem,94vw)]";
const H2 = "text-center font-heading font-bold text-[clamp(1.75rem,1.1rem+1.7vw,3.25rem)] leading-tight";

function Section({ id, tone = "dark", className, children }: { id?: string; tone?: "dark" | "light"; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn(tone === "light" ? "surface-light" : "bg-background", "px-[clamp(1.25rem,4vw,4rem)] py-[clamp(4rem,9vh,7.5rem)]", className)}>
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

/** S4 artifact illustrations — no external images, everything speaks the product's language. */
function S4Visual({ index }: { index: number }) {
  if (index === 0) {
    // Release gates terminal
    return (
      <div className="terminal-dark overflow-hidden rounded-xl border border-primary/25 shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-destructive/80" /><span className="h-3 w-3 rounded-full bg-warning/80" /><span className="h-3 w-3 rounded-full bg-success/80" />
          <span className="ml-3 font-mono text-xs text-[#837C99]">app-gtm-release</span>
        </div>
        <div className="p-4 font-mono text-[13px] leading-relaxed sm:text-sm">
          <div><span className="text-brand-tertiary">$ </span>/app-gtm-release:ship-everywhere</div>
          <div><span className="text-success">✓ </span>Gate 1 · code readiness</div>
          <div><span className="text-success">✓ </span>Gate 2 · signed artifacts</div>
          <div><span className="text-success">✓ </span>Gate 3 · store validation</div>
          <div><span className="text-brand-accent">➜ </span>Published: Play · App Store · MS Store · Snap</div>
        </div>
      </div>
    );
  }
  if (index === 1) {
    // Journey map sketch
    const stages = ["Discover", "Consider", "Decide", "Onboard", "Retain"];
    const bars = [[3, 2, 1], [2, 3, 2], [1, 2, 3], [2, 3, 2], [3, 3, 3]];
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-destructive/70" /><span className="h-3 w-3 rounded-full bg-warning/70" /><span className="h-3 w-3 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">journey-map.html</span>
        </div>
        <div className="grid grid-cols-5 gap-3 p-5">
          {stages.map((s, si) => (
            <div key={s} className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{s}</div>
              <div className="mt-2 space-y-1.5">
                {bars[si].map((b, bi) => (
                  <div key={bi} className="h-2 rounded-full bg-primary" style={{ opacity: 0.25 + b * 0.25, width: `${b * 33}%`, marginInline: "auto" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (index === 2) {
    // Audit findings terminal
    return (
      <div className="terminal-dark overflow-hidden rounded-xl border border-primary/25 shadow-lg">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-destructive/80" /><span className="h-3 w-3 rounded-full bg-warning/80" /><span className="h-3 w-3 rounded-full bg-success/80" />
          <span className="ml-3 font-mono text-xs text-[#837C99]">make-no-mistakes</span>
        </div>
        <div className="p-4 font-mono text-[13px] leading-relaxed sm:text-sm">
          <div><span className="text-brand-tertiary">$ </span>/make-no-mistakes:audit</div>
          <div className="text-[#837C99]">▶ 6 detector families · 163 files scanned</div>
          <div><span className="text-destructive">✗ </span>schema-drift: 2 CONFIRMED</div>
          <div><span className="text-destructive">✗ </span>ddd-boundaries: 1 CONFIRMED</div>
          <div><span className="text-brand-accent">➜ </span>repo-health 72/100 — 3 cures proposed</div>
        </div>
      </div>
    );
  }
  // AAARRR funnel bars
  const funnel: Array<[string, number, string]> = [
    ["Awareness", 100, "#7C5CFF"], ["Acquisition", 64, "#3B82F6"], ["Activation", 41, "#22D3EE"],
    ["Revenue", 18, "#EC4899"], ["Retention", 27, "#34D399"], ["Referral", 9, "#FBBF24"],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-destructive/70" /><span className="h-3 w-3 rounded-full bg-warning/70" /><span className="h-3 w-3 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">aaarrr-funnel</span>
      </div>
      <div className="space-y-2.5 p-5">
        {funnel.map(([label, pct, color]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- page -------------------------------------------------------------------

export default function Page() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("bt-lang")) as Lang | null;
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "es" : "en";
      try { localStorage.setItem("bt-lang", next); } catch {}
      track("lang_toggle", { to: next });
      return next;
    });
  }, []);

  // scroll-depth tracking (25/50/75/100)
  useEffect(() => {
    const fired = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement;
      const pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark && !fired.has(mark)) { fired.add(mark); track("scroll_depth", { percent: mark }); }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = COPY[lang];
  const readyLine = lang === "es" ? "10 toolkits listos. Opera como un studio." : "10 toolkits ready. Operate like a studio.";

  return (
    <main>
      {/* S1 — persistent bar */}
      <div className="sticky top-0 z-50 bg-brand-gradient px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        {t.s1}
      </div>

      {/* header */}
      <header className={cn(CONTAINER, "flex items-center justify-between gap-4 px-[clamp(1.25rem,4vw,4rem)] py-4")}>
        <a href="#top" className="font-heading text-lg font-extrabold tracking-tight">
          better<span className="text-brand-primary">-</span>toolkits
        </a>
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleLang}
            data-event="lang_toggle"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            aria-label="Toggle language"
          >
            {t.nav.langOther}
          </button>
          <CtaLink href={LINKS.github} event="cta_github" variant="outline">{t.nav.install}</CtaLink>
        </nav>
      </header>

      {/* S2 — hero: the terminal is the thesis */}
      <Section id="top" className="relative overflow-hidden pb-[clamp(3rem,6vh,5rem)] pt-[clamp(1.5rem,4vh,3.5rem)] text-center">
        {/* brand glow field */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[6%] h-[55vh] w-[85vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.30),transparent_62%)] blur-2xl" />
          <div className="absolute right-[-12%] top-[28%] h-[45vh] w-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.16),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-[-18%] left-[-12%] h-[45vh] w-[45vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.14),transparent_60%)] blur-3xl" />
        </div>

        {/* Hero fills the viewport (minus sticky bar + header) so the next section never peeks in half-cut. */}
        <div className="relative flex min-h-[calc(100svh-8.5rem)] flex-col justify-center">
          {/* Full-bleed: the display headline escapes the content container so each sentence fits one line at display size. */}
          <h1 className="relative left-1/2 w-[94vw] -translate-x-1/2 font-heading font-extrabold leading-[1.08] tracking-tight text-[clamp(2.1rem,0.8rem+3.1vw,4.5rem)]">
            <span className="block text-foreground/85">{t.s2.h1a}</span>
            <span className="block bg-brand-gradient bg-clip-text text-transparent">{t.s2.h1b}</span>
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">{t.s2.source}</p>
          <p className="mx-auto mt-5 max-w-[58ch] text-[clamp(1rem,0.92rem+0.4vw,1.3rem)] leading-relaxed text-foreground/90">{t.s2.sub}</p>
          <div className="mx-auto mt-7 w-full max-w-[min(56rem,94vw)]">
            <HeroTerminal label={t.s2.copy} copied={t.s2.copied} readyLine={readyLine} />
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#stack"
              data-event="cta_learn_more"
              onClick={() => track("cta_learn_more")}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-9 py-4 text-base font-bold text-primary-foreground shadow-[0_10px_40px_-8px_rgba(124,92,255,0.65)] transition-transform hover:-translate-y-0.5 hover:bg-primary/90 sm:text-lg"
            >
              {t.s2.learnMore}
            </a>
            <CtaLink
              href={LINKS.github}
              event="cta_github"
              variant="outline"
              className="rounded-lg px-9 py-4 text-base font-bold sm:text-lg"
            >
              {t.s2.github}
            </CtaLink>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t.s2.audit}</p>
          <p className="mt-8 font-mono text-xs text-muted-foreground sm:text-sm">{t.s2.trust}</p>
        </div>
      </Section>

      {/* S3 — mantra 1 */}
      <div className="bg-brand-accent px-[clamp(1.25rem,4vw,4rem)] py-[clamp(3rem,7vh,5.5rem)] text-center text-white">
        <p className="mx-auto max-w-[38ch] font-heading font-bold leading-snug text-[clamp(1.5rem,1rem+1.8vw,3rem)]">
          {t.s3.a} <span className="underline decoration-white/50 underline-offset-4">{t.s3.b}</span>
        </p>
      </div>

      {/* S4 — problems / solutions: zigzag CARD // VISUAL rows with artifact illustrations */}
      <Section tone="light">
        <h2 className={H2}>{t.s4.title}</h2>
        <div className="mt-14 space-y-12 lg:space-y-16">
          {t.s4.pairs.map((p, i) => (
            <div key={i} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={cn(i % 2 === 1 && "lg:order-2")}>
                <p className="font-heading font-semibold leading-snug text-destructive text-[clamp(1.25rem,1rem+0.9vw,1.9rem)]">{p.problem}</p>
                <p className="mt-5 text-[clamp(1rem,0.95rem+0.3vw,1.2rem)] leading-relaxed text-card-foreground">
                  <span className="font-heading font-bold text-primary">{t.s4.fixLead}</span>{" "}
                  <code className="font-mono font-semibold text-primary">{p.toolkit}</code>: {p.solution}
                </p>
              </div>
              <div className={cn(i % 2 === 1 && "lg:order-1")}>
                <S4Visual index={i} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* S5 — the stack, at a glance */}
      <Section id="stack">
        <h2 className={H2}>{t.s5.title}</h2>
        <div className="mt-10 hidden overflow-x-auto rounded-xl border border-border sm:block">
          <table className="w-full text-left text-sm lg:text-[15px]">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">{t.s5.cols.n}</th>
                <th className="px-5 py-3.5 font-semibold">{t.s5.cols.toolkit}</th>
                <th className="px-5 py-3.5 font-semibold">{t.s5.cols.what}</th>
                <th className="px-5 py-3.5 font-semibold">{t.s5.cols.license}</th>
                <th className="px-5 py-3.5 font-semibold">{t.s5.cols.status}</th>
              </tr>
            </thead>
            <tbody>
              {TOOLKITS.map((tk) => (
                <tr key={tk.dir} className="border-t border-border/60 transition-colors hover:bg-primary/5">
                  <td className="px-5 py-3.5 text-muted-foreground">{tk.n}</td>
                  <td className="px-5 py-3.5">
                    <a href={tk.githubUrl} target="_blank" rel="noreferrer" onClick={() => track("cta_github")}
                       className="font-mono text-[13px] font-semibold text-brand-primary hover:underline lg:text-sm">{tk.dir}</a>
                  </td>
                  <td className="px-5 py-3.5 text-foreground/90">{tk.oneLiner[lang]}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{tk.license}</td>
                  <td className="px-5 py-3.5"><span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">{tk.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* mobile cards */}
        <div className="mt-8 grid gap-3 sm:hidden">
          {TOOLKITS.map((tk) => (
            <a key={tk.dir} href={tk.githubUrl} target="_blank" rel="noreferrer" onClick={() => track("cta_github")}
               className="block rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[13px] font-semibold text-brand-primary">{tk.n}. {tk.dir}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{tk.license}</span>
              </div>
              <p className="mt-2 text-sm text-card-foreground">{tk.oneLiner[lang]}</p>
            </a>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#process" className="rounded-md border border-primary/60 px-4 py-2 text-sm font-semibold hover:bg-primary/10">{t.s5.jumpProcess}</a>
          <a href="#pricing" className="rounded-md border border-primary/60 px-4 py-2 text-sm font-semibold hover:bg-primary/10">{t.s5.jumpPricing}</a>
        </div>
      </Section>

      {/* S6 — mantra 2 */}
      <div className="bg-background px-[clamp(1.25rem,4vw,4rem)] py-[clamp(3rem,7vh,5.5rem)] text-center">
        <p className="mx-auto max-w-[38ch] font-heading font-bold leading-snug text-[clamp(1.5rem,1rem+1.8vw,3rem)]">
          {t.s6.a} <span className="text-brand-primary">{t.s6.b}</span>
        </p>
      </div>

      {/* S7 — process */}
      <Section id="process" tone="light">
        <h2 className={H2}>{t.s7.title}</h2>
        {/* One full-width row per step, stacked — the hero terminal already is the live demo. */}
        <ol className="mx-auto mt-12 max-w-[80rem] space-y-5">
          {t.s7.steps.map((s, i) => (
            <li key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:flex-row lg:items-center">
              <div className="flex shrink-0 items-center gap-3 lg:w-[24rem]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">{i + 1}</span>
                <div>
                  <span className="font-heading text-lg font-semibold text-card-foreground">{s.title}</span>
                  {s.note && <p className="text-sm text-muted-foreground">{s.note}</p>}
                </div>
              </div>
              <div className="terminal-dark min-w-0 flex-1 rounded-md p-3.5">
                <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed [overflow-wrap:anywhere]"><span className="select-none text-brand-tertiary">$ </span>{s.cmd}</code>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* S8 — pricing */}
      <Section id="pricing">
        <div className="mx-auto grid max-w-[80rem] gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="font-heading text-xl font-bold">{t.s8.col1.name}</h3>
            <p className="mt-3 font-heading font-extrabold text-brand-primary text-[clamp(3rem,2rem+2vw,4.5rem)]">{t.s8.col1.price}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-card-foreground/90">{t.s8.col1.body}</p>
          </div>
          <div className="rounded-xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent p-8">
            <h3 className="font-heading text-xl font-bold">{t.s8.col2.name}</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">{t.s8.col2.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <CtaLink href={LINKS.whatsapp} event="cta_whatsapp">{t.s8.col2.whatsapp}</CtaLink>
              <CtaLink href={LINKS.calendar} event="cta_calendar" variant="outline">{t.s8.col2.calendar}</CtaLink>
            </div>
          </div>
        </div>
      </Section>

      {/* S9 — social proof (cards-as-artifacts treatment) */}
      <Section tone="light">
        <h2 className={H2}>{t.s9.title}</h2>

        {/* stats: gradient numbers */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s) => (
            <div key={s.value} className="rounded-xl border border-border bg-card p-5 text-center transition-transform hover:-translate-y-0.5">
              <div className="bg-brand-gradient bg-clip-text font-heading font-extrabold text-transparent text-[clamp(1.75rem,1.2rem+1.4vw,3rem)]">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:text-[13px]">{s.label[lang]}</div>
            </div>
          ))}
        </div>

        {/* dogfooding: quiet one-liner — the claim doesn't need fake window chrome */}
        <p className="mx-auto mt-8 max-w-[70ch] text-center text-[15px] italic text-muted-foreground">
          {t.s9.dogfooding}{" "}
          <a href={LINKS.betterMicroservices} target="_blank" rel="noreferrer" onClick={() => track("cta_github")}
             className="font-medium not-italic text-primary hover:underline">{t.s9.sibling}</a>
        </p>

        {/* ventures: window-chrome chips with LIVE badge */}
        <div className="mt-12 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.s9.venturesLabel}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {VENTURES.map((v) => (
              <div key={v} className="overflow-hidden rounded-lg border border-border bg-card text-left transition-transform hover:-translate-y-0.5">
                <div className="flex items-center gap-1 border-b border-border/60 bg-muted/40 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive/70" />
                  <span className="h-2 w-2 rounded-full bg-warning/70" />
                  <span className="h-2 w-2 rounded-full bg-success/70" />
                  <span className="ml-auto rounded-full bg-success/15 px-1.5 py-px font-mono text-[9px] font-semibold uppercase text-success">live</span>
                </div>
                <div className="px-3 py-2.5 font-heading text-sm font-bold text-card-foreground">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* methodology bento: one accent per discipline */}
        <div className="mt-14">
          <p className="mx-auto max-w-[70ch] text-center text-[clamp(1rem,0.9rem+0.4vw,1.25rem)] font-medium text-card-foreground">{t.s9.methodTagline}</p>
          {/* Bento: spans tile the 6-col grid exactly — the 10-framework card anchors 2 rows. */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
            {METHOD_GROUPS.map((g, gi) => {
              // Brand accents re-tuned for contrast on the light surface (same
              // treatment as the canonical light theme: darker, same hues).
              const accents = ["#6D4AF5", "#2563EB", "#0E93B5", "#DB2777", "#0F9D6B", "#D97706"];
              const spans = ["lg:col-span-3 lg:row-span-2", "lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];
              const accent = accents[gi % accents.length];
              return (
                <div
                  key={g.label.en}
                  className={cn("rounded-xl border bg-card p-6 transition-transform hover:-translate-y-1", spans[gi % spans.length])}
                  style={{ borderColor: `${accent}55`, boxShadow: `inset 0 3px 0 0 ${accent}` }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-heading text-sm font-bold" style={{ color: accent }}>{g.label[lang]}</h4>
                    <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ backgroundColor: `${accent}1f`, color: accent }}>
                      {g.items.length}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {g.items.map((it) => (
                      <li key={it} className="text-[13px] leading-snug text-card-foreground/90">
                        <span className="select-none" style={{ color: accent }}>· </span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* S10 — FAQ */}
      <Section tone="light">
        <h2 className={H2}>{t.s10.title}</h2>
        {/* Masonry, answers always visible — reading a FAQ must not cost a click. */}
        <div className="mt-10 columns-1 gap-5 md:columns-2 xl:columns-3">
          {t.s10.faqs.map((f, i) => (
            <div key={i} className="mb-5 break-inside-avoid rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading text-base font-semibold text-primary">{f.q}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-card-foreground/90">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* S11 — final CTA */}
      <Section className="relative overflow-hidden text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.18),transparent_62%)] blur-2xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-[26ch] font-heading font-extrabold leading-tight text-[clamp(2rem,1.2rem+2.4vw,4rem)]">{t.s11.h2}</h2>
          <p className="mt-4 text-[clamp(1.05rem,0.95rem+0.4vw,1.35rem)] text-foreground/90">{t.s11.sub}</p>
          <div className="mx-auto mt-9 max-w-[min(48rem,92vw)]"><Terminal cmd={MARKETPLACE_ADD} label={t.s11.copy} copied={t.s2.copied} /></div>
          <p className="mt-5 text-sm text-muted-foreground">{t.s11.guarantee}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">{t.s11.studioPrompt}</span>
            <CtaLink href={LINKS.whatsapp} event="cta_whatsapp">{t.s11.whatsapp}</CtaLink>
            <CtaLink href={LINKS.calendar} event="cta_calendar" variant="outline">{t.s11.calendar}</CtaLink>
          </div>
        </div>
      </Section>

      {/* S12 — footer */}
      <footer className="border-t border-border bg-background px-[clamp(1.25rem,4vw,4rem)] py-10">
        <div className={cn(CONTAINER, "flex flex-col items-center gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left")}>
          <div className="font-heading font-extrabold text-foreground">better<span className="text-brand-primary">-</span>toolkits</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
            <a href={LINKS.betterMicroservices} target="_blank" rel="noreferrer" className="hover:text-foreground">better-microservices</a>
            <a href={LINKS.support} className="hover:text-foreground">support@chimeranext.dev</a>
            <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" onClick={() => track("cta_whatsapp")} className="hover:text-foreground">WhatsApp</a>
          </nav>
        </div>
        <div className={cn(CONTAINER, "mt-6 text-center text-xs text-muted-foreground sm:text-left")}>
          {t.s12.license} · {t.s12.rights}
        </div>
      </footer>
    </main>
  );
}
