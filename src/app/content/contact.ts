// Every way to reach Viktoria, in one place.
//
// Before this file the phone number existed only inside the LocalBusiness JSON-LD
// in index.html — the schema advertised a number no visitor could see or tap. The
// nav, hero, footer, contact page and mobile call bar all read from here now, so
// the number can never be right in one place and stale in another.

export const CONTACT = {
  // E.164 for tel:/schema, spaced for display. Bulgarian mobile convention is
  // 0895 318 622 locally; the leading +359 only belongs in the href.
  phoneE164: '+359895318622',
  phoneHref: 'tel:+359895318622',
  phoneDisplay: '0895 318 622',

  // Viber is how most Bulgarian clients actually open a conversation. The number
  // must be percent-encoded — a bare "+" in a query string reads as a space.
  viberHref: 'viber://chat?number=%2B359895318622',

  email: 'phbyviki@gmail.com',
  emailHref: 'mailto:phbyviki@gmail.com',

  instagram: 'https://www.instagram.com/_phbyviki',
  facebook: 'https://www.facebook.com/people/phbyviki/100076542123196/',

  responseTime: 'до 24 часа',
  areas: 'София · Видин · цяла България',
} as const;

// Above-the-fold credibility line. Every figure here is verifiable from the site
// itself — 31 published galleries and the "над четири години" in her own about-me
// copy. Nothing is rounded up.
export const CREDENTIALS = [
  { value: '4+', label: 'години зад обектива' },
  { value: '30+', label: 'заснети събития' },
  { value: '24ч', label: 'отговор на запитване' },
] as const;
