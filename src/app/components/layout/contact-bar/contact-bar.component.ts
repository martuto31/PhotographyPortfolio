import { Component } from '@angular/core';

import { CONTACT } from './../../../content/contact';
import { DimensionService } from './../../../services/dimension.service';

// Messenger and Instagram pinned to the bottom of the viewport on handhelds.
//
// A visitor who has just scrolled a wedding gallery on their phone is as warm as
// a lead gets, and without this the only way to act on it is to scroll back to a
// form that hands off to Gmail.
//
// These are deep links rather than a route to /kontakti on purpose: on a phone
// both open the installed app straight onto a conversation, which is one tap from
// "I like these photos" to a message Viktoria will actually see. That was the job
// the phone number used to do here.
@Component({
  selector: 'app-contact-bar',
  templateUrl: './contact-bar.component.html',
  styleUrls: ['./contact-bar.component.css'],
  standalone: true,
})

export class ContactBarComponent {

  constructor(public dimensions: DimensionService) { }

  public readonly contact = CONTACT;

}
