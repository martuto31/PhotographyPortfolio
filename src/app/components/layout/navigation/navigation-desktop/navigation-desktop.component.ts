import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CONTACT } from './../../../../content/contact';

@Component({
  selector: 'app-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
})

export class NavigationDesktopComponent {

  public readonly contact = CONTACT;

}
