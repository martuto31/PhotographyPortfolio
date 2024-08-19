import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class NavigationDesktopComponent { }
