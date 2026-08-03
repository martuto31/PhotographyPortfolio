import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CtaBandComponent } from './../shared/cta-band/cta-band.component';

import { SERVICES } from './../../content/services';
import { GALLERY_SNAPSHOT } from './../../generated/galleries';
import { StructuredDataService } from './../../services/structured-data.service';

interface CategoryRow {
  slug: string;
  label: string;
  teaser: string;
  /** Published galleries in this category, from the build-time snapshot. */
  count: number;
}

// The /galerii index.
//
// "Галерия" in the nav used to be href="/" plus a JS scroll handler: no crawlable
// destination, no URL to send anyone, and clicking it from a gallery page threw the
// visitor back to the home page. This is the page it should always have pointed at.
//
// Laid out as an editorial index rather than a card grid — four of the seven
// categories have no cover photograph yet, and a grid with holes in it looks worse
// than a list that never promised images.
@Component({
  selector: 'app-galleries-index',
  templateUrl: './galleries-index.component.html',
  styleUrls: ['./galleries-index.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    CtaBandComponent,
  ],
})

export class GalleriesIndexComponent implements OnInit {

  constructor(private structuredData: StructuredDataService) { }

  public readonly categories: CategoryRow[] = SERVICES.map((service) => ({
    slug: service.slug,
    label: service.label,
    teaser: service.teaser,
    count: GALLERY_SNAPSHOT[service.type]?.length ?? 0,
  }));

  public ngOnInit(): void {
    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: 'Галерия', url: 'https://phbyviki.com/galerii' },
      ]),
    ]);
  }

  public countLabel(count: number): string {
    if (count === 0) {
      return 'За услугата';
    }

    return count === 1 ? '1 галерия' : `${count} галерии`;
  }

}
