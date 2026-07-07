// Lightweight event stub. Real instrumentation (GA4 / PostHog / Meta Pixel / UTM)
// is wired later via the aaarrr-flywheel-toolkit `/landing-instrument` command
// (a separate openspec change). Until then, events are:
//   1. exposed as `data-event` attributes on the DOM (queryable / instrumentable), and
//   2. pushed to window.dataLayer if a tag manager is present.
export type LandingEvent =
  | "copy_command"
  | "cta_whatsapp"
  | "cta_calendar"
  | "cta_github"
  | "scroll_depth"
  | "faq_expand"
  | "lang_toggle";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: LandingEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...props });
}
