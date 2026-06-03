import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { ProjectsComponent } from './projects/projects.component';
import { ContactMeComponent } from './../contact-me/contact-me.component';
import { IntroSectionComponent } from './intro-section/intro-section.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [
    ProjectsComponent,
    ContactMeComponent,
    IntroSectionComponent,
  ],
})

export class LandingComponent {

  constructor(
    private router: Router) { }

  public ngAfterViewInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && history.state.scrollTo) {
        this.scrollToSection(history.state.scrollTo);
      }
    });
  }

  // Target sections (projects, contact-me) are lazily rendered via @defer, so
  // they may not exist the instant navigation completes. Retry briefly until the
  // element is in the DOM, then smooth-scroll (accounting for the fixed header).
  private scrollToSection(id: string, attempts = 0): void {
    const element = document.getElementById(id);

    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    } else if (attempts < 20) {
      setTimeout(() => this.scrollToSection(id, attempts + 1), 50);
    }
  }

}
