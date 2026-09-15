import { AfterViewChecked, AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PHONE_SLOT } from './../../../config';

// One tile on the wall.
export interface WallItem {
  name: string;
  imageSrc: string;
  imageSrcset: string;
  link: string[];
  alt: string;
  /** Shown under the name on the mixed wall; left empty on a category page. */
  category?: string;
}

// The wall: every gallery as a cover at 4:5 with the name under it. One
// component for /galerii (all categories dealt together) and for each category
// page (that category alone), so the two screens are the same object and the
// visitor learns it once.
//
// Nothing around the photographs - no rule, no shadow, no card. The cover
// eases in as it arrives, the frame zooms a touch on hover, and tiles fade up
// as they enter the viewport. The reveal is added by script after hydration,
// so the prerendered page is fully visible to a crawler and to anyone whose
// script has not run.
@Component({
  selector: 'app-gallery-wall',
  templateUrl: './gallery-wall.component.html',
  styleUrls: ['./gallery-wall.component.css'],
  standalone: true,
  imports: [RouterLink],
})

export class GalleryWallComponent implements AfterViewInit, AfterViewChecked, OnChanges, OnDestroy {

  constructor(
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() items: WallItem[] = [];

  // Three across on desktop, two on tablets and phones.
  public readonly sizes = `(max-width: 480px) ${PHONE_SLOT}, (max-width: 960px) 47vw, (min-width: 1440px) 421px, 30vw`;

  // The first row is on screen at every width and must not wait for the lazy
  // loader; four covers the widest row with one to spare.
  private static readonly EAGER = 4;

  private loaded = new Set<string>();
  private observer?: IntersectionObserver;

  // The list is replaced once the live manifest arrives; the tiles it adds
  // have to be watched too, or they would stay faded out.
  private tilesChanged = false;

  public ngOnChanges(): void {
    this.tilesChanged = true;
  }

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      return;
    }

    this.host.nativeElement.classList.add('reveal');
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          this.observer?.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    this.watchNewTiles();
  }

  public ngAfterViewChecked(): void {
    if (this.tilesChanged && this.observer) {
      this.tilesChanged = false;
      this.watchNewTiles();
    }
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private watchNewTiles(): void {
    const tiles = this.host.nativeElement.querySelectorAll<HTMLElement>('.tile:not([data-watched])');
    tiles.forEach((tile) => {
      tile.dataset['watched'] = '';
      this.observer?.observe(tile);
    });
  }

  public loadingFor(index: number): 'eager' | 'lazy' {
    return index < GalleryWallComponent.EAGER ? 'eager' : 'lazy';
  }

  public isLoaded(item: WallItem): boolean {
    return this.loaded.has(item.imageSrc);
  }

  public onLoad(item: WallItem): void {
    this.loaded.add(item.imageSrc);
  }

}
