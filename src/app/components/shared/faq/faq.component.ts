import { Component, Input } from '@angular/core';

import type { FaqItem } from './../../../content/services';

// Shared FAQ block — homepage, every service page.
//
// Built on <details>/<summary> rather than a JS accordion: it works in the
// prerendered HTML with no hydration, it is keyboard accessible for free, and
// browser find-in-page can open a closed answer. The answers are in the DOM
// whether or not the panel is open, so crawlers read all of them.
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  standalone: true,
})

export class FaqComponent {

  @Input({ required: true }) items: FaqItem[] = [];

  @Input() heading = 'Често задавани въпроси';

  @Input() eyebrow = 'Въпроси';

  // The first answer starts open — an accordion where everything is shut reads
  // as an empty section at a glance.
  @Input() openFirst = true;

}
