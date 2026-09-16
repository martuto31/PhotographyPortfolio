// Every way to reach Viktoria, in one place.
//
// The phone number is deliberately absent. It was removed from the whole site —
// display text, tel: links, Viber, the LocalBusiness JSON-LD and the meta
// descriptions — so it should not reappear here. Viber is gone with it: its deep
// link is built from the number, so keeping Viber would have left the number in
// the page source and shown it the moment anyone tapped.
//
// Messenger and Instagram replace it. Both open a conversation in one tap without
// exposing a number, and in Bulgaria they are the two channels people actually use
// after a phone call. Email stays for corporate and more formal enquiries.
//
// If the number is ever restored, add it back here first — the nav, hero, footer,
// contact page, mobile bar, legal pages and JSON-LD all read from this file, so
// nothing needs to be hunted down twice.

export const CONTACT = {
  // m.me is Messenger's canonical short link. The id is the Facebook profile id
  // that `facebook` below already points at; m.me redirects it to the page inbox.
  messengerHref: 'https://m.me/100076542123196',

  // ig.me/m/<handle> opens a direct message thread. Plain instagram.com/<handle>
  // only opens the profile, which is a different (and slower) action.
  instagramDmHref: 'https://ig.me/m/_phbyviki',
  instagramHandle: '@_phbyviki',

  email: 'phbyviki@gmail.com',
  emailHref: 'mailto:phbyviki@gmail.com',

  // ЗЕТ чл. 4: anyone providing services online has to publish a name and a
  // contact address. Rendered on both legal pages; the name also signs the
  // footer. The address was taken out of the footer on 2026-09-13 at Martin's
  // request ("for now"). Supplied by Martin, 2026-09-11.
  legalName: 'Виктория Борисова',
  address: 'ж.к. Александър Стамболийски 1, Видин',

  instagram: 'https://www.instagram.com/_phbyviki',
  facebook: 'https://www.facebook.com/people/phbyviki/100076542123196/',

  responseTime: 'до 24 часа',
  areas: 'София · Видин',
} as const;

// Above-the-fold credibility line. "4+" is the "над четири години" in her own
// about-me copy. "100+" is the count of events shot that Martin gave on
// 2026-09-16 (it was 150+ from 2026-09-11) — the site shows 31 galleries
// because most clients never publish theirs, so this one figure is theirs to
// stand behind, not derivable from the site.
export const CREDENTIALS = [
  { value: '4+', label: 'години зад обектива' },
  { value: '100+', label: 'заснети събития' },
  { value: '24ч', label: 'отговор на запитване' },
] as const;
