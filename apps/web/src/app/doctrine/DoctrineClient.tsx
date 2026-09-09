"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { COPY, LINKS, type Lang } from "@/lib/copy";
import { DOCTRINE } from "@/lib/doctrine";

const CONTAINER = "mx-auto w-full max-w-[min(48rem,94vw)]";

export default function DoctrineClient() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("bt-lang");
    if (stored === "en" || stored === "es") setLang(stored);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "es" : "en";
      window.localStorage.setItem("bt-lang", next);
      track("lang_toggle", { lang: next });
      return next;
    });
  }, []);

  const t = DOCTRINE[lang];
  const nav = COPY[lang].nav;

  return (
    <main>
      <div className="sticky top-0 z-50 bg-brand-gradient px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        {COPY[lang].s1}
      </div>

      <header className={cn(CONTAINER, "flex items-center justify-between gap-4 px-[clamp(1.25rem,4vw,4rem)] py-4")}>
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight">
          better<span className="text-brand-primary">-</span>toolkits
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t.back}
          </Link>
          <button
            type="button"
            onClick={toggleLang}
            data-event="lang_toggle"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            aria-label="Toggle language"
          >
            {nav.langOther}
          </button>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("cta_github")}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            {nav.install}
          </a>
        </nav>
      </header>

      <article className={cn(CONTAINER, "px-[clamp(1.25rem,4vw,4rem)] pb-20 pt-8")}>
        <p className="text-xs uppercase tracking-[0.18em] text-brand-primary">{t.pageEyebrow}</p>
        <h1 className="mt-3 font-heading text-[clamp(2rem,1.2rem+2.5vw,3.25rem)] font-extrabold leading-tight tracking-tight">
          {t.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">{t.subtitle}</p>
        <p className="mt-5 rounded-xl border border-primary/30 bg-card px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-primary">
            {lang === "es" ? "Main selling point — stderr baseline. " : "Main selling point — stderr baseline. "}
          </span>
          {lang === "es"
            ? "On by default en cada toolkit. Instalación Claude / Cursor / OpenCode2 en el README del monorepo. HITL es el otro pilar (docs/hitl.md)."
            : "On by default in every toolkit. Claude / Cursor / OpenCode2 install steps live in the monorepo README. HITL is the other pillar (docs/hitl.md)."}
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">{t.sourceNote}</p>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.pillarsTitle}</h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-card text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{lang === "es" ? "Pilar" : "Pillar"}</th>
                  <th className="px-4 py-3 font-medium">Doc</th>
                  <th className="px-4 py-3 font-medium">{lang === "es" ? "Propósito" : "Purpose"}</th>
                </tr>
              </thead>
              <tbody>
                {t.pillars.map((row) => (
                  <tr key={row.name} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-primary">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs leading-relaxed">{row.doc}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.hitlTitle}</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-foreground/90">
            {t.hitlRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.hitlSurfacesTitle}</h2>
          <ul className="mt-4 space-y-3">
            {t.hitlSurfaces.map((row) => (
              <li key={row.harness} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="font-semibold text-primary">{row.harness}</div>
                <div className="mt-1 font-mono text-xs leading-relaxed text-foreground/85">{row.wire}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.ssotTitle}</h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-card text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">SSOT</th>
                  <th className="px-4 py-3 font-medium">{lang === "es" ? "Ubicación" : "Location"}</th>
                  <th className="px-4 py-3 font-medium">{lang === "es" ? "Propósito" : "Purpose"}</th>
                </tr>
              </thead>
              <tbody>
                {t.ssotRows.map((row) => (
                  <tr key={row.name} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-primary">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs leading-relaxed">{row.location}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.protocolTitle}</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-foreground/90">
            {t.protocolRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.runtimeTitle}</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-foreground/90">
            {t.runtimeRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.harnessTitle}</h2>
          <ul className="mt-4 space-y-3">
            {t.harnessRows.map((row) => (
              <li key={row.harness} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="font-semibold text-primary">{row.harness}</div>
                <div className="mt-1 font-mono text-xs leading-relaxed text-foreground/85">{row.wire}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.pilotTitle}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">{t.pilotBody}</p>
        </section>

        <p className="mt-14 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {t.domainNote}
        </p>
      </article>

      <footer className="border-t border-border bg-background px-[clamp(1.25rem,4vw,4rem)] py-10">
        <div className={cn(CONTAINER, "flex flex-col items-center gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left")}>
          <Link href="/" className="font-heading font-extrabold text-foreground">
            better<span className="text-brand-primary">-</span>toolkits
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/doctrine/" className="hover:text-foreground">
              {nav.doctrine}
            </Link>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
            <a href={LINKS.support} className="hover:text-foreground">
              support@chimeranext.dev
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
