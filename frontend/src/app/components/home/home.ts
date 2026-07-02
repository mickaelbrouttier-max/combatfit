import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
import { HighlightsComponent } from '../highlights/highlights';
import { AboutComponent } from '../about/about';
import { GalleryComponent } from '../gallery/gallery';
import { ServicesComponent } from '../services/services';
import { VideosComponent } from '../videos/videos';
import { TestimonialsComponent } from '../testimonials/testimonials';
import { ContactComponent } from '../contact/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  // C'est ici que tu listes tout ce que tu affiches sur la page d'accueil
  imports: [
    HeroComponent, 
    HighlightsComponent, 
    AboutComponent, 
    GalleryComponent,
    ServicesComponent, 
    VideosComponent,
    TestimonialsComponent, 
    ContactComponent
  ],
  templateUrl: '../../home.component.html',
})
export class HomeComponent {}