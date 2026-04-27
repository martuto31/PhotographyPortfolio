import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DimensionService } from './../../services/dimension.service';

interface Gallery {
  name: string;
  imageSrc: string;
  isImgLoaded: boolean;
}

// Maps BG URL slug -> internal type key + S3 prefix used by the gallery component.
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
    private title: Title) { }

  @Input() galleryType: string = 'svatbi';

  // Resolved internal type key (Weddings/Graduates/Personal/etc.) used in template @if's
  public type: string = 'Weddings';
  public cardTag: string = 'СВАТБИ';
  public pageHeading: string = '';
  public pageSubheading: string = '';

  public ngOnInit(): void {
    this.type = SLUG_TO_TYPE[this.galleryType] || this.galleryType;
    this.cardTag = TYPE_LABEL_BG[this.type]?.cardTag || '';
    this.setHeadings();
    this.setTitle();
  }

  private setHeadings(): void {
    const headings: Record<string, { h1: string; sub: string }> = {
      'Weddings': { h1: 'Сватбен фотограф — София и Видин', sub: 'Сватбени фотосесии и галерии от Виктория Борисова' },
      'Graduates': { h1: 'Фотограф за абитуриентски бал — София и Видин', sub: 'Абитуриентски фотосесии и галерии' },
      'Personal': { h1: 'Лични и портретни фотосесии — София и Видин', sub: 'Индивидуални фотосесии в студио или на открито' },
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

  public weddingGalleries: Gallery[] = [
    {
      name: 'Krysteena & Martin',
      imageSrc: 'assets/img/wedding-galleries/krysteena-martin-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Александрина и Борис',
      imageSrc: 'assets/img/wedding-galleries/aleksandrina-boris-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Мари и Оги',
      imageSrc: 'assets/img/wedding-galleries/mari-ogi-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Вики и Петьо',
      imageSrc: 'assets/img/wedding-galleries/viki-petio-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Виктория и Мартин',
      imageSrc: 'assets/img/wedding-galleries/viki-martin-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Надя и Боби',
      imageSrc: 'assets/img/wedding-galleries/nadia-bobi-cover.webp',
      isImgLoaded: false,
    },
  ];

  public graduatesGalleries: Gallery[] = [
    {
      name: 'Вивиан',
      imageSrc: 'assets/img/graduates-galleries-covers/vivian.webp',
      isImgLoaded: false,
    },
    {
      name: 'Ванеса',
      imageSrc: 'assets/img/graduates-galleries-covers/vanesa.webp',
      isImgLoaded: false,
    },
    {
      name: 'Мони',
      imageSrc: 'assets/img/graduates-galleries-covers/moni.webp',
      isImgLoaded: false,
    },
    {
      name: 'Други',
      imageSrc: 'assets/img/graduates-galleries-covers/merelin.webp',
      isImgLoaded: false,
    },
  ];

  public personalGalleries: Gallery[] = [
    {
      name: '',
      imageSrc: '',
      isImgLoaded: false,
    },
  ];

  // Future service categories — populate when galleries are added
  public baptismGalleries: Gallery[] = [];
  public corporateGalleries: Gallery[] = [];
  public birthdayGalleries: Gallery[] = [];
  public familyGalleries: Gallery[] = [];

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
