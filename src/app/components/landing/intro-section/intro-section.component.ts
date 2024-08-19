import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-intro-section',
  templateUrl: './intro-section.component.html',
  styleUrls: ['./intro-section.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class IntroSectionComponent { }
