import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DimensionService } from './../../../services/dimension.service';
import { ScrollService } from './../../../services/scroll.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class FooterComponent {

  constructor(
    public dimensionsService: DimensionService,
    private scroll: ScrollService) { }

  public scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.scroll.scrollToSection(id);
  }

}
