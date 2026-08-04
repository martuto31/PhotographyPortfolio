import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CONTACT } from './../../../content/contact';
import { LEGAL_LINKS } from './../../../content/legal';
import { SERVICES } from './../../../content/services';
import { DimensionService } from './../../../services/dimension.service';

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

  constructor(public dimensionsService: DimensionService) { }

  public readonly contact = CONTACT;

  // Every category, linked from every page. This is the site's only complete
  // internal link set — gallery pages used to carry three links and no route to
  // the categories a visitor had not already seen.
  public readonly services = SERVICES;

  // Privacy policy and terms. Footer is the conventional place for them, and a
  // crawlable link from every page is what makes the two pages discoverable at all.
  public readonly legalLinks = LEGAL_LINKS;

  public readonly year = new Date().getFullYear();

}
