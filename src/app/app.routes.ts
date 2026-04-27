import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: 'Сватбен и Събитиен Фотограф София и Видин | Виктория Борисова — phbyviki',
    },

    // Bulgarian (canonical) gallery routes
    {
        path: 'galerii/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: 'Галерия | Сватби, Абитуриенти, Кръщенета | Виктория Борисова',
    },
    {
        path: 'galeriya/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
        title: 'Фотосесия | Галерия | Виктория Борисова',
    },

    // Legacy English routes — kept and redirected for backwards compatibility / SEO continuity
    { path: 'galleries/Weddings', redirectTo: 'galerii/svatbi', pathMatch: 'full' },
    { path: 'galleries/Graduates', redirectTo: 'galerii/abiturienti', pathMatch: 'full' },
    { path: 'galleries/Personal', redirectTo: 'galeriya/lichni', pathMatch: 'full' },
    { path: 'gallery/Personal', redirectTo: 'galeriya/lichni', pathMatch: 'full' },
    {
        path: 'galleries/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: 'Галерия | Виктория Борисова',
    },
    {
        path: 'gallery/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
        title: 'Фотосесия | Галерия | Виктория Борисова',
    },

    {
        path: 'about-me',
        loadComponent: () => import('./components/about-me/about-me.component').then(c => c.AboutMeComponent),
        title: 'За мен | Виктория Борисова — Фотограф София и Видин',
    },
];
