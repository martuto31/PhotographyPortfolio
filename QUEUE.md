# Queue

The machine lane. `TASKS.md` and `HANDOFF.md` stay the human picture — this is what
the worker session actually reads.

Worker rules: `WORKER.md`. Results: `LOG.md`.

---

## Intake

Paste anything here, however rough. **One line per thought** — a newline is the
separator, nothing else. The worker triages everything here on its next tick and
clears the section.

You do not need to format, number, group or tidy anything. Triage exists for that.
Forwarding a message from Viki verbatim is fine.

Four habits that change what happens, none of them effort:

| Write this | Because |
|---|---|
| **Put final text in quotes** | Quoted text ships on its own. Described text waits for you to write it. |
| **Say where** — which page, gallery, section | "В галерията «кръщенета», в частта «какво включва»…" lands first try. "Fix the christening text" gets a question back. |
| **Say when you don't know** — "increase the number, not sure to what" | It parks and asks instead of inventing a figure for her live site. |
| **End a line with `!`** | Jumps the queue. Otherwise it works top to bottom. |

Where a line came from helps too — `from Viki, 2026-09-11:` above a pasted block
tells it this is the client's own wording and not to improve it.

<!-- paste below this line -->

---

## Triaged

- [x] T-55 · Tidy the queue: Ready and LOG Needs you reconciled with what shipped · auto · done 2026-10-01
- [ ] T-54 · GEO · needs-you · robots.txt (b033de9), llms.txt + schema (8b69e6b) shipped; answer blocks, FAQ expansion and test prompts wait for a yes (TASKS.md)
- [x] T-53 · Gallery view toggle — LIVE 2026-09-22 (icons-only feed/mosaic pill, de0bbed)

One line per item drained from Intake. Full specs get written under **Ready** —
`needs-you` ones soon, `auto` ones when their turn comes.

Each stub keeps Viki's original line(s) underneath, verbatim, so the spec is copied
from her text and never retyped. Paste order kept, except T-17 which runs last on
purpose — see its note.

- [x] T-07 · Homepage hero subtitle · auto · shipped 2026-09-11
  > На началната страница вместо “Документален и спокоен подход - вие преживявате деня си, аз го записвам. Сватби, абитуриентски балове, кръщенета и лични фотосесии В цяла България” нека пише “Заснемам вашите събития в цялата страна. Без позиране и напрежение - вие преживявате деня си, а аз го запечатвам.”
  > Може би вместо “30+ заснети събития” да се увеличи числото
- [x] T-09 · Wedding gallery copy — lead, body, "какво включва" ×2, FAQ travel answer · auto · shipped 2026-09-11
  > Като отвориш сватбената галерия вместо “Сватбата минава по-бързо, отколкото очаквате. Моята работа е да ви я върна такава, каквато с била наистина.” Нека бъде “Сватбеният ден минава по-бързо, отколкото очаквате - с много вълнение, притеснение и сълзи от щастие. Моята работа е да уловя всяка ваша емоция такава, каквато е, за да можете после да преживявате този ден отново и отново, когато погледнете снимките." Нека пише “Всяка сватба, която виждате тук, е различна - защото хората в нея са различни. Няма да ви режисирам или карам да позирате с часове. Ако имате в главата си кадър, който сте видели някъде и не спирате да мислите за него - изпратете ми го предварително и ще го пресъздадем. Но най-много обичам да запечатвам онези непринудени моменти, които не се режисират. Денят е ваш, затова и планът е ваш. Препоръчвам ви да разпределите часовете така, че да не бързате и да имате спокойствие през целия ден. Обикновено денят изглежда така: сутринта започва с подготовката - детайлите, които правят деня истински ваш (бижута, пръстени, часовници, обувки, покана, парфюм), после гражданският брак, а ако имате и църковен ритуал - и той. Следват снимки с кумовете и шаферите, ако има такива и накрая - само вие двамата. Разбира се, имате дете или домашен любимец винаги е добре дошъл в кадъра. Вечерта продължава в ресторанта. Освен танците и купона, там се случват и малките неща, които правят всяка българска сватба. Работя основно в София и Видин, но пътувам в цяла България. Ако сватбата ви е другаде - просто ми пишете и ще намерим решение.”
  > В сватбената галерия, в частта “какво включва” там където пише “фотосесия на двойката” нека остане само “фотосесия” и описанието да звучи така “Поне един час на локация, която сме избрали заедно. Кумовете са задължителна част, шафери и шаферки ако има също трябва да присъстват. Ако имате дете или домашен любимец, също е добре дошъл.”
  > В сватбената галерия, в частта “какво включва” там където пише “ресторант и парти” в описанието нека пише “Посрещане на младоженците в ресторанта, захранването им, първия сватбен танц, чупенето на питката, разрязването на тортата, всички български традиции, както и танците.
  > В частта “често задавани въпроси” на въпроса “пътувате ли извън София и Видин нека пише “Да, снимам в цяла България. Транспортът и нощувката се уточняват предварително и влизат в общата сума.”
