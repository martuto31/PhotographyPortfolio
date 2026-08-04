import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { LEGAL_DOCS, LEGAL_LINKS, LegalDoc } from './../../content/legal';
import { CONTACT } from './../../content/contact';
import { StructuredDataService } from './../../services/structured-data.service';

// One component serves both /poveritelnost and /usloviya. The document is chosen by
// `data.doc` on the route rather than by a URL segment, so the two live at clean
// Bulgarian paths without a shared prefix.
//
// The router reuses this component when navigating between the two, so the document
// is read from an ActivatedRoute subscription rather than from the snapshot — a
// snapshot read in ngOnInit would leave the second page showing the first one's text.
@Component({
  selector: 'app-legal-page',
  templateUrl: './legal-page.component.html',
  styleUrls: ['./legal-page.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class LegalPageComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private structuredData: StructuredDataService,
  ) { }

  public doc!: LegalDoc;
  public readonly contact = CONTACT;
  public readonly otherDocs = LEGAL_LINKS;

  private subscription?: Subscription;

  public ngOnInit(): void {
    this.subscription = this.route.data.subscribe(data => {
      this.doc = LEGAL_DOCS[data['doc']];
      this.setStructuredData();
    });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private setStructuredData(): void {
    const url = `https://phbyviki.com/${this.doc.slug}`;

    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: this.doc.h1, url },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'url': url,
        'name': this.doc.h1,
        'description': this.doc.lead,
        'inLanguage': 'bg-BG',
        'dateModified': this.doc.updated,
        'publisher': { '@id': 'https://phbyviki.com/#business' },
      },
    ]);
  }

}
