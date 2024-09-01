import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: '',
    },
    {
        path: 'galleries/wedding',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
        data: { galleryType: 'wedding' },
    },
    {
        path: 'galleries/graduates',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
        data: { galleryType: 'graduates' },
    },
    {
        path: 'galleries/personal',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
        data: { galleryType: 'personal' },
    },
    {
        path: 'gallery',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
        title: '',
    },
];