- [x] T-10 · Prom gallery copy — description and "какво включва" · auto · shipped 2026-09-11
  > В описанието за абитуриентските фотографии да се промени на следния текст: “Завършването е момент, който се случва само веднъж в живота - и заслужава да бъде запечатан завинаги. Правя индивидуална фотосесия на абитуриента в деня на бала, заедно с близките и роднините му, както и с приятелите. Възможно е и заснемане на семейния бал, което започва със същата индивидуална сесия, но включва и снимки с гостите на арката, а при желание и купонът след това.”
  > В албума абитуриентска фотография в частта какво включва да се променят на “Индивидуална фотосесия в деня на бала” и описание към него “Прави се индивидуална фотосесия на абитуриента, последвана от кадри с близките, роднините и приятелите му. Заснема се и пристигането с автомобил при останалите съученици.”, след това се добавя нова графа “Семеен бал” и описанието към нея е следното: “Протича по същия начин като индивидуалната фотосесия в деня на бала, но включва и посрещането на гостите със снимки пред арката, както и купонът след това.” Нека в тази част да се променят често задаваните въпроси на база тази информация която съм написала сега
- [x] T-12 · Other events gallery copy — description, drop "Локация и светлина" · auto · shipped 2026-09-11
  > От галерията “други събития” да се премахне “локация и светлина”
  > Текстът с описанието в галерията “други събития” да се промени на “Тук са всички останали галерии със снимки като портретни сесии, рождени дни, годишнини, годежи, изненади и други. Ако имате идея не се колебайте да ми я споделите, за да я осъществим. Портретните сесии обикновено траят около час, а локацията я избирате вие.”
- [x] T-13 · Christening gallery copy — description, "какво включва" ×3, first FAQ answer · auto · shipped 2026-09-11
  > За описание на галерията “Кръщенета” да се промени на “Кръщенето е кратко, но изпълнено с много специални моменти. Заснемам самото тайнство, както и непринудените мигове преди него. Не пропускам и детайлите - кръстчето, свещичките, кутийките за кръстче и косичка, дрешките за преобличане, кърпата за подсушаване. След тайнството продължаваме със семейни снимки, а при възможност - и снимки само на детето. Кръстниците са задължителна част от кадрите. Възможно е и заснемане на празненството в ресторанта - посрещането на гостите на арката, първият танц на родителите с детето, както и останалите специални моменти от вечерта.”
  > В галерията “кръщенета” частта която е “какво включва” към графата “преди тайнството” описанието да е “Вълнението на родителите, първите гости, дрешките за преобличане, кърпата за подсушаване, кръстчето, кутийките за кръстче и косичка, свещите”. В графата “в храма” описанието да е “Цялото тайнство, заснето със или без светкавица (по ваш избор).” Графата “Семейни кадри” да си остане така. Графата “празненство” описанието да се промени на “снимки с гостите на арката, първия танц на родителите с детето, първото хоро, тортата, както и всичко, което се случва”
  > В галерията “кръщенета” при често дадавани въпроси отговора на първия да се промени на “В повечето храмове да, но правилата се различават. Добре е да попитате свещеника предварително”
