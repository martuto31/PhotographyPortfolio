import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateX(100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        animate('300ms ease-in-out'),
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})

export class NavigationMobileComponent {

  public isExpanderOpen = false;

  private bodyEl = document.querySelector('body') as HTMLBodyElement;

  public triggerAnimation(): void {
    this.isExpanderOpen = !this.isExpanderOpen;

    this.scrollBlock();
  }

  private scrollBlock(): void {
    if (this.isExpanderOpen) {
      const yOffset = window.scrollY;

      this.bodyEl.style.position = 'fixed';
      this.bodyEl.style.top = '-' + yOffset + 'px';
      this.bodyEl.style.height = 'calc(80% - 84px + ' + yOffset + 'px)';
    } else {
      const top = parseInt(this.bodyEl.style.top) * -1;

      this.bodyEl.style.position = '';
      this.bodyEl.style.top = '';
      this.bodyEl.style.height = '100%';

      window.scrollTo(0, top);
    }
  }

}
