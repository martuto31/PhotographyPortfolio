import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: '',
    },
    {
        path: 'galleries/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
    },
    {
        path: 'gallery/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
        title: '',
    },
];
