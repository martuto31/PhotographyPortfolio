# Backlinks and listings for phbyviki.com — October 2026

Researched 2026-10-06. Nothing was signed up for or submitted.

**Why this matters:** Search Console showed 4 of 33 sitemap URLs indexed (2026-09-22). Links from
other sites help Google find the gallery pages and decide they are worth indexing. The best links
point straight at a gallery page, not only at the homepage.

**Which pages links can point to today:** every wedding gallery is still hidden on the live site
until the couples agree (`hidden-galleries.json` → `liveSiteOnly: Weddings`), and the live sitemap
has no wedding gallery URLs. For now, use these as link targets:
`/galerii/abiturienti` and its 13 prom galleries, `/galerii/krushteneta`, `/galerii/semeyni`,
`/galerii/rojdeni-dni` and `/galerii/lichni`. Wedding galleries can be link targets once the couples
have agreed.

**How I checked:**
- I opened every site listed.
- "Do-follow" means a plain `<a href>` with no `nofollow`, `ugc` or `sponsored` on it. I read this
  from the raw HTML of a live profile on each site. Where I could not check it, the table says so.
- "Rank" is the site's global Tranco popularity rank on 2026-10-06 (lower means more visitors). It
  is only a rough guide: Bulgarian sites rank low by default.
- **I** is impact and **E** is effort, both scored 1–5. Impact means a link that counts, local or
  wedding relevance, and leads. Effort means time, money and anything blocking it. **Score = I ÷ E.**

## Ranked table

