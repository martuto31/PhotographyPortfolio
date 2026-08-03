import { Component, OnInit } from '@angular/core';

import { ContactMeComponent } from './../contact-me/contact-me.component';

import { CONTACT } from './../../content/contact';
import { StructuredDataService } from './../../services/structured-data.service';

// /kontakti — a contact page with its own URL.
//
// Before this, "Контакти" was href="/" plus a scroll handler. There was no address
// Viktoria could paste into a message, no page to rank for "контакти фотограф",
// and pressing it from a gallery navigated the visitor away from the photographs
// they were looking at.
//
// Phone first, form last: the form hands off to Gmail in a new tab, which is a lot
// of friction for someone who just wants to ask whether a Saturday is free.
@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
  standalone: true,
  imports: [
    ContactMeComponent,
  ],
})

export class ContactPageComponent implements OnInit {

  constructor(private structuredData: StructuredDataService) { }

  public readonly contact = CONTACT;

  public ngOnInit(): void {
    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: 'Контакти', url: 'https://phbyviki.com/kontakti' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'url': 'https://phbyviki.com/kontakti',
        'name': 'Контакти — Виктория Борисова, фотограф София и Видин',
        'mainEntity': { '@id': 'https://phbyviki.com/#business' },
      },
    ]);
  }

}