- [x] T-14 · Family gallery copy — description, location item, processing item, FAQ clothes answer · auto · shipped 2026-09-11
  > Описанието на галерията “семейна фотография” да се промени на “Ако мисълта за фотосесия ви кара да се притеснявате как да застанете или какво да правите с ръцете — спокойно, повечето хора се чувстват така. Аз идвам с идеи, вие идвате със себе си. Семейни фотосесии на открито или у дома — за деца, бебета, бременни и по-големи семейства в София и Видин.”
  > В галерията “семейна фотография” в частта “какво включва” първото да се промени на “Избор на локация - Вие избирате локацията, но мога да предложа варианти според сезона и възрастта на децата.”
  > В галерията “семейна фотография” в частта “какво включва”частта с “Обработка” да се промени на  “Естествена - без изкуствени тонове, без прекалено изгладена кожа. Разбира се, ако имате визия за нещо различно, с удоволствие ще я реализираме заедно.”
  > В галерията “семейна фотография”  в частта с “често задавани въпроси” отговорът на въпроса “какво да облечем” да се промени на “Изберете цветове, които си пасват едни на други, без едри надписи и шарки. Не е нужно да сте в еднакви дрехи, достатъчно е цветовете да си пасват”
- [x] T-15 · Birthdays gallery copy — description, FAQ swap · auto · shipped 2026-09-11
  > Описанието на галерията “рождени дни” да се промени на “След години остава едно нещо от всеки празник — снимките. Не подредените, а тези, в които наистина сте вие: смехът точно преди да духнете свещите, децата, хванати по средата на игра, бабата, която тайно бърше сълза. На детските партита започваме със снимки на детето с родителите, после и с останалите деца, докато всички са още подредени и усмихнати. Оттам нататък оставям нещата да се случват сами - духването на свещичките, желанието, тортата, игрите. Най-хубавите моменти обикновено се случват, докато никой не гледа към обектива. При юбилеи и по-официални тържества е малко по-различно — има тостове, речи и общи снимки, които трябва да се организират, преди гостите да започнат да се разотиват. Ако искате, поемам и тази роля, за да не се налага на вас да мислите за това в деня на празника. Заснемам детски партита, кръгли годишнини, семейни събирания и фирмени тържества — в София, Видин и страната.”
  > В галерията “рождени дни” в графата “често задавани въпроси” въпросът “може ли да снимате в заведение” да се премахне и да се сложи следния въпрос и отговор: “Колко снимки ще получим? Без ограничение — получавате всеки сполучлив кадър от деня, не предварително зададен брой.”
  > Галерията “корпоративни” да се премахне
- [x] T-17 · Remove long dashes from all visible text · auto · part A shipped 2026-09-11; T-17b (held-back SEO files) under Blocked
  > Махане на дългите тирета

- [x] T-04 · Delete the dead `prod` branch · closed — Martin keeps `prod` and works there himself
  > dont delete prod branch ill do myself the work there
- [x] T-06 · Refund clause for booked dates · auto · shipped 2026-09-11 (wording in LOG for veto)
  > T-06 thats okay do you need green light? if so yes
- [x] T-05 · Legal name and contact address in the footer and legal pages · auto · shipped 2026-09-11
  > T-05 Виктория Борисова, адрес: ж.к. Александър Стамболийски 1 Видин
- [x] T-08 · "30+" → "150+" заснети събития · auto · shipped 2026-09-11
  > T-08 150+ събития
- [x] T-11 · Prom FAQ — apply the approved draft · auto · shipped 2026-09-11
  > Т-11 I approve
- [x] T-16 · Remove the "корпоративни" category · auto · part A shipped 2026-09-11; T-16b under Blocked
  > T-16 Remove it and maybe we dont need 301 as it is not indexed but if its indexed do 301 but no for now 404
- [x] T-18 · Button colour: "костено бяло" · answered - see T-20
  > Цвят на бутоните костено бяло от артефакта
