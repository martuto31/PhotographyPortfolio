import { Component } from '@angular/core';

import { IntroSectionComponent } from './intro-section/intro-section.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [
    IntroSectionComponent,
  ],
})

export class LandingComponent {

}
