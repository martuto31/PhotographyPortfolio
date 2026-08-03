import { Component } from '@angular/core';

import { PROCESS } from './../../../content/home';

// "How it works", in four steps.
//
// The steps are numbered because they genuinely happen in that order — a visitor
// deciding whether to write wants to know what writing commits them to. Numbering
// something unordered would be decoration wearing the costume of structure.
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css'],
  standalone: true,
})

export class ProcessComponent {

  public readonly steps = PROCESS;

}
