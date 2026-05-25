import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { BookingModalComponent } from './components/booking-modal/booking-modal'; // Importe-le ici

@Component({
  selector: 'app-root',
  standalone: true,
  // Ajoute BookingModalComponent dans la liste ici :
  imports: [RouterOutlet, NavbarComponent, FooterComponent, BookingModalComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  constructor(public router: Router) {}
}