- [x] T-19 · Design reference: anastasiiakharyna.com · decided - see below
  > Вики - Сайта на който ми харесва дизайна https://www.anastasiiakharyna.com/
- [x] T-20 · Apply the redesign direction (DESIGN-SPEC.md) to every page in one pass, button = Костено бяло `#F1ECE3` · auto · shipped 2026-09-12 as one commit
  > Redesign direction is decided and written up in DESIGN-SPEC.md — tokens, glow recipe, type scale, what came from theme 01 vs 02, what was dropped. Read it before touching any visual work.
  > Preview artifact, shared with Viki: https://claude.ai/code/artifact/e277ac36-238b-459d-9974-bb89aeb8f9cc
  > BLOCKED on Viki: she must name one button colour of four (Костено бяло / Бледо шампанско / Пепелна роза / Само контур). Recommendation is Костено бяло. Nothing visual gets applied until she answers.
  > When she answers: apply the direction to every page in one pass — home, galleries index, four service pages, about, contacts. Not page by page.
  > Two things must survive that pass, both shipped for indexing: the sibling-gallery strip at the bottom of gallery.component.html, and the real <img> tags seeded from src/app/generated/galleries.ts (first row eager, first photo preloaded).
  > For the design there was redesign but unfinished, here is the artifact: design spec md  and also she picked the color and website for reference so i dont have clear instructions about that maybe scope them and decide or give me the decision
- [x] T-18 · Button colour · answered by Viki: Костено бяло - folded into T-20
- [x] T-19 · Design reference anastasiiakharyna.com · decided: mood reference only, the merged direction in DESIGN-SPEC.md stands (Viki picked a button from it, i.e. accepted it); nothing from that site is copied unless she names an element
- [x] T-06b · Deposit sentence in the refund clause · auto · shipped 2026-09-12
  > T-06 - Add the sentence yes
- [x] T-17b · Long dashes in the former held-back files + sitemap image titles · auto · shipped 2026-09-12 (attribution: dash dropped)
- [x] T-16b · Corporate out of the slug maps, LocalBusiness offer, sitemap generator, `<Type>` lists; unknown category slug → 404 · auto · shipped 2026-09-12
  > T-17b and 16b i dont understand can you run it and verify its good and about the dash you can make the decision
- [x] T-07 follow-up · About-me meta description · closed, no change: the About page itself was not edited, so its meta still describes it; only the homepage hero changed
  > i odnt understand about me meta description - update it if about you was updated?
- [x] T-10b · /galerii teaser for abiturienti · auto · shipped 2026-09-12
  > T-10 change to match the new text yes
- [x] T-06b / T-10b · veto windows closed - Martin OK'd both wordings 2026-09-12
  > okay for the deposit sentence and i think t-10b its okay too
- [x] T-20 · Martin: "okay" to the decision
  > t-20 - i mean okay i dont understand but okay
- [x] T-21 · Gallery photos "missing" · diagnosed 2026-09-12, not a bug: the localhost CORS trap (only the 8 seeded photos show off-origin); production and the built HTML are fine - see LOG
  > I think images from galleries are missing
- [x] T-22 · Same-origin manifest fallback so galleries fill on localhost and on preview URLs · auto · shipped 2026-09-12
- [x] T-23 · UI/UX audit of the redesign - headings, type sizes, best practices · auto · shipped 2026-09-13 after Martin's "exempt"; taste calls under LOG → Needs you
  > well what are the questions with a few words / do that for me and enable the loop  (= exempt, recommended option)
  > check design run agents maybe and test the design and the website make sure we follow bwst ui uxz prctices
  > The redesign is fine and nothing from that website was picked particularly but check the headings the sizes etc it looks good
- [x] T-20 · Martin: "The redesign is fine" - the Needs-you item is closed; T-19 reconfirmed (nothing from that site picked)
- [x] T-24 · Deploy the branch to a Firebase preview channel (not prod) so Martin can send Viki a link · auto · shipped 2026-09-13: https://phbyvikiprod--preview-yb28hwie.web.app (expires 2026-10-13)
- [x] T-25 · Take the address out of the footer (legal pages keep it) · auto · shipped 2026-09-13
  > okay can we remove the personall address at the footer for now
  > when you finish, can you deploy to one of the test firebase urls not the prod so i can send it to her
