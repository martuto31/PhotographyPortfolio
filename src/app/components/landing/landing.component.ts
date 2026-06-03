import { Component } from '@angular/core';

import { ProjectsComponent } from './projects/projects.component';
import { ContactMeComponent } from './../contact-me/contact-me.component';
import { IntroSectionComponent } from './intro-section/intro-section.component';

// In-page scrolling to the projects/contact sections is handled by ScrollService,
// driven from the hero buttons, nav and footer.
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

export class LandingComponent { }
