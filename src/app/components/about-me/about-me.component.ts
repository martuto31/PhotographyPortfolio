import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CtaBandComponent } from './../shared/cta-band/cta-band.component';

import { CONTACT } from './../../content/contact';
import { SITE_IMAGE_BASE_URL } from './../../config';
import { StructuredDataService } from './../../services/structured-data.service';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    CtaBandComponent,
  ],
})

export class AboutMeComponent implements OnInit {

  public readonly siteImages = SITE_IMAGE_BASE_URL;

  constructor(private structuredData: StructuredDataService) { }

  public readonly contact = CONTACT;

  public ngOnInit(): void {
    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: 'За мен', url: 'https://phbyviki.com/about-me' },
      ]),
      this.structuredData.profilePage('https://phbyviki.com/about-me'),
    ]);
  }

}
