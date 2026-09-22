import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CONTACT } from './../../../content/contact';
import { SITE_IMAGE_BASE_URL } from './../../../config';
import { ScrollService } from './../../../services/scroll.service';

export interface HeroPhoto {
  /** File stem under site/hero in the bucket (source: src/assets/img/hero), exported at each of HERO_WIDTHS. */
  name: string;
  alt: string;
  /** What the crop keeps on a screen wider than 3:2 - see the stylesheet. */
  position: string;
}

// The three photographs Viki chose for the hero, in her order (2026-09-16).
// She could not pick one, so the hero shows the first and then moves through
// the others slowly; the first is the one every visitor sees, and the one the
// prerendered page carries.
export const HERO_PHOTOS: HeroPhoto[] = [
  {
    name: 'hero-lift',
    alt: 'Младоженецът носи булката на ръце сред облак дим на първия танц - сватбена фотография от Виктория Борисова',
    position: 'center 45%',
  },
  {
    name: 'hero-smoke',
    alt: 'Първата целувка под цветна арка и цветен дим - сватбена фотография от Виктория Борисова',
    position: 'center 50%',
  },
  {
    name: 'hero-dance',
    alt: 'Първи танц на младоженците сред искри и дим - сватбена фотография от Виктория Борисова',
    position: 'center 42%',
  },
];

// The exports on disk. Phones take the 1200 (a 390px screen at 3x asks for
// 1170), tablets the 1800, everything wider the 2400 - the old single 2400px
// file cost a phone three times what it could show.
const HERO_WIDTHS = [1200, 1800, 2400];

@Component({
  selector: 'app-intro-section',
  templateUrl: './intro-section.component.html',
  styleUrls: ['./intro-section.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class IntroSectionComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private scroll: ScrollService,
    private zone: NgZone,
    @Inject(DOCUMENT) private dom: Document,
    @Inject(PLATFORM_ID) private platformId: object) { }

  public readonly contact = CONTACT;

  public readonly photos = HERO_PHOTOS;
  public readonly sizes = '100vw';

  /** Index of the photograph showing. */
  public current = 0;

  // True once the other photographs are in the page. They are added only in
  // the browser, after the first has loaded and had a moment on screen, so the
  // prerendered HTML carries one <img> and nothing races the LCP download.
  public cycling = false;

  private started = false;

  // Every photograph in the frame, in order; the next one is read from the DOM
  // when the tick comes rather than from load events, which a cached image
  // can fire before the listener is on.
  @ViewChildren('photo') private frames?: QueryList<ElementRef<HTMLImageElement>>;
  private timer?: ReturnType<typeof setInterval>;
  private startTimer?: ReturnType<typeof setTimeout>;

  // How long each photograph stays, and the fade (mirrored in the stylesheet).
  private static readonly DWELL_MS = 6500;
  private static readonly FIRST_LOOK_MS = 2000;

  // The hero is the home page's LCP element. It is a real <img> now, but the preload
  // still moves its discovery to the document head, ahead of the stylesheet and the
  // component bundle. It lives here rather than in index.html because index.html is
  // inherited by all 44 prerendered pages, and on the 31 gallery pages it was a
  // high-priority download of an image that never appears, racing the photograph that
  // actually is the LCP element there. Injected during prerender, so the homepage's
  // static HTML carries it in <head>.
  ngOnInit(): void {
    if (this.dom.head.querySelector(`link[${IntroSectionComponent.PRELOAD_MARKER}]`)) {
      return;
    }

    const link = this.dom.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'image');
    link.setAttribute('href', this.src(this.photos[0]));
    // Both or neither: with imagesrcset but no imagesizes the browser assumes
    // 100vw anyway, but spelling it out keeps the preload and the <img> in step.
    link.setAttribute('imagesrcset', this.srcset(this.photos[0]));
    link.setAttribute('imagesizes', this.sizes);
    link.setAttribute('fetchpriority', 'high');
    link.setAttribute(IntroSectionComponent.PRELOAD_MARKER, '');
    this.dom.head.appendChild(link);
  }

  @ViewChild('first') private first?: ElementRef<HTMLImageElement>;

  // The prerendered <img> is preloaded and usually complete before hydration
  // attaches the (load) listener, so that event never comes. Ask it directly.
  ngAfterViewInit(): void {
    const img = this.first?.nativeElement;
    if (img?.complete && img.naturalWidth > 0) {
      this.onFirstLoad();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.startTimer);
    clearInterval(this.timer);
  }

  private static readonly PRELOAD_MARKER = 'data-hero-image-preload';

  public src(photo: HeroPhoto): string {
    return `${SITE_IMAGE_BASE_URL}/hero/${photo.name}-${HERO_WIDTHS[HERO_WIDTHS.length - 1]}.webp`;
  }

  public srcset(photo: HeroPhoto): string {
    return HERO_WIDTHS.map((w) => `${SITE_IMAGE_BASE_URL}/hero/${photo.name}-${w}.webp ${w}w`).join(', ');
  }

  // The first photograph is up: give it a moment, then bring in the others and
  // start moving. Not on the server (a timer there would hold the prerender
  // open), and not for a visitor who asked for less motion - they keep the
  // first photograph, Viki's first choice.
  public onFirstLoad(): void {
    // Both the (load) event and ngAfterViewInit can get here; one timer only.
    if (!isPlatformBrowser(this.platformId) || this.started || this.photos.length < 2) {
      return;
    }
    this.started = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.startTimer = setTimeout(() => {
      this.cycling = true;
      // Outside the zone: a tick every few seconds must not run change
      // detection over the whole page; only the switch itself re-enters.
      this.zone.runOutsideAngular(() => {
        this.timer = setInterval(() => this.advance(), IntroSectionComponent.DWELL_MS);
      });
    }, IntroSectionComponent.FIRST_LOOK_MS);
  }

  // Move to the next photograph that has arrived; a slow connection waits a
  // tick rather than fading to an empty frame. Nothing moves while the tab is
  // in the background.
  private advance(): void {
    if (this.dom.hidden) {
      return;
    }
    const next = (this.current + 1) % this.photos.length;
    const img = this.frames?.get(next)?.nativeElement;
    if (!img?.complete || img.naturalWidth === 0) {
      return;
    }
    this.zone.run(() => {
      this.current = next;
    });
  }

  // The only in-page scroll left on the site. The nav and hero buttons used to
  // be href="/" plus a scroll handler, which gave crawlers no destination and
  // sent anyone clicking "Галерия" from a gallery page back to the home page.
  // They are real routes now; this stays because the cue points at a section of
  // the page the visitor is already on.
  public scrollToWork(): void {
    this.scroll.scrollToSection('projects');
  }

}
