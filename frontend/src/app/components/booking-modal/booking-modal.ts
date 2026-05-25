import { Component, inject, signal, effect, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ReservationComponent } from "../reservation/reservation.component";

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReservationComponent],
  template: `
    @if (bookingService.isOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog animate-fade-in-up" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Réserver ta séance</h3>
            <button class="close-btn" (click)="closeModal()" aria-label="Close booking modal">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
          @if (isSuccess()) {
  <div class="success-container">
    <span class="material-icons-outlined success-icon">check_circle</span>
    <h4 class="success-title">Demande enregistrée !</h4>
    <p class="success-desc">
      Merci <strong>{{ formData.name }}</strong>.<br>
      Ta demande pour la prestation <strong>"{{ formData.service }}"</strong> le 
      <strong>{{ formData.date }} à {{ formData.time }}</strong> a bien été enregistrée.
    </p>
    <p class="success-desc-sub">
      Un e-mail récapitulatif a été envoyé au formateur. Mathias te recontactera très prochainement pour confirmer ton rendez-vous.
    </p>
    <button class="btn btn-primary close-success-btn" (click)="closeModal()">Fermer</button>
  </div>


            } @else {
              <form (ngSubmit)="submitForm()" #bookingForm="ngForm">
                <div class="form-group">
                  <label for="service-select" class="form-label">Prestation souhaitée</label>
                  <select id="service-select" name="service" class="form-select" [(ngModel)]="formData.service" required>
                    <option value="" disabled>Choisis un accompagnement</option>
                    <option value="Préparation Physique">Préparation Physique</option>
                    <option value="Coaching Karaté">Coaching Karaté</option>
                    <option value="Suivi en Ligne">Suivi en Ligne</option>
                    <option value="Interventions">Interventions & Stages</option>
                  </select>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label for="name-input" class="form-label">Nom complet</label>
                    <input id="name-input" type="text" name="name" class="form-input" placeholder="Ex: Jean Dupont" [(ngModel)]="formData.name" required />
                  </div>
                  <div class="form-group flex-1">
                    <label for="phone-input" class="form-label">Téléphone</label>
                    <input id="phone-input" type="tel" name="phone" class="form-input" placeholder="Ex: 06 12 34 56 78" [(ngModel)]="formData.phone" required />
                  </div>
                </div>

                <div class="form-group">
                  <label for="email-input" class="form-label">Adresse Email</label>
                  <input id="email-input" type="email" name="email" class="form-input" placeholder="Ex: jean.dupont@email.com" [(ngModel)]="formData.email" required email />
                </div>

                <app-reservation (creneauSelectionne)="onCreneauRecu($event)"></app-reservation>

                <div class="form-group">
                  <label for="notes-textarea" class="form-label">Remarques ou objectifs (facultatif)</label>
                  <textarea id="notes-textarea" name="notes" class="form-textarea" rows="3" [(ngModel)]="formData.notes"></textarea>
                </div>

                <button type="submit" class="btn btn-primary submit-btn" [disabled]="!bookingForm.valid || isSubmitting() || !formData.date || !formData.time">
                  {{ isSubmitting() ? 'Envoi en cours...' : 'Envoyer ma demande' }}
                </button>
              </form>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
  .form-select {
      background-color: #18181b; /* Fond sombre */
      color: #ffffff;
      border: 1px solid #3f3f46;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
    }

    /* Style des options (Compatible sur la plupart des navigateurs modernes) */
    select option {
      background-color: #27272a; /* Couleur de fond des options */
      color: #ffffff;            /* Couleur du texte */
      padding: 10px;             /* Un peu d'espace */
    }

    /* Effet au survol ou sélection (selon OS) */
    select option:checked,
    select option:hover {
      background-color: #d00000; /* Ton rouge caractéristique */
      color: white;
    }
  .success-desc { font-size: 1.1rem; line-height: 1.6; color: #e4e4e7; margin-bottom: 20px; }
.success-desc-sub { font-size: 0.95rem; color: #a1a1aa; font-style: italic; margin-bottom: 25px; }
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(5, 5, 7, 0.85); backdrop-filter: blur(12px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-dialog { background-color: var(--dark-surface); border: 1px solid var(--dark-border); border-radius: var(--border-radius-md); width: 100%; max-width: 580px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-lg), 0 0 40px rgba(208, 0, 0, 0.15); animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--dark-border); display: flex; align-items: center; justify-content: space-between; }
    .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .submit-btn { width: 100%; margin-top: 10px; }
    .submit-btn:disabled { background-color: #3f3f46; cursor: not-allowed; }
    .success-container { text-align: center; padding: 30px 10px; }
    .success-icon { color: #25D366; font-size: 4rem; margin-bottom: 16px; }
    @media (max-width: 600px) { .form-row { flex-direction: column; gap: 0; } }
  `]
})
export class BookingModalComponent {
  readonly bookingService = inject(BookingService);
  private http = inject(HttpClient);

  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);

  @ViewChild(ReservationComponent) reservationComp!: ReservationComponent;

  formData = {
    service: '',
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    notes: '',
  };

  constructor() {
    effect(() => {
      const selected = this.bookingService.selectedService();
      if (selected) this.formData.service = selected;
    });
  }

  onCreneauRecu(data: { date: string; heureDebut: string; heureFin: string }) {
    this.formData.date = data.date;
    this.formData.time = data.heureDebut;
  }

  closeModal() {
    this.bookingService.close();
    this.isSuccess.set(false);
    this.isSubmitting.set(false);
  }

  submitForm() {
    console.log("CLIC DETECTE : La fonction submitForm est appelée !");
    this.isSubmitting.set(true);
const baseUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://combatfit.onrender.com';

 const payload = {
  nom_client: this.formData.name,
  email_client: this.formData.email,
  telephone_client: this.formData.phone,
  prestation: this.formData.service,
  date_debut: this.formData.date, // Attention, c'est ce que le serveur attend en 1er
  date_fin: this.formData.time,   // Et ça en 2ème pour le calcul
  remarques: this.formData.notes
};

this.http.post(`${baseUrl}/api/reservations`, payload).subscribe({
    next: () => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);

        alert("Réservation enregistrée avec succès ! Un e-mail a été transmis au formateur.");
        if (this.reservationComp) {
          // 1. Mise à jour du Set local pour un feedback instantané
          this.reservationComp.creneauxOccupes.add(this.formData.time);
          
          // 2. Synchronisation réelle avec la base (avec forçage de rendu via cdr)
          this.reservationComp.chargerReservations();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error("ERREUR DÉTAILLÉE :", err);
        alert('Erreur : ' + (err.error?.message || 'Problème de connexion.'));
      }
    });
  }
}