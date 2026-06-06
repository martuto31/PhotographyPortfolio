import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DimensionService } from './../../services/dimension.service';
import { COVER_FILENAME, fetchManifest, imageUrl } from './../../config';

interface Gallery {
  name: string;
  imageSrc: string;
  isImgLoaded: boolean;
}

// Maps BG URL slug -> internal type key + R2 prefix used by the gallery component.
// Add a new entry here when introducing a new service category and the rest of the
// SEO config (seo.json, sitemap.xml, JSON-LD offers) will pick it up.
export const SLUG_TO_TYPE: Record<string, string> = {
  'svatbi': 'Weddings',
  'abiturienti': 'Graduates',
  'lichni': 'Personal',
  'krushteneta': 'Baptisms',
  'korporativni': 'Corporate',
  'rojdeni-dni': 'Birthdays',
  'semeyni': 'Family',
  // Legacy direct values (when arriving via old EN routes that didn't redirect)
  'Weddings': 'Weddings',
  'Graduates': 'Graduates',
  'Personal': 'Personal',
};

const TYPE_LABEL_BG: Record<string, { heading: string; cardTag: string }> = {
  'Weddings': { heading: 'Сватбени', cardTag: 'СВАТБИ' },
  'Graduates': { heading: 'Абитуриентски', cardTag: 'АБИТУРИЕНТИ' },
  'Personal': { heading: 'Лични', cardTag: 'ПЕРСОНАЛНИ' },
  'Baptisms': { heading: 'Кръщенета', cardTag: 'КРЪЩЕНЕТА' },
  'Corporate': { heading: 'Корпоративни', cardTag: 'КОРПОРАТИВНИ' },
  'Birthdays': { heading: 'Рождени дни', cardTag: 'РОЖДЕНИ ДНИ' },
  'Family': { heading: 'Семейни', cardTag: 'СЕМЕЙНИ' },
};

// Alt-text prefix per type, used for SEO-friendly image alt attributes.
const TYPE_ALT_PREFIX: Record<string, string> = {
  'Weddings': 'Сватбена фотография — ',
  'Graduates': 'Абитуриентска фотосесия — ',
  'Personal': 'Лична фотосесия — ',
  'Baptisms': 'Фотосесия от кръщене — ',
  'Corporate': 'Корпоративно събитие — ',
  'Birthdays': 'Рожден ден — ',
  'Family': 'Семейна фотосесия — ',
};

@Component({
  selector: 'app-galleries-cards',
  templateUrl: './galleries-cards.component.html',
  styleUrls: ['./galleries-cards.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class GalleriesCardsComponent implements OnInit {

  constructor(
    public dimensionsService: DimensionService,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() galleryType: string = 'svatbi';

  // Resolved internal type key (Weddings/Graduates/Personal/etc.) used in template @if's
  public type: string = 'Weddings';
  public cardTag: string = 'СВАТБИ';
  public pageHeading: string = '';
  public pageSubheading: string = '';
  public currentGalleries: Gallery[] = [];
  public altPrefix: string = '';

  public async ngOnInit(): Promise<void> {
    this.type = SLUG_TO_TYPE[this.galleryType] || this.galleryType;
    this.cardTag = TYPE_LABEL_BG[this.type]?.cardTag || '';
    this.altPrefix = TYPE_ALT_PREFIX[this.type] || '';
    this.setHeadings();
    this.setTitle();

    // Cards are built from the R2 manifest on the client; the page is SPA-rendered.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadGalleries();
  }

  // Build the card list from every manifest prefix under "<type>/".
  // Card title = the folder name after "<type>/"; cover = cover.webp if present,
  // otherwise the first image (manifest lists are already naturally sorted).
  private async loadGalleries(): Promise<void> {
    const manifest = await fetchManifest();
    if (!manifest) {
      return; // CORS/network failure — show no cards rather than crash
    }

    const typePrefix = `${this.type}/`;
    this.currentGalleries = Object.keys(manifest.galleries)
      .filter((prefix) => prefix.startsWith(typePrefix))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((prefix) => {
        const files = manifest.galleries[prefix];
        const cover = files.includes(COVER_FILENAME) ? COVER_FILENAME : files[0];
        return {
          name: prefix.slice(typePrefix.length),
          imageSrc: cover ? imageUrl(prefix, cover) : '',
          isImgLoaded: false,
        };
      })
      .filter((gallery) => gallery.imageSrc); // skip empty galleries (no cover available)
  }

  private setHeadings(): void {
    const headings: Record<string, { h1: string; sub: string }> = {
      'Weddings': { h1: 'Сватбен фотограф — София и Видин', sub: 'Сватбени галерии от Виктория Борисова' },
      'Graduates': { h1: 'Фотограф за абитуриентски бал — София и Видин', sub: 'Галерии с абитуриентски фотосесии от Виктория Борисова' },
      'Personal': { h1: 'Други събития — София и Видин', sub: 'Галерии с индивидуални фотосесии, рождени дни, кръщенета и други събития от Виктория Борисова' },
      'Baptisms': { h1: 'Фотограф за кръщене — София и Видин', sub: 'Кръщенета и семейни тайнства' },
      'Corporate': { h1: 'Корпоративен фотограф — София и Видин', sub: 'Бизнес събития, конференции и тийм билдинги' },
      'Birthdays': { h1: 'Фотограф за рожден ден — София и Видин', sub: 'Детски рождени дни, юбилеи и семейни празненства' },
      'Family': { h1: 'Семеен фотограф — София и Видин', sub: 'Семейни и детски фотосесии' },
    };

    const h = headings[this.type];
    if (h) {
      this.pageHeading = h.h1;
      this.pageSubheading = h.sub;
    }
  }

  // Slug used when building links to the single-gallery page
  public get gallerySlug(): string {
    return this.galleryType;
  }

  public onImageLoad(gallery: Gallery): void {
    gallery.isImgLoaded = true;
  }

  private setTitle(): void {
    const labels = TYPE_LABEL_BG[this.type];
    if (!labels) return;

    const cityScope = 'София и Видин';
    this.title.setTitle(`${labels.heading} Фотосесии — ${cityScope} | Виктория Борисова`);
  }

}
