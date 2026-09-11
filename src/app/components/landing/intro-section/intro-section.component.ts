import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CONTACT } from './../../../content/contact';
import { ScrollService } from './../../../services/scroll.service';

@Component({
  selector: 'app-intro-section',
  templateUrl: './intro-section.component.html',
  styleUrls: ['./intro-section.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class IntroSectionComponent implements OnInit {

  constructor(
    private scroll: ScrollService,
    @Inject(DOCUMENT) private dom: Document) { }

  public readonly contact = CONTACT;

  // The hero is a CSS background, so nothing in the markup tells the browser to start
  // fetching it — hence the preload. It lives here rather than in index.html because
  // index.html is inherited by all 44 prerendered pages, and on the 31 gallery pages it
  // was a high-priority download of an image that never appears, racing the photograph
  // that actually is the LCP element there. Injected during prerender, so the homepage's
  // static HTML still carries it in <head> exactly as before.
  ngOnInit(): void {
    if (this.dom.head.querySelector(`link[${IntroSectionComponent.PRELOAD_MARKER}]`)) {
      return;
    }

    const link = this.dom.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'image');
    link.setAttribute('href', IntroSectionComponent.HERO_IMAGE);
    link.setAttribute('fetchpriority', 'high');
    link.setAttribute(IntroSectionComponent.PRELOAD_MARKER, '');
    this.dom.head.appendChild(link);
  }

  // Keep in sync with --hero-image in src/app/styles/variables.css.
  private static readonly HERO_IMAGE = '/assets/img/hero/hero-arch.webp';

  private static readonly PRELOAD_MARKER = 'data-hero-image-preload';

  // The only in-page scroll left on the site. The nav and hero buttons used to
  // be href="/" plus a scroll handler, which gave crawlers no destination and
  // sent anyone clicking "Галерия" from a gallery page back to the home page.
  // They are real routes now; this stays because the cue points at a section of
  // the page the visitor is already on.
  public scrollToWork(): void {
    this.scroll.scrollToSection('projects');
  }

}
