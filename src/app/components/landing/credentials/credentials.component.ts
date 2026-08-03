import { Component } from '@angular/core';

import { CONTACT, CREDENTIALS } from './../../../content/contact';

// The strip directly under the hero.
//
// Nothing above the fold used to assert experience — a visitor had no way to tell
// whether they were looking at a working photographer or someone's first season.
// Every figure here is checkable against the site itself; none is rounded up.
@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css'],
  standalone: true,
})

export class CredentialsComponent {

  public readonly credentials = CREDENTIALS;
  public readonly contact = CONTACT;

}