**0. Not ranked:** Google Business Profile ([rules](https://support.google.com/business/answer/9157481)).
It is already in TASKS.md and does the most for local search. Bing Places can import it.
A business with no storefront has to hide its address. It can list up to 20 service areas, all
within roughly 2 hours' drive of its base. Sofia to Vidin is further than that (about 3 hours by
road, my estimate), so one profile cannot honestly cover both cities. Pick one base city.

| # | Where | Cost | Link to phbyviki.com | Signal | What the profile needs | I | E | Score |
|---|---|---|---|---|---|---|---|---|
| 1 | **MyWed**, wedding photographer catalogue ([Vidin page](https://mywed.com/en/Bulgaria/Vidin-wedding-photographers/), [Bulgaria](https://mywed.com/en/Bulgaria-wedding-photographers/), [PRO](https://mywed.com/en/pro/)) | Free. PRO is optional; the PRO page shows no price | **Do-follow.** Checked on a free account (`hasPro:false`): plain link with `itemprop="sameAs"` | Rank 37,682. 100+ Bulgarian photographers, but the **Vidin page lists only 1** | Photos approved by MyWed's editors (free accounts upload 2 photos/week and 1 series/month), bio, city, hourly rate | 4 | 2 | **2.0** |
| 2 | **Venues she has shot at**, starting with **Hotel Skalite, Belogradchik** ([wedding page](https://skalite.bg/?page_id=5763), [site](https://skalite.bg/)) | Free (we give them photos) | Not there yet. The page names no vendors and has no outbound links. A credit link would point straight at a gallery | Very relevant (Northwest wedding venue). The page says the hotel will *„препоръчат фотограф"* | Photos of the venue itself plus a credit line. First check with Viki which galleries were shot there | 4 | 2 | **2.0** |
| 3 | **Start.bg**, "Предложи линк" form on [fotostudia.start.bg](https://fotostudia.start.bg/) (section "Сватбени фотографи") and [vidin.start.bg](https://vidin.start.bg/) (section "Снимки и видео от Видин") | Free, checked by a moderator. VIP link: [10.23 EUR/month](https://start.bg/vip/) | Goes through Start.bg's own redirect (`link.php?id=` → 302). Google can still follow it to the site; it counts for less than a direct link | Rank 280,081. Old, much-crawled Bulgarian link directory | Title of 60 characters or less, description of 90 or less | 2 | 1 | **2.0** |
| 4 | **Bing Places** ([sign-up](https://www.bing.com/forbusiness/); [how-to](https://fitsmallbusiness.com/bing-for-business/)) | Free | Business listing, not a backlink | Bing search and maps | Import from a verified Google profile (verified automatically, address can be hidden) | 2 | 1 | **2.0** |
| 5 | **Local media pitch (free):** [Danube Bridges](https://danubebridge2.com/), [Vidin TV](https://www.vidin.tv/), [Radio Vidin / BNR](https://bnrnews.bg/vidin/post/538238/snimkata-na-6-oktomvri-2026-godina), [Vidin Vest](http://vidinvest.com/kontakti/) | Free if they run it as a story | Not guaranteed. Radio Vidin credits photos as plain text ("СНИМКА: https://…") | BNR rank 57,821, vidin.tv about 1.5M. The 2026 prom articles on [Danube Bridges](https://danubebridge2.com/2026/05/15/%D0%B0%D0%B1%D0%B8%D1%82%D1%83%D1%80%D0%B8%D0%B5%D0%BD%D1%82%D0%B8%D1%82%D0%B5-%D0%BE%D1%82-%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B0%D1%82%D0%B0/) and [Vidin TV](https://www.vidin.tv/?p=18217) credit no photographer | A story angle, a short bio, 5 photos | 3 | 2 | **1.5** |
| 6 | **Credit swaps with vendors she has worked with** (make-up, hair, dresses, florists, DJs) | Free | Do-follow if their site links to the gallery. Instagram links don't count | Each one is small, but relevant and local | A "Грим: X" line on the gallery (small site change) and a link back from them | 3 | 2 | **1.5** |
| 7 | **Boho Weddings**, real-wedding feature ([rules](https://www.boho-weddings.com/submit/); [example Bulgarian wedding](https://www.boho-weddings.com/205728/rainy-outdoor-party-wedding-all-planned-in-5-months/)) | Free | **Do-follow** credit (checked: `rel="noopener noreferrer"` only) | Rank 452,987. Has already featured a Bulgarian wedding | About 50 photos to pitch, about 100 for the final post (1000–2000 px). Must not have run on another UK blog, and they ask for 6 weeks before it goes anywhere else. Style: boho, rustic, outdoor or destination, so the Belogradchik rock weddings fit. **Needs the couple's consent** | 4 | 3 | 1.33 |
| 8 | **Shooty.bg** ([Vidin page](https://shooty.bg/listing-service-areas/%D0%B2%D0%B8%D0%B4%D0%B8%D0%BD/), [terms](https://shooty.bg/kak-da-stanete-partnor-v-shooty-bg/)) | Free, plus 15% of each booking. Premium 19 EUR/month; Premium Pro 39 EUR/month (9% fee) | None (checked a listing) | Its Vidin page was the first result for „фотограф Видин" in my search, and it lists **no photographer based in Vidin** (only Sofia and Vratsa) | Packages **with prices**, a calendar, portfolio. Blocked until prices are set | 3 | 3 | 1.0 |
| 9 | **Fearless Photographers** ([membership](https://www.fearlessphotographers.com/about-fearless-photographers.cfm), [Bulgaria](https://www.fearlessphotographers.com/location/147/photographers-bulgaria)) | $99/year | Links to the website and social profiles (stated on the site; I didn't check the HTML) | Rank 274,276. 28 Bulgarian members, none in Vidin | Application | 3 | 3 | 1.0 |
| 10 | **WeddingDay.bg** ([photographers](https://www.weddingday.bg/categoriesbg/6), [sign-up](https://www.weddingday.bg/register), [ads](https://www.weddingday.bg/infobg/30)) | Free account. Banners 10–160 EUR/month | **None.** I checked 2 profiles: no website link at all | Rank about 4.1M. Vidin is in its city filter | Text and photos. Brings leads and a mention of the business, not a link | 2 | 2 | 1.0 |
| 11 | **Apple Business Connect** ([availability](https://support.apple.com/guide/business/feature-availability-axmef1c47twq/web)) | Free | Apple Maps listing | Bulgaria has "Brand and Location Management" | Same name, phone and website as the Google profile, plus photos | 2 | 2 | 1.0 |
| 12 | **Pinterest** business account with the website claimed ([how](https://help.pinterest.com/en/business/article/claim-your-website)) | Free | Every pin links to a gallery (I didn't check whether Pinterest marks these nofollow) | Rank 53. Gets images found | One board per service and one pin per gallery. Claiming needs a meta tag or DNS record (a site change) | 2 | 2 | 1.0 |
| 13 | **photo-forum.net**, Bulgarian photo community ([site](https://photo-forum.net/bg/)) | Free | Not checked: profiles load with JavaScript | Rank 189,773. About 151,000 members and 1.4M photos | Portfolio uploads | 2 | 2 | 1.0 |
| 14 | **SNAP.bg** ([wedding photographers](https://www.snap.bg/l.php?c=%D1%81%D0%B2%D0%B0%D1%82%D0%B1%D0%B5%D0%BD-%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84), [sign-up](https://www.snap.bg/registration.php?from=l)) | Free | **None** (no clickable website link on profiles) | About 520 wedding photographers. No Vidin city page (only "Друг град") | Email, phone, city, bio | 1 | 1 | 1.0 |
| 15 | **ibusiness.bg** ([Vidin photo studios](https://www.ibusiness.bg/bulgaria/vidin/%D0%BF%D0%BE%D1%82%D1%80%D0%B5%D0%B1%D0%B8%D1%82%D0%B5%D0%BB%D1%81%D0%BA%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8-1/%D1%84%D0%BE%D1%82%D0%BE-%D1%81%D1%82%D1%83%D0%B4%D0%B8%D0%BE-%D0%B2%D0%B8%D0%B4%D0%B8%D0%BD)) | Free | **nofollow** (checked) | Rank about 1.4M | Name, phone and website | 1 | 1 | 1.0 |
| 16 | **Bazar.bg** classifieds ([prom photographers](https://bazar.bg/obiavi/abiturientski-balove-fotografi)) | Free | None | Rank 20,057. 11–12 ads, none from Vidin | One ad each spring before prom season. Leads only | 1 | 1 | 1.0 |
| 17 | **A1 + НАПГ "Вечерта на успелите"**, a prom for young people from foster care, including Vidin graduates ([article](https://town.bg/12-abiturienti-ot-sofiya-vidin-kula-archar-i-botevgrad-otpraznuvaha-bal-organiziraha-a1-i-napg/)) | Her time (offer to shoot the June 2027 edition) | Press coverage could credit her. The 2026 coverage credits no photographer | Run 9 times since 2016 | Offer by email around spring 2027 | 3 | 4 | 0.75 |
| 18 | **Venue guide on her own site** ("Места за сватба и бал във Видин и Белоградчик"), then tell each venue it is there | Writing time | Venues tend to link to lists that feature them | Competitors do this, e.g. [nmitev.com](https://nmitev.com/blog/%D1%81%D0%BF%D0%B8%D1%81%D1%8A%D0%BA-%D1%81-%D1%80%D0%B5%D1%81%D1%82%D0%BE%D1%80%D0%B0%D0%BD%D1%82%D0%B8-%D0%B7%D0%B0-%D1%81%D0%B2%D0%B0%D1%82%D0%B1%D0%B0-%D0%B2-%D1%81%D0%BE%D1%84%D0%B8%D1%8F/) | A new page (site work) plus Viki's notes on each venue | 3 | 4 | 0.75 |
| 19 | **SvatbaTV.bg** ([photographers](https://svatbatv.bg/pages-427-svatbeni-fotografi), [stats](https://svatbatv.bg/statistics)) | Paid. The plans page returns 404; price on request | **Do-follow** (checked: `rel="sendclick"`, not nofollow) | Not in the top 1M. Only 1 photographer listed; 61,490 views in total on its stats page | Paid plan | 2 | 3 | 0.67 |
| 20 | **Vidin Vest paid article** ([rates](http://vidinvest.com/%d1%80%d0%b5%d0%ba%d0%bb%d0%b0%d0%bc%d0%bd%d0%b0-%d1%82%d0%b0%d1%80%d0%b8%d1%84%d0%b0-2019-%d0%bd%d0%b0-%d0%b2%d0%b8%d0%b4%d0%b8%d0%bd-%d0%b2%d0%b5%d1%81%d1%82/)) | Short post 30–50 EUR. Article 40–100 EUR. Interview 60–160 EUR (before VAT) | Google requires paid links to be marked `sponsored`, so this buys visibility, not authority | Not in the top 1M | Text and photos | 2 | 3 | 0.67 |
| 21 | **Junebug Weddings** ([guidelines](https://junebugweddings.com/submission-guidelines)) | Paid vendor membership only | Credit link | Rank 139,198 | Membership first | 3 | 5 | 0.6 |
| 22 | **e-vidin.com**, Vidin business directory ([photo studios](http://e-vidin.com/firmi/foto.html), [rates](https://www.e-vidin.com/abonament.html)) | Free entry. Paid: 60 лв/year standard, 120 лв/year extended | **None** on the free entry (name, address and phone only) | Not in the top 1M. Only registered, trading businesses can list. Run by Goldy Lux, a Vidin photo and ad agency, i.e. a competitor | Legal entity details | 1 | 2 | 0.5 |
| 23 | **business.bg** ([sign-up](https://www.business.bg/page/registration.html)) | Free; the link to your own site comes only with paid packages | None on the free profile | Rank 525,809 | Business details | 1 | 2 | 0.5 |
| 24 | **VisitVidin** ([rates](https://visitvidin.com/bg/reklama)) | 49 лв first year, 30 лв after that (Bulgarian only) | The listing has a website field | Private tourism site. Categories are hotels, sights and entertainment, so a photographer may not fit | Up to 3 photos and text | 1 | 2 | 0.5 |

## Do this week (top 5)

**1. MyWed profile** (Viki signs up; it takes about 15 minutes, then 2 photos a week)
- **Text:** a short bio, which MyWed shows in English:
  > Viktoria Borisova (phbyviki) photographs weddings, proms, christenings, birthdays and family
  > sessions in Sofia and Vidin, Bulgaria. 4+ years, 100+ events. You celebrate, I photograph.
- Set the website to `https://phbyviki.com` and the city to Vidin. Sofia's page is crowded; Vidin's
  lists only 1 photographer.
- **Photos:** pick 12 single frames, the best of each type: prom, portrait, family and christening.
  Weddings only where the couple has agreed. Full colour, no watermark. Upload the 2 strongest now.
  The editors approve photos one at a time, so the profile will build up over weeks.
- **Prices:** profiles show an hourly rate (one Sliven profile shows $106–125/hour). Viki needs to
  give a "от X €/час" figure, or leave it out if MyWed allows that (I didn't check).

**2. Hotel Skalite, and the same email to every venue she has shot at**
- **First, check with Viki:** the gallery text for Руми и Цецко says „ритуал на тераса над скалите",
  which is what Skalite's wedding page describes. Confirm it was there. Do the same check for the
  other weddings and proms, and include Hotel Rovno and the Vidin restaurants. Rovno's
  [site](https://www.hotelrovno.com/en) has no weddings page, so ask them directly.
- **Photos:** 10–15 photos of the venue itself: terrace, hall, table setting, rocks, details.
  No faces unless the couple has agreed.
- **Text (BG, ready to send):**
  > Тема: Снимки от вашето място — за сайта ви, без такса
  >
  > Здравейте, аз съм Виктория Борисова, фотограф в София и Видин (phbyviki.com). Снимах
  > [събитие] при вас на [дата]. Бих искала да ви подаря 10–15 обработени кадъра на мястото —
  > терасата, залата, детайлите — за сайта и социалните ви мрежи. Моля единствено за надпис
  > „Снимки: Виктория Борисова — phbyviki.com" с линк към [адрес на галерията] и, ако ви е удобно,
  > да ме имате предвид, когато двойки ви питат за фотограф. Поздрави, Виктория, [телефон]
- **Prices:** none.

**3. Start.bg, two free "Предложи линк" submissions** (5 minutes, no photos or prices)
- fotostudia.start.bg, section "Сватбени фотографи":
  - Title (50 characters): `Виктория Борисова – сватбен фотограф София и Видин`
  - Description (80 characters): `Сватби, абитуриентски балове, кръщенета и семейни фотосесии във Видин и региона.`
- vidin.start.bg, section "Снимки и видео от Видин":
  - Title (38 characters): `Фотограф във Видин – Виктория Борисова`
  - Description: the same as above.
- Link to `https://phbyviki.com/`.

**4. Bing Places** (after the Google Business Profile is verified; 10 minutes)
- Choose "Import from Google Business Profile" and set it to sync monthly. A verified Google
  profile carries its verification over. Hide the address.
- Then check the category (Photographer) and the service area, and add 5–10 photos.
- **No Google profile yet?** Do Apple Business Connect (row 11) this week instead, using the same
  name, phone and website details.

**5. One pitch to local media** (Danube Bridges, Vidin TV, Radio Vidin; one email each)
- **Angle:** pick one.
  - (a) Belogradchik's rocks as a wedding setting, with her photos.
  - (b) Free, credited photos for their coverage of a public event, e.g. the Бъдинъ festival at
    Baba Vida or next spring's proms. Credit line: „Снимки: Виктория Борисова / phbyviki.com".
- **Text:** an 80-word bio built from the site's own claims (София и Видин, 4+ години, 100+ събития,
  сватби, балове, кръщенета), the angle in 2 sentences, and how to reach her.
- **Photos:** 5 landscape images at 2000 px with no watermark, and only where the people in them
  have agreed. Add 1 portrait of Viki.
- **Prices:** none. If an outlet only does paid pieces, see row 20 and treat it as advertising.

## After this week

- **Prices are the blocker for Shooty (row 8).** That listing is worth doing once prices exist,
  because its Vidin page shows up first and has no photographer actually based in Vidin.
- **Couples' consent opens up Boho Weddings (row 7)** and lets venues link to wedding galleries.
  Ask the couples from the Belogradchik weddings first.
- **A "Публикации / Featured on" block** on `/about-me`, once at least 3 mentions exist. At the
  same time, add the MyWed and Fearless profile URLs to `sameAs` in `src/index.html` (a site
  change, for the worker queue).
- **Vendor credits on gallery pages (row 6)** need a small site change: a "Грим / Рокля / Декор"
  line in `gallery-texts.ts`.

## Checked and dropped

- **svatbencatalog.com and vidin-online.com:** the domains no longer resolve (DNS fails).
- **mywedding.bg:** now an online-invitation service; its Vidin catalogue page returns 404.
- **podaracizasvatba.com wedding catalogue:** 4 listings in total.
- **eventix.bg** (sister site of WeddingDay): the website link is a JavaScript redirect
  (`/redirectto`), which Google can't follow.
- **[pmg-vd.org](https://pmg-vd.org/)** and other school sites: no prom galleries. Prom coverage
  appears in local media instead (row 5).
- **[vidinnovini.com](https://vidinnovini.com/):** mostly national and world news; nothing local
  to hook into.
- **[svatbamagazine.com](https://svatbamagazine.com/):** active print magazine, but it doesn't
  publish couples' own weddings, and features are run with advertisers.
