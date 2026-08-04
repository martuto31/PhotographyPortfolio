import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { FooterComponent } from './footer/footer.component';
import { LandingComponent } from './../landing/landing.component';
import { NavigationComponent } from './navigation/navigation.component';
import { ContactBarComponent } from './contact-bar/contact-bar.component';

import { DimensionService } from './../../services/dimension.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    LandingComponent,
    NavigationComponent,
    ContactBarComponent,
  ],
})

export class LayoutComponent implements OnInit, OnDestroy {

    constructor(
        public dimensionService: DimensionService,
        private router: Router) { }

    // The header is fixed and overlays the page. On the home page it starts
    // transparent over the hero photograph, so the content must begin at y=0;
    // everywhere else the page has to start below the header instead. Both the
    // wrapper's padding and the nav's own styling key off this one flag.
    public isHome = true;

    private routerSubscription?: Subscription;

    public ngOnInit(): void {
        this.isHome = this.isHomeUrl(this.router.url);

        this.routerSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.isHome = this.isHomeUrl(event.urlAfterRedirects);
            }
        });
    }

    public ngOnDestroy(): void {
        this.routerSubscription?.unsubscribe();
    }

    private isHomeUrl(url: string): boolean {
        return url.split(/[?#]/)[0] === '/';
    }

}
