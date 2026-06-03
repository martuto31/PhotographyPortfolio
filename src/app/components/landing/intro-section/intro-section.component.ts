import { Component } from '@angular/core';

import { ScrollService } from './../../../services/scroll.service';

@Component({
  selector: 'app-intro-section',
  templateUrl: './intro-section.component.html',
  styleUrls: ['./intro-section.component.css'],
  standalone: true,
})

export class IntroSectionComponent {

  constructor(private scroll: ScrollService) { }

  public scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.scroll.scrollToSection(id);
  }

}
