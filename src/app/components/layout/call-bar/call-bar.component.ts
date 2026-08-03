import { Component } from '@angular/core';

import { CONTACT } from './../../../content/contact';
import { DimensionService } from './../../../services/dimension.service';

// Phone and Viber pinned to the bottom of the viewport on handhelds.
//
// A visitor who has just scrolled a wedding gallery on their phone is as warm as
// a lead gets, and until now the only way to act on it was to scroll back to a
// form that hands off to Gmail. This is the shortest path from "I like these
// photos" to a ringing phone.
@Component({
  selector: 'app-call-bar',
  templateUrl: './call-bar.component.html',
  styleUrls: ['./call-bar.component.css'],
  standalone: true,
})

export class CallBarComponent {

  constructor(public dimensions: DimensionService) { }

  public readonly contact = CONTACT;

}
