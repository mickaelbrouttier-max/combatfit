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

  // 1. Il manquait le constructeur pour injecter les services !
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // 2. Il manquait l'appel au chargement lors de l'initialisation
  ngOnInit() {
    const password = prompt("Mot de passe admin :");
    if (password !== "Mickalpb") {
      alert("Accès refusé");
      window.location.href = "/";
    } else {
      this.charger();
    }
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
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement :", err)
    });
  }

  supprimer(id: number) {
    if (confirm("Supprimer ce rendez-vous ?")) {
      const url = `${this.getApiUrl()}/reservations/${id}`;
      this.http.delete(url).subscribe({
        next: () => this.charger(),
        error: () => alert("Erreur lors de la suppression")
      });
    }
  }
}