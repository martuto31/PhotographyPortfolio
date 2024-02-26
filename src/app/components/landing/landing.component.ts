import { Component } from '@angular/core';

import { ProjectsComponent } from './projects/projects.component';
import { IntroSectionComponent } from './intro-section/intro-section.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [
    ProjectsComponent,
    IntroSectionComponent,
  ],
})

export class LandingComponent {

}
