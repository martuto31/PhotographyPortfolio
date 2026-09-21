// One factual line per gallery, keyed by the R2 manifest prefix ("Weddings/Лора и
// Асен"): what kind of shoot and where it went, nothing else. Read off the photographs
// (T-47, 2026-09-21) - no dates, no venue names, no adjectives. Viki adds a venue
// name here if she wants one.
//
// Shown under the category noun on the gallery page (with the photo count) and used
// as the page's meta description, so the 31 gallery pages stop sharing one
// description. A gallery without an entry falls back to the noun alone.
//
// Look up through galleryLine(): folder names come off a Mac disk with "й" as two
// code points (и + breve), while this file is typed with the single one, so both
// sides are normalised before comparing.

const GALLERY_LINES: Record<string, string> = {
  // ---- Weddings -------------------------------------------------------------
  'Weddings/Krysteena & Martin': 'Подготовка, изнесен ритуал край водата, вечер в зала, небесни фенери',
  'Weddings/Александрина и Борис': 'Подготовка, граждански ритуал, венчавка, вечер в шатра',
  'Weddings/Анжела и Александър': 'Ритуал в градина, портрети, вечер в зала',
  'Weddings/Бети и Светли': 'Изнесен ритуал пред крепост, венчавка, вечер в зала',
  'Weddings/Вики и Петьо': 'Изнесен ритуал, венчавка, вечер в зала',
  'Weddings/Виктория и Мартин': 'Граждански ритуал, портрети на тераса над скалите',
  'Weddings/Елина и Денис': 'Излизането след ритуала',
  'Weddings/Лора и Асен': 'Изнесен ритуал пред крепост, портрети в парк, вечер в зала',
  'Weddings/Лори и Любо': 'Граждански ритуал, портрети в града, вечер в зала, заря',
  'Weddings/Люба и Калоян': 'Вземане на булката, портрети в парк, венчавка, изнесен ритуал, заря',
  'Weddings/Нанси и Чавдар': 'Изнесен ритуал под дърветата, портрети, вечер в зала',
  'Weddings/Натали и Валентин': 'Изнесен ритуал, портрети в градина',
  'Weddings/Руми и Цецко': 'Подготовка, ритуал на тераса над скалите, портрети сред скалите, вечер в зала',
  'Weddings/Дея и Виктор': 'Вземане на булката по стълба, венчавка, изнесен ритуал на тераса, вечер в зала',
  'Weddings/Мира и Валентин': 'Подготовка, вземане на булката с музиканти, венчавка, изнесен ритуал, вечер в зала',
  'Weddings/Симона и Коста': 'Подготовка, изнесен ритуал сред скалите, портрети на скалите, вечер в зала край водата',

  // ---- Graduates ------------------------------------------------------------
  'Graduates/Ванеса': 'Абитуриентска фотосесия в парк, черна рокля',
  'Graduates/Вивиан': 'Абитуриентска фотосесия в парк, светлосиня рокля, цветен дим, бенгалски огън',
  'Graduates/Ева': 'Абитуриентска фотосесия в парк, тъмносиня рокля',
  'Graduates/Елинор': 'Абитуриентска фотосесия в парк и на бала, червена рокля',
  'Graduates/Ирена': 'Абитуриентска фотосесия на крайбрежната алея, сива рокля',
  'Graduates/Катрин и Калин': 'Абитуриентска фотосесия за двама, крепостен зид и парк',
  'Graduates/Мери': 'Абитуриентска фотосесия в парк и край реката, две рокли',
  'Graduates/Мони': 'Абитуриентска фотосесия за двама, парк и крайбрежна алея',
  'Graduates/Никол и Димитър': 'Абитуриентска фотосесия за двама в парк',
  'Graduates/Никол': 'Абитуриентска фотосесия в парк, черна дантелена рокля',
  'Graduates/Петя': 'Абитуриентска фотосесия в парк, черна рокля',
  'Graduates/Семеен бал Ванеса': 'Семеен бал в ресторант',
  'Graduates/Семеен бал Мадлен': 'Семеен бал, портрети в градина, вечер в ресторант',
  'Graduates/Семеен бал Мони': 'Семеен бал, портрети в парк, вечер в ресторант',

  // ---- Personal -------------------------------------------------------------
  'Personal/Детски рожден ден Дари': 'Четвърти рожден ден, торта, балони, басейн с топки',
  'Personal/Криси': 'Портретна фотосесия в парк',
  'Personal/Миши': 'Портретна фотосесия в парк',
  'Personal/Юбилей Сергей': '50-и рожден ден в ресторант',
  'Personal/Мери': 'Портретна фотосесия сред бали слама, слънчогледи и край реката',
  'Personal/Детайли': 'Сватбени детайли: пръстени, букети, костюмът, обувките, питката, тортата',
  'Personal/Криси и Лиза': 'Портретна фотосесия в парк с кученце',

  // ---- Birthdays ------------------------------------------------------------
  'Birthdays/Ема': '18-и рожден ден: хотел, градина и тераса край водата',
};

const NORMALISED: Record<string, string> = Object.fromEntries(
  Object.entries(GALLERY_LINES).map(([key, text]) => [key.normalize('NFC'), text]),
);

// The line for a manifest prefix ("Weddings/Лора и Асен"), or empty.
export function galleryLine(prefix: string): string {
  return NORMALISED[prefix.normalize('NFC')] ?? '';
}

// "154 снимки" / "1 снимка".
export function photoCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'снимка' : 'снимки'}`;
}

// The search-result description for a gallery: "<name> - <line>. <n> снимки. <brand>."
// The line's first letter drops to lower case after the dash. Without a line the
// caller keeps its generic description.
export function galleryDescription(name: string, line: string, count: number): string {
  const lower = line.charAt(0).toLowerCase() + line.slice(1);
  const photos = count > 0 ? ` ${photoCountLabel(count)}.` : '';
  return `${name} - ${lower}.${photos} Виктория Борисова, фотограф в София и Видин.`;
}
