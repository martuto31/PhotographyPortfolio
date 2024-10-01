import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: 'Професионална Фотография за Сватби, Корпоративни Събития и Абитуриенти | Виктория Борисова',
    },
    {
        path: 'galleries/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: 'Галерия от Виктория Борисова',
    },
    {
        path: 'gallery/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
        title: 'Галерия от Виктория Борисова',
    },
    {
        path: 'about-me',
        loadComponent: () => import('./components/about-me/about-me.component').then(c => c.AboutMeComponent),
        title: 'За мен | Виктория Борисова | Професионален Събитиен Фотограф Във Видин и София',
    },
];
