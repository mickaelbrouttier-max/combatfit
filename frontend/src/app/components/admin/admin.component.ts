import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  reservations: any[] = [];
  vueActive: 'calendrier' | 'liste' = 'calendrier';
  dateCalendrier: Date = new Date();
  joursCalendrier: any[] = [];
  reservationSelectionnee: any = null;

  joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  moisNoms = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const password = prompt("Mot de passe admin :");
    if (password !== "Mickalpb") {
      alert("Accès refusé");
      window.location.href = "/";
    } else {
      this.charger();
    }
  }

  get labelMois(): string {
    return `${this.moisNoms[this.dateCalendrier.getMonth()]} ${this.dateCalendrier.getFullYear()}`;
  }

  private getApiUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:3000/api';
    }
    return 'https://combatfit.onrender.com/api'; 
  }

  charger() {
    const url = `${this.getApiUrl()}/reservations/all`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.reservations = data;
        this.genererCalendrier();
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement :", err)
    });
  }

  genererCalendrier() {
    const annee = this.dateCalendrier.getFullYear();
    const mois = this.dateCalendrier.getMonth();

    const premierJourIndex = new Date(annee, mois, 1).getDay();
    const premierJourAjuste = premierJourIndex === 0 ? 6 : premierJourIndex - 1;

    const joursDansMois = new Date(annee, mois + 1, 0).getDate();
    const joursDansMoisPrecedent = new Date(annee, mois, 0).getDate();

    const tempJours = [];

    // Jours de remplissage du mois précédent
    for (let i = premierJourAjuste - 1; i >= 0; i--) {
      const d = new Date(annee, mois - 1, joursDansMoisPrecedent - i);
      tempJours.push({
        date: d,
        numero: d.getDate(),
        estMoisActuel: false,
        reservations: this.getReservationsPourDate(d)
      });
    }

    // Jours du mois en cours
    for (let i = 1; i <= joursDansMois; i++) {
      const d = new Date(annee, mois, i);
      tempJours.push({
        date: d,
        numero: i,
        estMoisActuel: true,
        reservations: this.getReservationsPourDate(d)
      });
    }

    // Jours de remplissage du mois suivant
    const totalCellules = 42;
    const cellulesManquantes = totalCellules - tempJours.length;
    for (let i = 1; i <= cellulesManquantes; i++) {
      const d = new Date(annee, mois + 1, i);
      tempJours.push({
        date: d,
        numero: i,
        estMoisActuel: false,
        reservations: this.getReservationsPourDate(d)
      });
    }

    this.joursCalendrier = tempJours;
  }

  getReservationsPourDate(d: Date): any[] {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateCherchee = `${yyyy}-${mm}-${dd}`;

    return this.reservations.filter(res => {
      if (!res.date_debut) return false;
      return res.date_debut.startsWith(dateCherchee);
    }).sort((a, b) => a.date_debut.localeCompare(b.date_debut));
  }

  moisPrecedent() {
    this.dateCalendrier = new Date(this.dateCalendrier.getFullYear(), this.dateCalendrier.getMonth() - 1, 1);
    this.genererCalendrier();
  }

  moisSuivant() {
    this.dateCalendrier = new Date(this.dateCalendrier.getFullYear(), this.dateCalendrier.getMonth() + 1, 1);
    this.genererCalendrier();
  }

  ouvrirDetails(res: any) {
    this.reservationSelectionnee = res;
  }

  fermerDetails() {
    this.reservationSelectionnee = null;
  }

  calculerHeureFin(dateDebut: string): string {
    if (!dateDebut) return '';
    // dateDebut est au format 'YYYY-MM-DD HH:mm:ss'
    const heurePart = dateDebut.substring(11, 16);
    const [h, m] = heurePart.split(':').map(Number);
    let endMinutes = m + 90;
    let endHours = h + Math.floor(endMinutes / 60);
    endMinutes = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  supprimer(id: number) {
    if (confirm("Supprimer ce rendez-vous ?")) {
      const url = `${this.getApiUrl()}/reservations/${id}`;
      this.http.delete(url).subscribe({
        next: () => {
          this.fermerDetails();
          this.charger();
        },
        error: () => alert("Erreur lors de la suppression")
      });
    }
  }
}