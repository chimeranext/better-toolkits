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
    <div className="w-full overflow-hidden rounded-lg border border-border bg-[#0b0912] shadow-lg">
      <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-destructive/80" />
        <span className="h-3 w-3 rounded-full bg-warning/80" />
        <span className="h-3 w-3 rounded-full bg-success/80" />
      </div>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <code className="whitespace-nowrap font-mono text-sm text-foreground">
            <span className="select-none text-brand-tertiary">$ </span>
            {cmd}
          </code>
        </div>
        <CopyButton text={cmd} label={label} copied={copied} />
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

function Section({ id, tone = "dark", className, children }: { id?: string; tone?: "dark" | "light"; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn(tone === "light" ? "surface-light" : "bg-background", "px-5 py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
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

  return (
    <main>
      {/* S1 — persistent bar */}
      <div className="sticky top-0 z-50 bg-brand-gradient px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        {t.s1}
      </div>

      {/* header */}
      <header className="flex items-center justify-between gap-4 px-5 py-4">
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

      {/* S2 — hero */}
      <Section id="top" className="pt-8 text-center">
        <h1 className="mx-auto max-w-3xl font-heading text-3xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-muted-foreground">{t.s2.h1a}</span>{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">{t.s2.h1b}</span>
        </h1>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{t.s2.source}</p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/90">{t.s2.sub}</p>
        <div className="mx-auto mt-8 max-w-2xl">
          <Terminal cmd={MARKETPLACE_ADD} label={t.s2.copy} copied={t.s2.copied} />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <CtaLink href={LINKS.github} event="cta_github" variant="ghost">{t.s2.github}</CtaLink>
          <span className="text-muted-foreground">· {t.s2.audit}</span>
        </div>
        <p className="mt-8 font-mono text-xs text-muted-foreground sm:text-sm">{t.s2.trust}</p>
      </Section>

      {/* S3 — mantra 1 */}
      <div className="bg-brand-accent px-5 py-12 text-center text-white">
        <p className="mx-auto max-w-3xl font-heading text-2xl font-bold sm:text-3xl">
          {t.s3.a} <span className="underline decoration-white/50 underline-offset-4">{t.s3.b}</span>
        </p>
      </div>

      {/* S4 — problems / solutions */}
      <Section tone="light">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">{t.s4.title}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.s4.pairs.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <p className="text-[15px] font-medium text-destructive">{p.problem}</p>
              <p className="mt-3 text-[15px] text-card-foreground">
                <span className="select-none text-brand-primary">→ </span>
                <code className="font-mono text-sm font-semibold text-brand-primary">{p.toolkit}</code>: {p.solution}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* S5 — the stack, at a glance */}
      <Section id="stack">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">{t.s5.title}</h2>
        <div className="mt-8 hidden overflow-x-auto rounded-lg border border-border sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.s5.cols.n}</th>
                <th className="px-4 py-3 font-semibold">{t.s5.cols.toolkit}</th>
                <th className="px-4 py-3 font-semibold">{t.s5.cols.what}</th>
                <th className="px-4 py-3 font-semibold">{t.s5.cols.license}</th>
                <th className="px-4 py-3 font-semibold">{t.s5.cols.status}</th>
              </tr>
            </thead>
            <tbody>
              {TOOLKITS.map((tk) => (
                <tr key={tk.dir} className="border-t border-border/60">
                  <td className="px-4 py-3 text-muted-foreground">{tk.n}</td>
                  <td className="px-4 py-3">
                    <a href={tk.githubUrl} target="_blank" rel="noreferrer" onClick={() => track("cta_github")}
                       className="font-mono text-[13px] font-semibold text-brand-primary hover:underline">{tk.dir}</a>
                  </td>
                  <td className="px-4 py-3 text-foreground/90">{tk.oneLiner[lang]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tk.license}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">{tk.status}</span></td>
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
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#process" className="rounded-md border border-primary/60 px-4 py-2 text-sm font-semibold hover:bg-primary/10">{t.s5.jumpProcess}</a>
          <a href="#pricing" className="rounded-md border border-primary/60 px-4 py-2 text-sm font-semibold hover:bg-primary/10">{t.s5.jumpPricing}</a>
        </div>
      </Section>

      {/* S6 — mantra 2 */}
      <div className="bg-background px-5 py-12 text-center">
        <p className="mx-auto max-w-3xl font-heading text-2xl font-bold sm:text-3xl">
          {t.s6.a} <span className="text-brand-primary">{t.s6.b}</span>
        </p>
      </div>

      {/* S7 — process */}
      <Section id="process" tone="light">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">{t.s7.title}</h2>
        <ol className="mt-10 space-y-4">
          {t.s7.steps.map((s, i) => (
            <li key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                <span className="font-heading font-semibold text-card-foreground">{s.title}</span>
                {s.note && <span className="text-xs text-muted-foreground">— {s.note}</span>}
              </div>
              <div className="mt-3 overflow-x-auto rounded-md bg-[#0b0912] p-3">
                <code className="whitespace-nowrap font-mono text-sm text-foreground"><span className="select-none text-brand-tertiary">$ </span>{s.cmd}</code>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-[#0b0912] text-sm text-muted-foreground">
          {/* TODO: replace with real asciinema/GIF terminal demo */}
          ▶ {t.s7.demo}
        </div>
      </Section>

      {/* S8 — pricing */}
      <Section id="pricing">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-7">
            <h3 className="font-heading text-lg font-bold">{t.s8.col1.name}</h3>
            <p className="mt-2 font-heading text-5xl font-extrabold text-brand-primary">{t.s8.col1.price}</p>
            <p className="mt-4 text-sm text-card-foreground/90">{t.s8.col1.body}</p>
            <div className="mt-6"><Terminal cmd={MARKETPLACE_ADD} label={t.s2.copy} copied={t.s2.copied} /></div>
          </div>
          <div className="rounded-xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent p-7">
            <h3 className="font-heading text-lg font-bold">{t.s8.col2.name}</h3>
            <p className="mt-4 text-sm text-foreground/90">{t.s8.col2.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <CtaLink href={LINKS.whatsapp} event="cta_whatsapp">{t.s8.col2.whatsapp}</CtaLink>
              <CtaLink href={LINKS.calendar} event="cta_calendar" variant="outline">{t.s8.col2.calendar}</CtaLink>
            </div>
          </div>
        </div>
      </Section>

      {/* S9 — social proof */}
      <Section tone="light">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">{t.s9.title}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s) => (
            <div key={s.value} className="rounded-lg border border-border bg-card p-4 text-center">
              <div className="font-heading text-2xl font-extrabold text-brand-primary">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label[lang]}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-sm text-card-foreground">
            {t.s9.dogfooding}{" "}
            <a href={LINKS.betterMicroservices} target="_blank" rel="noreferrer" onClick={() => track("cta_github")}
               className="font-medium text-brand-primary hover:underline">{t.s9.sibling}</a>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.s9.venturesLabel}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {VENTURES.map((v) => (
              <span key={v} className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-card-foreground">{v}</span>
            ))}
          </div>
        </div>

        {/* methodology grid */}
        <div className="mt-12">
          <p className="mx-auto max-w-3xl text-center text-sm text-card-foreground/90">{t.s9.methodTagline}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {METHOD_GROUPS.map((g) => (
              <div key={g.label.en} className="rounded-lg border border-border bg-card p-5">
                <h4 className="font-heading text-sm font-bold text-brand-primary">{g.label[lang]}</h4>
                <ul className="mt-3 space-y-1.5">
                  {g.items.map((it) => (
                    <li key={it} className="text-[13px] leading-snug text-card-foreground/90">
                      <span className="select-none text-brand-accent">· </span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* S10 — FAQ */}
      <Section tone="light">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">{t.s10.title}</h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {t.s10.faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-lg border border-border bg-card p-4"
              onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) track("faq_expand", { question: f.q }); }}
            >
              <summary className="cursor-pointer list-none font-heading text-[15px] font-semibold text-card-foreground marker:content-none">
                <span className="select-none text-brand-primary group-open:hidden">+ </span>
                <span className="hidden select-none text-brand-primary group-open:inline">− </span>
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-card-foreground/90">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* S11 — final CTA */}
      <Section className="text-center">
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold sm:text-4xl">{t.s11.h2}</h2>
        <p className="mt-3 text-lg text-foreground/90">{t.s11.sub}</p>
        <div className="mx-auto mt-8 max-w-2xl"><Terminal cmd={MARKETPLACE_ADD} label={t.s11.copy} copied={t.s2.copied} /></div>
        <p className="mt-5 text-sm text-muted-foreground">{t.s11.guarantee}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">{t.s11.studioPrompt}</span>
          <CtaLink href={LINKS.whatsapp} event="cta_whatsapp">{t.s11.whatsapp}</CtaLink>
          <CtaLink href={LINKS.calendar} event="cta_calendar" variant="outline">{t.s11.calendar}</CtaLink>
        </div>
      </Section>

      {/* S12 — footer */}
      <footer className="border-t border-border bg-background px-5 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <div className="font-heading font-extrabold text-foreground">better<span className="text-brand-primary">-</span>toolkits</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
            <a href={LINKS.betterMicroservices} target="_blank" rel="noreferrer" className="hover:text-foreground">better-microservices</a>
            <a href={LINKS.support} className="hover:text-foreground">support@chimeranext.dev</a>
            <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" onClick={() => track("cta_whatsapp")} className="hover:text-foreground">WhatsApp</a>
          </nav>
        </div>
        <div className="mx-auto mt-6 w-full max-w-5xl text-center text-xs text-muted-foreground sm:text-left">
          {t.s12.license} · {t.s12.rights}
        </div>
      </footer>
    </main>
  );
}
