import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-section">
      <div class="auth-container">
        <!-- Mode Switcher -->
        <div class="auth-header">
          <button 
            [class.active]="mode() === 'login'" 
            (click)="setMode('login')"
            class="tab-btn">
            Connexion
          </button>
          <button 
            [class.active]="mode() === 'signup'" 
            (click)="setMode('signup')"
            class="tab-btn">
            Inscription
          </button>
        </div>

        <!-- Form Card -->
        <div class="auth-card">
          <h2 class="card-title">{{ mode() === 'login' ? 'Content de vous revoir !' : 'Rejoignez la team CombatFit' }}</h2>
          <p class="card-subtitle">{{ mode() === 'login' ? 'Connectez-vous pour suivre vos séances et progression.' : 'Créez un compte pour suivre vos séances, gagner des trophées et débloquer des cadeaux.' }}</p>

          <!-- Error Alert -->
          <div *ngIf="errorMessage()" class="alert-error">
            <span class="material-icons-outlined">error_outline</span>
            <p>{{ errorMessage() }}</p>
          </div>

          <form (submit)="onSubmit($event)" class="auth-form">
            <!-- Signup Fields -->
            <div *ngIf="mode() === 'signup'" class="form-row">
              <div class="form-group">
                <label for="prenom">Prénom *</label>
                <input type="text" id="prenom" name="prenom" [(ngModel)]="formData.prenom" required placeholder="Ex: Jean" />
              </div>
              <div class="form-group">
                <label for="nom">Nom *</label>
                <input type="text" id="nom" name="nom" [(ngModel)]="formData.nom" required placeholder="Ex: Dupont" />
              </div>
            </div>

            <div class="form-group">
              <label for="email">E-mail *</label>
              <input type="email" id="email" name="email" [(ngModel)]="formData.email" required placeholder="Ex: jean.dupont@email.com" />
            </div>

            <div *ngIf="mode() === 'signup'" class="form-group">
              <label for="telephone">Téléphone</label>
              <input type="tel" id="telephone" name="telephone" [(ngModel)]="formData.telephone" placeholder="Ex: 06 12 34 56 78" />
            </div>

            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input type="password" id="password" name="password" [(ngModel)]="formData.password" required placeholder="••••••••" />
            </div>

            <!-- Optional Referral Code -->
            <div *ngIf="mode() === 'signup'" class="form-group">
              <label for="codeParrain">Code Parrain (Optionnel)</label>
              <input type="text" id="codeParrain" name="codeParrain" [(ngModel)]="formData.codeParrain" placeholder="Ex: MIC1234" />
              <p class="input-info">Entrez le code d'un ami pour lui faire gagner 50 trophées !</p>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" [disabled]="loading()">
              <span *ngIf="!loading()">{{ mode() === 'login' ? 'Se connecter' : "S'inscrire" }}</span>
              <span *ngIf="loading()" class="spinner"></span>
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .auth-section {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px 140px 20px;
      background-color: var(--dark-bg);
      background-image: radial-gradient(circle at 10% 20%, rgba(208, 0, 0, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 40%);
    }

    .auth-container {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
    }

    .auth-header {
      display: flex;
      background-color: var(--dark-surface);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 30px;
      padding: 4px;
      margin-bottom: 24px;
    }

    .tab-btn {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-light-grey);
      font-size: 0.95rem;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 26px;
      cursor: pointer;
      transition: var(--transition-medium);
    }

    .tab-btn:hover {
      color: var(--text-white);
    }

    .tab-btn.active {
      background-color: var(--primary-red);
      color: var(--text-white);
      box-shadow: var(--glow-red);
    }

    .auth-card {
      background-color: var(--dark-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--border-radius-lg);
      padding: 40px;
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(10px);
    }

    .card-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 8px;
    }

    .card-subtitle {
      font-size: 0.9rem;
      color: var(--text-light-grey);
      line-height: 1.5;
      margin-bottom: 30px;
    }

    .alert-error {
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: rgba(208, 0, 0, 0.1);
      border: 1px solid var(--primary-red);
      border-radius: var(--border-radius-sm);
      padding: 12px 16px;
      margin-bottom: 24px;
      color: #ff4d4d;
    }

    .alert-error p {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-white);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-group input {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-sm);
      color: var(--text-white);
      padding: 12px 16px;
      font-size: 0.95rem;
      transition: var(--transition-fast);
      width: 100%;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary-red);
      background-color: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 10px rgba(208, 0, 0, 0.15);
    }

    .input-info {
      font-size: 0.8rem;
      color: var(--text-light-grey);
      margin: 2px 0 0 0;
    }

    .submit-btn {
      background-color: var(--primary-red);
      border: none;
      border-radius: var(--border-radius-sm);
      color: var(--text-white);
      font-size: 1rem;
      font-weight: 700;
      padding: 14px;
      cursor: pointer;
      transition: var(--transition-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
    }

    .submit-btn:hover {
      background-color: #ff1a1a;
      box-shadow: var(--glow-red);
    }

    .submit-btn:disabled {
      background-color: rgba(208, 0, 0, 0.5);
      cursor: not-allowed;
      box-shadow: none;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--text-white);
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .form-row {
        flex-direction: column;
        gap: 20px;
      }
      .auth-card {
        padding: 24px;
      }
    }
  `]
})
export class MemberAuthComponent {
  mode = signal<'login' | 'signup'>('login');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  formData = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    codeParrain: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (localStorage.getItem('member_token')) {
      this.router.navigate(['/espace-membre']);
    }
  }

  setMode(m: 'login' | 'signup') {
    this.mode.set(m);
    this.errorMessage.set('');
  }

  private getApiUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:3000/api';
    }
    return 'https://combatfit.onrender.com/api'; 
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.errorMessage.set('');

    const url = `${this.getApiUrl()}/auth/${this.mode()}`;
    const body = this.mode() === 'login' 
      ? { email: this.formData.email, password: this.formData.password }
      : this.formData;

    this.http.post<any>(url, body).subscribe({
      next: (res) => {
        this.loading.set(false);
        localStorage.setItem('member_token', res.token);
        localStorage.setItem('member_user', JSON.stringify(res.user));
        this.router.navigate(['/espace-membre']);
      },
      error: (err) => {
        this.loading.set(false);
        let msg = err.error?.message || err.error?.error || "Une erreur est survenue lors de l'authentification.";
        if (err.error?.details) {
          msg += ` (Détails : ${err.error.details})`;
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
