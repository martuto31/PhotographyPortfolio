import { AfterViewInit, Component, ElementRef, Inject, Input, PLATFORM_ID } from '@angular/core';
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

export class CategoryNavComponent implements AfterViewInit {

  constructor(
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object) { }

  /** Slug of the category page being shown; null on the index. */
  @Input() active: string | null = null;

  // On a phone the row scrolls sideways; bring the current category into view
  // so a visitor on /galerii/krushteneta does not land on a row that appears
  // to say "Всички · Сватби · Абитуриенти".
  public ngAfterViewInit(): void {
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