- [x] T-26 · Хартия и месинг - direction B's light tokens on every page in one pass · auto · shipped 2026-09-15
  > okay so from the artifact we choose - N1, C1, P1, S3, Q3, F1, T1, Ft1 or the footer how it was for the landing page and lets go with the white - хартия и месинг flow of the app and colors.
- [x] T-27 · Home hero H3 - whole page, whole photo, copy bottom-left over a gradient · auto · shipped 2026-09-15 (H3 picked when asked)
- [x] T-23b · The audit's thumb-target taste calls - buttons 44px, footer/legal/breadcrumb links, wordmark, icons · auto · shipped 2026-09-15
  > 5 - do them
- [x] T-27b · Hero photo at 100% screen width (was inset on screens wider than 3:2); responsiveness sweep at 320-2560 · auto · shipped 2026-09-15
  > okay the cover image in the hero is not fulll 100% width of my screen, also check responsivenes if you didnt
- [x] T-28 · Home sections - P1 three cards, S3 list + photo, Q3 photo whole + words beside; N1 C1 F1 T1 Ft1 stay as shipped · auto · shipped 2026-09-15
- [x] T-29 · Gallery page W3 - one column, big whole photographs, portraits two-up; phone and tablet checked · auto · shipped 2026-09-15
  > for W i want W3 is perfect lets try it and make sure you check mobile designs tablet designs bugs qa conventions etc
- [x] T-30 · Contacts K3 - the form in the centre, the ways under it · auto · shipped 2026-09-15
  > for contacts lets leave it K3 and maybe some other choices
- [x] T-31 · Canvas round 2 - new options for /galerii (G3 kept), /galerii/svatbi, About (incl. what to do with the portrait) and Contacts · auto · published 2026-09-15 (artifact v6, page 7) - picks needed, see LOG
  > For the galleries now - lets go with some other design what can we do G1 and G2 i dont like so im left only with G3 and i want other options. For K i dont like neither K1, K2 nor K3 to be honest, K1 is okayish but i want choices
  > for about me i dont like A1, A2 nor A3 designs as well and maybe we should do somehting about the photo what do yo suggest
  > and split your works to tasks or whatever you need
- [x] T-32 · Refresh the preview channel for Viki after T-26..T-30 · auto · done 2026-09-15
- [x] T-33 · One wall for /galerii and the category pages (G/K rounds one and two rejected) · auto · shipped to the preview as the proposal 2026-09-15 - awaiting Martin
  > I dont like them i dont know they dont look visually apealing and its not normal flow like i dont want it to be basic but i dont want them overdone i want something that is with nice ui ux
- [x] T-34 · Gallery → sibling → back → other gallery keeps showing the first one; category row too · auto · done 2026-09-15
  > she likes the website and galleries like that but said there were bugs can you fix it like opening a gallery from the suggestion, going back opening other doesnt open it etc
- [x] T-35 · Home page with each candidate hero photo, for Viki and Martin to pick · needs-you · answered 2026-09-16: 5, 4, 1 in that order, cycling
  > she wants 3 and wants them to shuffle because she cant choose which she likes more - and wants a priority or like this image to be first - hero-5 … this second: hero-4 … this to be third: hero-1
- [x] T-36 · Hero cycles through Viki's three photographs, 5 → 4 → 1 · auto · done 2026-09-16
- [x] T-37 · Buttons: not rectangles · auto · done 2026-09-16 (pills)
- [x] T-38 · Typography pass - leads unified; Bulgarian letterforms = needs-you (LOG) · auto · done 2026-09-16
- [x] T-39 · CTA pass - closing band leads with the channel that works on the device · auto · done 2026-09-16
- [x] T-40 · Bug sweep - 43 routes × 3 widths + click-throughs: nothing to fix · auto · done 2026-09-16
- [x] T-42 · Bulgarian Cyrillic letterforms everywhere - Source Sans 3 as the reading face · auto · done 2026-09-16
  > cyrylil should be bulgarian not russian so check it out
