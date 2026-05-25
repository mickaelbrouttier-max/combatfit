import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Creneau {
  debut: string;
  fin: string;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  @Output() creneauSelectionne = new EventEmitter<{ date: string; heureDebut: string; heureFin: string }>();

  dateSelectionnee: string = '';
  aujourdhui: string = '';
  heureSelectionnee: string = '';

  creneauxTheoriques: Creneau[] = [
    { debut: '09:00', fin: '10:30' },
    { debut: '10:30', fin: '12:00' },
    { debut: '13:30', fin: '15:00' },
    { debut: '15:00', fin: '16:30' },
    { debut: '16:30', fin: '18:00' }
  ];

  creneauxOccupes: Set<string> = new Set();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const dateInterne = new Date();
    const annee = dateInterne.getFullYear();
    const mois = String(dateInterne.getMonth() + 1).padStart(2, '0');
    const jour = String(dateInterne.getDate()).padStart(2, '0');
    this.aujourdhui = `${annee}-${mois}-${jour}`;
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dateSelectionnee = input.value;
    this.heureSelectionnee = '';
    this.chargerReservations();
  }

  chargerReservations(): void {
    if (!this.dateSelectionnee) return;

    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'https://combatfit.onrender.com';

    this.http.get<any[]>(`${baseUrl}/api/reservations?date=${this.dateSelectionnee}`)
      .subscribe({
        next: (rdvs) => {
          // Extraction du temps depuis 'YYYY-MM-DD HH:mm:ss'
          const nouveauxCreneaux = rdvs.map(rdv => rdv.date_debut.substring(11, 16));
          this.creneauxOccupes = new Set(nouveauxCreneaux);
          this.cdr.detectChanges();
          console.log("Créneaux occupés mis à jour :", Array.from(this.creneauxOccupes));
        },
        error: (err) => console.error('Erreur lors du chargement des créneaux', err)
      });
  }

  estReserve(debut: string): boolean {
    return this.creneauxOccupes.has(debut);
  }

  choisirCreneau(creneau: Creneau): void {
    if (this.estReserve(creneau.debut)) return;

    this.heureSelectionnee = creneau.debut;
    
    this.creneauSelectionne.emit({
      date: this.dateSelectionnee,
      heureDebut: creneau.debut,
      heureFin: creneau.fin
    });
  }
}