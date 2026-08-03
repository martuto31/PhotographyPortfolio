import { Component } from '@angular/core';
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

export class IntroSectionComponent {

  constructor(private scroll: ScrollService) { }

  public readonly contact = CONTACT;

  // The only in-page scroll left on the site. The nav and hero buttons used to
  // be href="/" plus a scroll handler, which gave crawlers no destination and
  // sent anyone clicking "Галерия" from a gallery page back to the home page.
  // They are real routes now; this stays because the cue points at a section of
  // the page the visitor is already on.
  public scrollToWork(): void {
    this.scroll.scrollToSection('projects');
  }

}