- [x] T-41 · SEO check after the redesign - all clean; share image was the fault · auto · done 2026-09-16
  > If its okay enter the loop and make it visually appealing then work on the small details like fonts, buttons like i dont want rectangle buttons, cta, bugs, seo.
- [x] T-43 · Copy pass - "София и Видин" once per page, no "цяла България", 100+ events, fix the texts · auto · done 2026-09-16, texts listed in LOG for Martin to check
  > i dont know about the fonts i need to check them like difference, about page can we keep for now. 4 - we cant right now and what could we do about that. Can we check all texts and copys like she offers Видин И софия, но да пише навсякъде фотофраф видин и софия звучи странно и после имаме фотограф цялата страна, махаме фотограф цялата страна. Смени на 100+ заснети събития и оправи текстовете, за сватбите и галериите които чакаш от нея какво друго може да измислим и давай ми текстове за проверка ако трябва или помисли все едно че си специалист на тази тема и маркетингов специалист
- [x] T-44 · Font comparison page for Martin and Viki - the four faces side by side, hosted · auto · done 2026-09-16 · decided 2026-09-16: A (Source Sans 3) stays
  > fonts - what do you reccomend, okay lets go withy a if you reccomnd,
- [x] T-45 · Venue/date without the spreadsheet - what can be done instead · needs-you · answered 2026-09-16 (LOG: no EXIF in R2; a 31-line Messenger message replaces the spreadsheet)
- [x] T-31 · About page - stays as it is for now (Martin, 2026-09-16: "about page can we keep for now")
- [x] T-46 · Copy pass two - literary Bulgarian, no "24 часа", hero line explained, cities tile without label, FAQ 5 · auto · done 2026-09-17, texts listed in LOG
  > 1 - какво значи без позиране и анпрежение. нека поработим над това и да бъде ан български книжовен език. софия и видин но не ми хареса софия и видин какво може да имзислим или да си го оставим, махни 'където снимам най-често. Нека махнем отговарям до 24 часа звучи банално. 5-  ако събитието е другата ми пишете за да се уточним или нещо такова. . Нека всички текстове да са професионални.
- [x] T-47 · Per-gallery texts written from the photographs (Viki cannot recall dates or write them) · done 2026-09-21: one factual line per gallery, meta only (e06c213, 441cece)
- [x] T-48 · Email-ready list of every non-Viki text for her to approve or redact · auto · done 2026-09-17 (`.verify/tekstove-za-viki-2026-09-17.txt`)
  > okay can i send them to email to her so she agrees or redacts them can you help with that and what else is left, testemonials for now wont do and for seo is everything ready and whats left from buildig the website
