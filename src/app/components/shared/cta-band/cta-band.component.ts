import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CONTACT } from './../../../content/contact';
import { DimensionService } from './../../../services/dimension.service';

// Closing call to action, on ink.
//
// Every page that a visitor can reach and then run out of road on ends with this:
// gallery pages (which previously had three internal links and no ask), service
// pages, and the category index. The heading is per-page so it can name what the
// reader was just looking at.
@Component({
  selector: 'app-cta-band',
  templateUrl: './cta-band.component.html',
  styleUrls: ['./cta-band.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class CtaBandComponent {

  constructor(public dimensions: DimensionService) { }

  @Input() heading = 'Свободна ли е вашата дата?';

  @Input() text = 'Пишете ми датата и мястото на събитието - отговарям до 24 часа с наличност и цена.';

  public readonly contact = CONTACT;

}
