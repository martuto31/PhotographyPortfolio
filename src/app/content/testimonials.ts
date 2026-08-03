// Client testimonials.
//
// ─────────────────────────────────────────────────────────────────────────────
//  THIS LIST SHIPS EMPTY ON PURPOSE. Fill it with real messages from real clients.
// ─────────────────────────────────────────────────────────────────────────────
//
// The section renders only when there is at least one entry, so an empty array is
// safe to deploy — the homepage simply skips it. Nothing is invented here, and
// nothing invented should be added: publishing testimonials from people who were
// never clients is prohibited under the EU Unfair Commercial Practices Directive
// (transposed in Bulgaria as ЗЗП), and Google treats fabricated reviews as spam.
//
// A friend's review is fine — as long as the friend was actually photographed.
// The test is whether the event happened, not how you know the person.
//
// HOW TO ADD ONE
//   1. Ask the client for permission to publish. Messenger/Viber is enough.
//   2. Paste their words. Light edits for typos are fine; do not rewrite the voice
//      or the praise.
//   3. Attribute honestly: real first name, and the event/place if they agree.
//   4. `gallery` is optional — a slug like 'svatbi/Лора и Асен' turns the quote
//      into a link to that couple's gallery, which is the strongest form of proof
//      because the reader can go and look.
//
// NOTE ON STARS IN GOOGLE: none of this produces star ratings in search results.
// Google has not shown review rich results for a business's own site since 2019
// (self-serving reviews). Stars come from the Google Business Profile — see the
// GBP setup notes. This section exists to convince humans who are already here.

export interface Testimonial {
  /** The client's words, lightly edited at most. */
  quote: string;
  /** Real first name, or first name + initial. */
  name: string;
  /** Optional context: 'Сватба, Видин · юли 2025' */
  context?: string;
  /** Optional '<slug>/<gallery name>' — renders a link to their gallery. */
  gallery?: string;
}

export const TESTIMONIALS: Testimonial[] = [];
