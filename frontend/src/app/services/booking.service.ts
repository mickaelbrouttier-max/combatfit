import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // 1. Import nécessaire

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient); // 2. Injection du client HTTP
  private readonly apiUrl = 'http://localhost:3000/api/reservations';

  private readonly modalOpen = signal(false);
  private readonly activeService = signal<string>('');

  readonly isOpen = this.modalOpen.asReadonly();
  readonly selectedService = this.activeService.asReadonly();

  // 3. Méthode pour récupérer les créneaux avec la date (Correction du bug)
  getReservations(date: string) {
    const params = new HttpParams().set('date', date);
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // 4. Méthode pour envoyer la réservation (ton POST)
  createReservation(formData: any) {
    return this.http.post(this.apiUrl, formData);
  }

  open(serviceName: string = '') {
    this.activeService.set(serviceName);
    this.modalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modalOpen.set(false);
    this.activeService.set('');
    document.body.style.overflow = '';
  }
}