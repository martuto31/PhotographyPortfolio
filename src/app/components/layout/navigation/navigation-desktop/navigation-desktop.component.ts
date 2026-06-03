import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ScrollService } from './../../../../services/scroll.service';

@Component({
  selector: 'app-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class NavigationDesktopComponent {

  constructor(private scroll: ScrollService) { }

  public scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.scroll.scrollToSection(id);
  }

}
