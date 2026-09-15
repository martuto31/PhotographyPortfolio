import { AfterViewChecked, AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SERVICES } from './../../../content/services';
import { GALLERY_SNAPSHOT } from './../../../generated/galleries';

interface CategoryLink {
  slug: string;
  label: string;
  /** Published galleries, from the build-time snapshot; 0 for a service-only page. */
  count: number;
}

// The row of categories over the wall: "Всички" and the six services, the
// current one marked. Real links, not filter buttons - each category is a page
// of its own (the search landing page for that service), so the row is the
// site's map of them and a crawler follows it like anyone else.
@Component({
  selector: 'app-category-nav',
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.css'],
  standalone: true,
  imports: [RouterLink],
})

export class CategoryNavComponent implements AfterViewInit, AfterViewChecked, OnChanges {

  constructor(
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object) { }

  /** Slug of the category page being shown; null on the index. */
  @Input() active: string | null = null;

  // The router keeps the category page from one category to the next, so the
  // row is not rebuilt either - only `active` moves. Scroll again once the
  // template has moved the mark.
  private activeMoved = false;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['active']?.firstChange === false) {
      this.activeMoved = true;
    }
  }

  // On a phone the row scrolls sideways; bring the current category into view
  // so a visitor on /galerii/krushteneta does not land on a row that appears
  // to say "Всички · Сватби · Абитуриенти".
  public ngAfterViewInit(): void {
    this.scrollToActive();
  }

  public ngAfterViewChecked(): void {
    if (this.activeMoved) {
      this.activeMoved = false;
      this.scrollToActive();
    }
  }

  private scrollToActive(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const row = this.host.nativeElement.querySelector<HTMLElement>('.categories');
    const current = row?.querySelector<HTMLElement>('a.active');
    if (row && current && row.scrollWidth > row.clientWidth) {
      row.scrollLeft = Math.max(0, current.offsetLeft - 24);
    }
  }

  public readonly categories: CategoryLink[] = SERVICES.map((service) => ({
    slug: service.slug,
    label: service.label,
    count: GALLERY_SNAPSHOT[service.type]?.length ?? 0,
  }));

  public readonly total = this.categories.reduce((sum, category) => sum + category.count, 0);

}
