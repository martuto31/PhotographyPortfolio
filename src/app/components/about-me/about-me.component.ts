import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContactMeComponent } from './../contact-me/contact-me.component';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    ContactMeComponent,
  ],
})

export class AboutMeComponent {

}