- [x] T-49 · Apply Viki's answers to the T-48 list - 9 edits, 3 FAQ entries she left out · auto · done 2026-09-19 (two readings flagged in LOG)
  > from Martin, 2026-09-19: "Add those to the ingest of the loop and enter the loop with them until you finish everything"
  > 1. Заглавие: „Сватбен и събитиен фотограф в София и Видин“
  > 2. Под заглавието: „Сватби, абитуриентски балове, кръщенета и семейни празници. Заснемам вашите събития в документален стил - вие преживявате деня си, а аз запечатвам важните моменти и вашите емоции.“
  > 3. Лентата с числата: „4+ години опит“ · „100+ заснети събития“ · „София & Видин“
  > 4. Секция „Как работим заедно“ - „От първото съобщение до готовите снимки“
  >    Ред под заглавието: „Ясен процес в четири стъпки и без формуляри.“
  >    Стъпка 1 - Пишете ми: „Изпратете ми датата, мястото и повода. Ще потвърдя дали датата е свободна и ще ви предложа конкретна оферта.“
  >    Стъпка 2 - Уточняваме детайлите: „Срещаме се на живо или онлайн и преминаваме през програмата на деня, локациите и хората, които искате да бъдат в кадър.“
  >    Стъпка 3 - Снимаме: „В деня на събитието вие празнувате, а аз просто снимам."
  >    Стъпка 4 - Получавате галерията: „Няколко дни след събитието получавате първа селекция, а след нея - цялата обработена галерия за изтегляне в пълен размер.“
  > 5. Често задавани въпроси:
  >    • В кои градове снимате?
  >      „Основно в София и Видин. Ако събитието ви е другаде, пишете ми, за да уточним детайлите и разходите за път.“
  >    • Колко струва фотограф за сватба или събитие?
  >      „Цената зависи от продължителността на събитието, мястото и това, което включва. Изпратете ми датата и мястото и ще получите конкретна оферта.“
  >    • Колко предварително трябва да запазя дата?
  >      „За сватби в активния сезон - между 6 и 12 месеца предварително. За фотосесии, рождени дни и кръщенета обикновено са достатъчни няколко седмици.“
  >    • Как се запазва дата?
  >      „След като уточним услугата и цената, датата се резервира с капаро. До този момент няма ангажимент за никоя от страните.“
  >    • Кога получавам снимките и в какъв вид?
  >      „Малка селекция от най-добрите кадри получавате в рамките на няколко дни, а пълната обработена галерия - в уговорения срок. Снимките се изтеглят онлайн в пълен размер.“
  >    • Мога ли да поискам снимките да не се публикуват?
  >      „Да. Нищо не се публикува без вашето изрично съгласие.“
  > 6. Тъмната лента най-долу - „Разкажете ми за вашия ден“:
  >    „Изпратете ми датата и мястото на събитието. Ще ви отговоря дали датата е свободна и ще ви изпратя конкретна оферта.“
  > 7. Футър: „Сватбен и събитиен фотограф" · „София · Видин“
  >
  > ═══ ГАЛЕРИЯ (всички категории) ═══
  >
  > 8. Под заглавието: „Сватби, абитуриентски балове, кръщенета и семейни събития. Всяка галерия е моят поглед през обектива.“
  > 9. Лентата долу - „Не намирате вашия повод?“: „Снимала съм много и най-различни събития, затова разкажете ми за вашия и ще намерим решение.“
  >
  > ═══ КАТЕГОРИИ ═══
  >
  > 10. Заглавия на страниците: „Сватбен фотограф“, „Фотограф за абитуриентски бал“, „Фотограф за кръщене“, „Фотограф за рожден ден“, „Семеен фотограф“, „Други събития“ (градовете остават в заглавието за Google)
  > 11. Сватби, последен абзац: „Работя основно в София и Видин. Ако сватбата ви е другаде - просто ми пишете и ще намерим решение.“
  > 12. Сватби, „Какво включва“ - Среща преди сватбата: „На живо или онлайн - обсъждаме програмата на деня, локациите и хората, които искате да бъдат в кадър.“
  > 13. Сватби, въпроси:
  >    • Колко предварително да запазим дата?
  >      „Съботите в активния сезон (май–октомври) се заемат най-рано - обикновено 6 до 12 месеца предварително. Ако датата ви е скоро, все пак ми пишете - понякога има свободни уикенди.“
  >    • Пътувате ли извън София и Видин?
  >      „Да. Транспортът и нощувката се уточняват предварително и влизат в общата сума.“
  >    • Кога получаваме снимките?
  >      „След сватбата получавате малка селекция от най-добрите кадри в рамките на няколко дни, а пълната обработена галерия - в срока, уговорен при запазването на датата.“
  > 14. Абитуриенти, ред под заглавието: „Дванадесет години училище завършват с една вечер - тя заслужава повече от няколко снимки с телефон.“
  > 15. Кръщенета, ред под заглавието: „Детето няма да помни този ден. Снимките са начинът да му го разкажете.“
  >     Въпрос „Колко време оставате?“: „Обикновено заснемам подготовката, тайнството и началото на празненството. Ако желаете да остана до края на вечерта, уточняваме го предварително.“
  > 16. Семейни, ред под заглавието: „Най-хубавите семейни снимки почти никога не са тези, на които всички гледат в обектива.“
  >     Абзац: „Ако мисълта за фотосесия ви притеснява - как да застанете, какво да правите с ръцете - знайте, че повечето хора се чувстват така. Аз идвам с идеите, вие бъдете себе си. Семейни фотосесии на открито или у дома: за деца, бебета, бъдещи майки и големи семейства в София и Видин.“
  >     • Какво да облечем?
  >       „Изберете цветове, които се съчетават, без едри надписи и шарки. Не е нужно да сте в еднакви дрехи - достатъчно е тоновете да си подхождат.“
  > 17. Рождени дни, ред под заглавието: „На рождения ден домакинът никога не вижда собствения си празник. Затова съм там.“
  >     Абзац 1: „След години остава едно нещо от всеки празник - снимките. Не подредените, а тези, в които наистина сте вие: смехът точно преди да духнете свещите, децата, хванати по средата на игра, бабата, която тайно бърше сълза.“
  >     Абзац 2: „На детските партита започваме със снимки на детето с родителите, после и с останалите деца, докато всички са още подредени и усмихнати. Оттам нататък оставям нещата да се случват сами - духането на свещичките, желанието, тортата, игрите. Най-хубавите моменти обикновено се случват, докато никой не гледа към обектива.“
  >     Абзац 3: „При юбилеи и по-официални тържества е малко по-различно - има тостове, речи и общи снимки, които трябва да се организират, преди гостите да започнат да се разотиват. Ако желаете, поемам и тази роля, за да не мислите за това в деня на празника.“
  >     Абзац 4: „Заснемам детски партита, кръгли годишнини и семейни събирания - в София и Видин.“
  >     • Колко часа е нужно да останете?
  >       „За детски рожден ден обикновено два-три часа покриват всичко важно. За юбилей с вечеря се разбираме според програмата.“
  >     • Колко снимки ще получим?
  >       „Без ограничение - получавате всеки сполучлив кадър от деня, не предварително зададен брой.“
  >     • Правите ли снимки и на гостите?
  >       „Да - гостите са половината от празника. Много семейства след това споделят галерията с всички присъствали.“
  > 18. Други събития, ред под заглавието: „Годежи, юбилеи, портрети или просто идея, за която мислите от месеци.“
  >
  > ═══ ОТДЕЛНА ГАЛЕРИЯ ═══
  >
  > 19. Под имената: само видът - „Сватбена фотосесия“, „Абитуриентска фотосесия“ и т.н.
  > 20. Лентата долу - „Харесва ли ви това, което видяхте?“: „Ако планирате подобен ден, изпратете ми датата и мястото. Ще ви отговоря дали датата е свободна и ще ви изпратя конкретна оферта.“
  >
  > ═══ ЗА МЕН ═══
  >
  > 21. Лентата долу - „Да поговорим за вашия ден“: „Изпратете ми датата и мястото и ще ви отговоря дали съм свободна и при какви условия.“
  >
  > ═══ КОНТАКТИ ═══
  >
  > 22. Заглавие „Нека се чуем“, под него: „Изпратете ми датата, мястото и повода. Ще ви отговоря дали датата е свободна и ще ви изпратя конкретна оферта.“
  > 23. „Къде снимам: София & Видин“
  > Също какво правим с текстовете за всчка галерия които чакаме от нея но тя каза че не помни дати и не може да измисли текстове

---

# Ready

Specs leave this section when their task ships; `LOG.md` → Shipped and `git log`
keep the record.

_Empty._

---

# Needs Martin

_Nothing parked here right now - the open questions are in `LOG.md` → Needs you._

---

# Blocked

Not startable. Listed so they are not rediscovered every week.

| Task | Blocked on | Who |
|---|---|---|
| Pricing page `/tseni` | package prices | Viki |
| Town and month on gallery pages | her reply to the T-45 message (LOG) | Viki |
| Testimonials | real quotes | Viki |
| Weddings back on the live site | the couples' consent | Viki |

Done and off this list: `srcset` and real image dimensions (5d8c296), gallery
texts (T-47, meta lines only by Martin's choice).
