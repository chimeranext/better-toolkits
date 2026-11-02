"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Architectural-blueprint entrance + scroll animations for the landing site.
 * Everything is gated behind `gsap.matchMedia().(prefers-reduced-motion:
 * no-preference)` — reduced-motion users get static, fully-visible content.
 */
export default function BlueprintMotion() {
  useEffect(() => {
    const mq = gsap.matchMedia();

    mq.add("(prefers-reduced-motion: no-preference)", () => {
      // Blueprint grid overlay fades in on load (hero + final CTA).
      gsap.to(".bp-grid", { opacity: 1, duration: 1.4, ease: "power2.out" });

      // Hero terminal panel entrance.
      gsap.fromTo(
        "#top .terminal-dark",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.25, ease: "power3.out" },
      );

      // Hero install lines — staggered reveal.
      gsap.fromTo(
        "#top .hero-line",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.7, stagger: 0.18, ease: "power2.out" },
      );

      // Section headings: slide in + draw their gold underline.
      gsap.utils.toArray<HTMLElement>(".bp-heading").forEach((el) => {
        const line = el.querySelector<HTMLElement>(".bp-heading-line");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
        tl.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        if (line) {
          tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.35");
        }
      });

      // Stats cards — staggered reveal.
      gsap.fromTo(
        "[data-bp-stats] > *",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-bp-stats]", start: "top 82%" },
        },
      );

      // Bento cards — staggered reveal with a hint of scale.
      gsap.fromTo(
        "[data-bp-bento] > *",
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-bp-bento]", start: "top 80%" },
        },
      );

      // Process steps — slide in from the left.
      gsap.fromTo(
        "[data-bp-steps] > *",
        { opacity: 0, x: -18 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-bp-steps]", start: "top 82%" },
        },
      );

      // FAQ cards — staggered reveal.
      gsap.fromTo(
        "[data-bp-faq] > *",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-bp-faq]", start: "top 85%" },
        },
      );
    });

    return () => mq.revert();
  }, []);

  return null;
}
