import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

interface UserProfile {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  xp: number;
  points: number;
  niveau: number;
  code_parrainage: string;
  profil_complete?: boolean;
  objectifs_visites?: boolean;
}

interface StatRecord {
  id?: number;
  date: string;
  poids: number | null;
  force_pompes: number | null;
  endurance_gainage: number | null;
  souplesse: number | null;
  cardio_vo2: number | null;
}

interface BadgeItem {
  id: number;
  nom: string;
  description: string;
  icone: string;
  type: string;
  seuil: number;
  unlocked: boolean;
}

interface RewardItem {
  id: number;
  nom: string;
  description: string;
  cout_points: number;
  stock: number;
}

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-section">
      <div class="container">
        
        <!-- Header / Profil -->
        <div class="member-header-card" *ngIf="profile()">
          <div class="profile-info-left">
            <div class="avatar-circle">
              {{ profile()?.prenom?.charAt(0) }}{{ profile()?.nom?.charAt(0) }}
            </div>
            <div>
              <p class="welcome-text">Ravi de vous voir,</p>
              <h2 class="member-name">{{ profile()?.prenom }} {{ profile()?.nom }}</h2>
              <span class="belt-badge" [ngClass]="getBeltClass(profile()?.niveau || 1)">
                Ceinture {{ getBeltName(profile()?.niveau || 1) }} (Niv. {{ profile()?.niveau }})
              </span>
            </div>
          </div>
          
          <div class="profile-info-right">
            <div class="stat-box">
              <span class="material-icons-outlined stat-icon trophy">emoji_events</span>
              <div class="stat-vals">
                <span class="stat-number">{{ profile()?.points }}</span>
                <span class="stat-label">Trophées</span>
              </div>
            </div>
            <div class="stat-box parrainage-box">
              <span class="material-icons-outlined stat-icon share">share</span>
              <div class="stat-vals">
                <div class="code-copy-row">
                  <span class="stat-number code">{{ profile()?.code_parrainage }}</span>
                  <button (click)="copyReferralCode()" class="copy-btn" title="Copier le code">
                    <span class="material-icons-outlined">content_copy</span>
                  </button>
                </div>
                <span class="stat-label">Code Parrainage</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Barre d'XP -->
        <div class="xp-container-card" *ngIf="profile()">
          <div class="xp-labels">
            <span>Progression du Niveau {{ profile()?.niveau }}</span>
            <span>{{ getXpInCurrentLevel(profile()?.xp || 0) }} / 100 XP</span>
          </div>
          <div class="xp-bar-bg">
            <div class="xp-bar-fill" [style.width]="getXpPercentage(profile()?.xp || 0) + '%'"></div>
          </div>
          <p class="xp-hint">Prochain niveau : Ceinture {{ getBeltName((profile()?.niveau || 1) + 1) }} ➔ +50 XP requis</p>
        </div>

        <!-- Navigation par Onglets -->
        <div class="dashboard-tabs">
          <button [class.active]="activeTab() === 'seances'" (click)="activeTab.set('seances')">
            <span class="material-icons-outlined">calendar_today</span> Séances
          </button>
          <button [class.active]="activeTab() === 'progression'" (click)="activeTab.set('progression')">
            <span class="material-icons-outlined">trending_up</span> Progression
          </button>
          <button [class.active]="activeTab() === 'objectifs'" (click)="selectObjectivesTab()">
            <span class="material-icons-outlined">track_changes</span> Objectifs
          </button>
          <button [class.active]="activeTab() === 'badges'" (click)="selectBadgesTab()" class="badges-tab-btn">
            <span class="material-icons-outlined">emoji_events</span> Badges
            <span *ngIf="unseenBadgesCount() > 0" class="tab-notification-badge">{{ unseenBadgesCount() }}</span>
          </button>
          <button [class.active]="activeTab() === 'boutique'" (click)="activeTab.set('boutique')">
            <span class="material-icons-outlined">storefront</span> Boutique
          </button>
          <button [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">
            <span class="material-icons-outlined">person</span> Profil
          </button>
          <button class="logout-btn-tab" (click)="logout()">
            <span class="material-icons-outlined">logout</span> Quitter
          </button>
        </div>

        <!-- Contenu des Onglets -->
        <div class="tab-content-card">
          
          <!-- Onglet Séances -->
          <div *ngIf="activeTab() === 'seances'">
            <h3 class="tab-title">Historique de vos séances</h3>
            
            <div *ngIf="reservations().length === 0" class="empty-state">
              <span class="material-icons-outlined empty-icon">event_busy</span>
              <p>Vous n'avez pas encore de réservations liées à votre compte.</p>
              <button (click)="goToBooking()" class="action-btn">Réserver une séance (+50 XP)</button>
            </div>

            <div *ngIf="reservations().length > 0" class="seances-list">
              <div *ngFor="let res of reservations()" class="seance-card" [class.past]="isPastDate(res.date_debut)">
                <div class="seance-info">
                  <span class="material-icons-outlined seance-icon">fitness_center</span>
                  <div>
                    <h4>{{ res.prestation }}</h4>
                    <p class="seance-date">
                      Le {{ formatDate(res.date_debut) }} de {{ formatTime(res.date_debut) }} à {{ formatTime(res.date_fin) }}
                    </p>
                  </div>
                </div>
                <div class="seance-actions-col">
                  <div class="seance-status">
                    <span class="status-badge" [class.upcoming]="!isPastDate(res.date_debut)" [class.passed]="isPastDate(res.date_debut)">
                      {{ isPastDate(res.date_debut) ? 'Effectuée (+50 XP)' : 'À venir' }}
                    </span>
                  </div>
                  <!-- Option avis pour séance passée -->
                  <div *ngIf="isPastDate(res.date_debut)" class="review-action-container">
                    <button *ngIf="!res.avis_laisse" (click)="openReviewPrompt(res)" class="review-btn-action">
                      <span class="material-icons-outlined">rate_review</span> Laisser un avis (+50 🏆)
                    </button>
                    <span *ngIf="res.avis_laisse" class="review-done-badge">
                      <span class="material-icons-outlined">done</span> Avis laissé (+50 🏆)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Progression -->
          <div *ngIf="activeTab() === 'progression'">
            <h3 class="tab-title">Suivi de vos performances physiques</h3>
            
            <!-- Choix de la métrique pour le graphique -->
            <div class="metric-selector">
              <button [class.active]="activeMetric() === 'poids'" (click)="activeMetric.set('poids')">Poids (kg)</button>
              <button [class.active]="activeMetric() === 'pompes'" (click)="activeMetric.set('pompes')">Pompes (max)</button>
              <button [class.active]="activeMetric() === 'gainage'" (click)="activeMetric.set('gainage')">Gainage (sec)</button>
            </div>

            <!-- Graphique SVG dynamique -->
            <div class="chart-container" *ngIf="stats().length > 1; else noChart">
              <svg viewBox="0 0 500 220" class="progression-chart">
                <!-- Dégradé sous la courbe -->
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary-red)" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="var(--primary-red)" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- Lignes de fond -->
                <line x1="50" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
                <line x1="50" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
                <line x1="50" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>

                <!-- Tracé de la courbe et zone remplie -->
                <path [attr.d]="getAreaPath()" fill="url(#chart-grad)"/>
                <path [attr.d]="getLinePath()" fill="none" stroke="var(--primary-red)" stroke-width="3"/>

                <!-- Points de données -->
                <g *ngFor="let pt of getChartPoints(); let idx = index" class="chart-point-group">
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="5" fill="var(--primary-red)" stroke="var(--text-white)" stroke-width="1.5" class="chart-point" />
                  <!-- Tooltip de valeur -->
                  <text [attr.x]="pt.x" [attr.y]="pt.y - 12" text-anchor="middle" fill="var(--text-white)" font-size="10" font-weight="600" class="chart-value-text">
                    {{ pt.val }}
                  </text>
                  <!-- Labels de date -->
                  <text [attr.x]="pt.x" y="180" text-anchor="middle" fill="var(--text-light-grey)" font-size="8">
                    {{ pt.dateLabel }}
                  </text>
                </g>
              </svg>
            </div>
            <ng-template #noChart>
              <div class="empty-state chart-empty">
                <span class="material-icons-outlined empty-icon">show_chart</span>
                <p>Enregistrez au moins 2 mesures pour afficher votre graphique de progression.</p>
              </div>
            </ng-template>

            <!-- Formulaire d'ajout de mesures -->
            <div class="stats-form-container">
              <h4>Enregistrer de nouvelles mesures aujourd'hui</h4>
              <form (submit)="saveStats($event)" class="stats-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="poids">Poids (kg)</label>
                    <input type="number" id="poids" name="poids" [(ngModel)]="newStat.poids" step="0.1" placeholder="Ex: 72.5" />
                  </div>
                  <div class="form-group">
                    <label for="pompes">Pompes max d'affilée</label>
                    <input type="number" id="pompes" name="pompes" [(ngModel)]="newStat.force_pompes" placeholder="Ex: 35" />
                  </div>
                  <div class="form-group">
                    <label for="gainage">Gainage max (sec)</label>
                    <input type="number" id="gainage" name="gainage" [(ngModel)]="newStat.endurance_gainage" placeholder="Ex: 120" />
                  </div>
                </div>
                <button type="submit" class="action-btn submit-stats-btn" [disabled]="statsLoading()">
                  <span *ngIf="!statsLoading()">Enregistrer les données</span>
                  <span *ngIf="statsLoading()" class="spinner"></span>
                </button>
              </form>
            </div>
          </div>

          <!-- Onglet Badges -->
          <div *ngIf="activeTab() === 'badges'">
            <h3 class="tab-title">Vos trophées & distinctions</h3>
            <p class="tab-subtitle">Relevez des défis, parrainez vos amis et assistez aux entraînements pour débloquer tous les badges.</p>

            <div class="badges-grid">
              <div *ngFor="let b of badges()" class="badge-card" [class.unlocked]="b.unlocked">
                <div class="badge-icon-container">
                  <span class="material-icons-outlined badge-md-icon">{{ b.icone }}</span>
                  <span *ngIf="!b.unlocked" class="material-icons-outlined lock-overlay">lock</span>
                </div>
                <h4 class="badge-name">{{ b.nom }}</h4>
                <p class="badge-desc">{{ b.description }}</p>
                <span class="badge-status-label">{{ b.unlocked ? 'Débloqué' : 'Verrouillé' }}</span>
              </div>
            </div>
          </div>

          <!-- Onglet Boutique -->
          <div *ngIf="activeTab() === 'boutique'">
            <div class="boutique-header">
              <div>
                <h3 class="tab-title">Boutique de Récompenses</h3>
                <p class="tab-subtitle">Échangez vos trophées contre des cadeaux exclusifs CombatFit.</p>
              </div>
              <div class="trophy-count-header">
                <span class="material-icons-outlined">emoji_events</span>
                <span>{{ profile()?.points }} trophées dispo</span>
              </div>
            </div>

            <!-- Boutique Alerts -->
            <div *ngIf="boutiqueMessage()" class="alert-info-boutique" [class.success]="boutiqueSuccess()">
              <p>{{ boutiqueMessage() }}</p>
            </div>

            <!-- Promo Pack Banner -->
            <div class="pack-promo-banner">
              <div class="pack-promo-content">
                <div>
                  <h4 class="pack-promo-title">Vous souhaitez accélérer votre progression ?</h4>
                  <p class="pack-promo-desc">Achetez un pack d'entraînement (séances de coaching) et gagnez instantanément un bonus de trophées !</p>
                </div>
                <button (click)="buyPack()" class="pack-promo-btn" [disabled]="packBuying()">
                  <span *ngIf="!packBuying()"><span class="material-icons-outlined">shopping_cart</span> Acheter un pack (+150 🏆)</span>
                  <span *ngIf="packBuying()" class="spinner btn-spinner"></span>
                </button>
              </div>
            </div>

            <div class="rewards-grid">
              <div *ngFor="let r of rewards()" class="reward-card">
                <div class="reward-image-container" [class.tshirt-container]="r.nom.includes('T-Shirt')">
                  <ng-container *ngIf="r.nom.includes('T-Shirt')">
                    <img src="images/tshirt_front.png" class="reward-img tshirt-front" [alt]="r.nom" />
                    <img src="images/tshirt_back.png" class="reward-img tshirt-back" [alt]="r.nom" />
                  </ng-container>
                  <img *ngIf="r.nom.includes('Séance')" src="images/service_physique.png" [alt]="r.nom" class="reward-img" />
                  <div *ngIf="!r.nom.includes('T-Shirt') && !r.nom.includes('Séance')" class="reward-image-placeholder">
                    <span class="material-icons-outlined reward-gift-icon">card_giftcard</span>
                  </div>
                </div>
                <div class="reward-details">
                  <h4 class="reward-name">{{ r.nom }}</h4>
                  <p class="reward-desc">{{ r.description }}</p>
                  <div class="reward-bottom">
                    <span class="reward-cost">
                      <span class="material-icons-outlined cost-icon">emoji_events</span>
                      {{ r.cout_points }} Trophées
                    </span>
                    <button 
                      (click)="redeemReward(r)" 
                      [disabled]="(profile()?.points || 0) < r.cout_points || redeemLoading() === r.id"
                      class="redeem-btn">
                      <span *ngIf="redeemLoading() !== r.id">Échanger</span>
                      <span *ngIf="redeemLoading() === r.id" class="spinner btn-spinner"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Objectifs -->
          <div *ngIf="activeTab() === 'objectifs'">
            <h3 class="tab-title">Mes Objectifs & Défis</h3>
            <p class="tab-subtitle">Relevez ces défis physiques pour booster votre niveau et débloquer des badges exclusifs.</p>
            
            <div class="objectives-list">
              <div class="objective-card">
                <div class="objective-header">
                  <span class="material-icons-outlined obj-icon">directions_run</span>
                  <div>
                    <h4>Première séance réalisée</h4>
                    <p>Assistez à votre premier entraînement avec Mathias.</p>
                  </div>
                  <span class="obj-reward">+100 🏆</span>
                </div>
              </div>
              
              <div class="objective-card">
                <div class="objective-header">
                  <span class="material-icons-outlined obj-icon">bolt</span>
                  <div>
                    <h4>Machine de guerre (Pompes)</h4>
                    <p>Validez une série de 50 pompes d'affilée dans votre onglet Progression.</p>
                  </div>
                  <span class="obj-reward">Badge 🏆</span>
                </div>
              </div>

              <div class="objective-card">
                <div class="objective-header">
                  <span class="material-icons-outlined obj-icon">timer</span>
                  <div>
                    <h4>Force tranquille (Gainage)</h4>
                    <p>Tenez 3 minutes (180s) de gainage planche.</p>
                  </div>
                  <span class="obj-reward">Badge 🏆</span>
                </div>
              </div>

              <div class="objective-card">
                <div class="objective-header">
                  <span class="material-icons-outlined obj-icon">share</span>
                  <div>
                    <h4>Parrainer un ami</h4>
                    <p>Partagez votre code unique. Votre ami gagne à l'inscription et vous gagnez un bonus.</p>
                  </div>
                  <span class="obj-reward">+200 🏆</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Profil -->
          <div *ngIf="activeTab() === 'profile'">
            <h3 class="tab-title">Mon Profil CombatFit</h3>
            <p class="tab-subtitle">Complétez vos coordonnées pour que Mathias puisse vous contacter rapidement.</p>
            
            <form (submit)="updateProfile($event)" class="profile-edit-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="prof-prenom">Prénom *</label>
                  <input type="text" id="prof-prenom" name="prenom" [(ngModel)]="profileData.prenom" required />
                </div>
                <div class="form-group">
                  <label for="prof-nom">Nom *</label>
                  <input type="text" id="prof-nom" name="nom" [(ngModel)]="profileData.nom" required />
                </div>
              </div>
              <div class="form-group">
                <label for="prof-email">Adresse E-mail (Non modifiable)</label>
                <input type="email" id="prof-email" name="email" [value]="profile()?.email" disabled />
              </div>
              <div class="form-group">
                <label for="prof-tel">Numéro de Téléphone *</label>
                <input type="text" id="prof-tel" name="telephone" [(ngModel)]="profileData.telephone" required placeholder="Ex: 06 12 34 56 78" />
                <p class="input-info" *ngIf="!profile()?.profil_complete">Renseignez votre téléphone pour compléter votre profil et gagner 10 🏆 !</p>
              </div>
              
              <button type="submit" class="action-btn" [disabled]="profileSaving()">
                <span *ngIf="!profileSaving()">Enregistrer le profil</span>
                <span *ngIf="profileSaving()" class="spinner btn-spinner"></span>
              </button>
            </form>
          </div>

        </div>

      </div>

      <!-- Modal Déverrouillage de Badge (Haut Fait / Jeu Vidéo Style) -->
      <div *ngIf="activeUnlockNotification()" class="unlock-backdrop">
        <div class="unlock-card">
          <!-- Effet de lumière / rayons tournants en arrière-plan -->
          <div class="unlock-glow-container">
            <div class="unlock-rays"></div>
          </div>
          
          <div class="unlock-content">
            <span class="unlock-title">SUCCÈS DÉVERROUILLÉ !</span>
            
            <div class="unlock-badge-showcase">
              <div class="unlock-badge-circle">
                <span class="material-icons-outlined unlock-badge-icon">
                  {{ activeUnlockNotification()?.icone }}
                </span>
              </div>
            </div>
            
            <h3 class="unlock-badge-name">{{ activeUnlockNotification()?.nom }}</h3>
            <p class="unlock-badge-desc">{{ activeUnlockNotification()?.description }}</p>
            
            <button (click)="closeUnlockNotification()" class="unlock-confirm-btn">
              <span class="material-icons-outlined">workspace_premium</span> Voir mes badges
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Laisser un Avis -->
      <div *ngIf="activeReviewReservation()" class="unlock-backdrop">
        <div class="unlock-card review-modal-card">
          <div class="unlock-content">
            <span class="unlock-title">LAISSER UN AVIS</span>
            <h3>Votre avis sur la séance : {{ activeReviewReservation()?.prestation }}</h3>
            <p class="unlock-badge-desc">Votre avis aide Mathias à améliorer ses coachings et vous rapporte 50 🏆 !</p>
            
            <div class="review-textarea-container">
              <textarea [(ngModel)]="reviewText" placeholder="Écrivez votre commentaire ici (ex: Super séance, très intense, Mathias est au top !)..." class="review-textarea"></textarea>
            </div>
            
            <div class="review-modal-actions">
              <button (click)="activeReviewReservation.set(null)" class="btn btn-secondary">Annuler</button>
              <button (click)="submitReview()" class="action-btn" [disabled]="reviewSaving() || !reviewText.trim()">
                <span *ngIf="!reviewSaving()">Publier l'avis (+50 🏆)</span>
                <span *ngIf="reviewSaving()" class="spinner btn-spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dashboard-section {
      background-color: var(--dark-bg);
      color: var(--text-white);
      padding: 30px 0 60px 0;
      min-height: 85vh;
      position: relative;
    }



    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Header Profil */
    .member-header-card {
      background-color: var(--dark-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--border-radius-lg);
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
      flex-wrap: wrap;
      gap: 20px;
    }

    .profile-info-left {
      display: flex;
      align-items: center;
      gap: 20px;
      text-align: left;
    }

    .avatar-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background-color: var(--primary-red);
      color: var(--text-white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 800;
      box-shadow: var(--glow-red);
      border: 2px solid var(--text-white);
      text-transform: uppercase;
    }

    .welcome-text {
      font-size: 0.9rem;
      color: var(--text-light-grey);
      margin: 0;
    }

    .member-name {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 4px 0;
    }

    .belt-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    /* Ceintures colorées */
    .belt-white { background-color: #ffffff; color: #000000; }
    .belt-yellow { background-color: #ffd700; color: #000000; }
    .belt-orange { background-color: #ff8c00; color: #ffffff; }
    .belt-green { background-color: #228b22; color: #ffffff; }
    .belt-blue { background-color: #1e90ff; color: #ffffff; }
    .belt-brown { background-color: #8b4513; color: #ffffff; }
    .belt-black { background-color: #000000; color: #ffffff; border: 1px solid var(--primary-red); }

    .profile-info-right {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .stat-box {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 150px;
    }

    .stat-icon {
      font-size: 2.2rem;
      color: var(--primary-red);
    }

    .stat-icon.trophy { color: #ffd700; }
    .stat-icon.share { color: #00bfff; }

    .stat-vals {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .stat-number {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-white);
    }

    .stat-number.code {
      letter-spacing: 0.05em;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-light-grey);
    }

    .code-copy-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .copy-btn {
      background: none;
      border: none;
      color: var(--text-light-grey);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      transition: var(--transition-fast);
    }

    .copy-btn:hover {
      color: var(--primary-red);
      background-color: rgba(255, 255, 255, 0.05);
    }

    /* Barre d'XP */
    .xp-container-card {
      background-color: var(--dark-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--border-radius-lg);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
      text-align: left;
    }

    .xp-labels {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 10px;
    }

    .xp-bar-bg {
      height: 12px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .xp-bar-fill {
      height: 100%;
      background-color: var(--primary-red);
      border-radius: 6px;
      box-shadow: var(--glow-red);
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .xp-hint {
      font-size: 0.8rem;
      color: var(--text-light-grey);
      margin: 0;
    }

    /* Navigation par Onglets */
    .dashboard-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .dashboard-tabs button {
      background-color: var(--dark-surface);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-light-grey);
      padding: 12px 20px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: var(--transition-medium);
    }

    .badges-tab-btn {
      position: relative;
    }
    
    .tab-notification-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background-color: var(--primary-red);
      color: var(--text-white);
      font-size: 0.7rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--glow-red);
      border: 1.5px solid var(--dark-surface);
      animation: pulse-badge 2s infinite ease-in-out;
    }

    @keyframes pulse-badge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    .dashboard-tabs button:hover {
      color: var(--text-white);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .dashboard-tabs button.active {
      background-color: var(--text-white);
      color: var(--dark-bg);
      border-color: var(--text-white);
    }

    .dashboard-tabs .logout-btn-tab {
      margin-left: auto;
      background-color: rgba(208, 0, 0, 0.15);
      border-color: rgba(208, 0, 0, 0.3);
      color: var(--primary-red);
    }

    .dashboard-tabs .logout-btn-tab:hover {
      background-color: var(--primary-red);
      color: var(--text-white);
      box-shadow: var(--glow-red);
    }

    /* Contenu Onglet */
    .tab-content-card {
      background-color: var(--dark-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--border-radius-lg);
      padding: 40px;
      box-shadow: var(--shadow-md);
      text-align: left;
    }

    .tab-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .tab-subtitle {
      font-size: 0.9rem;
      color: var(--text-light-grey);
      margin-bottom: 30px;
    }

    /* Empty state */
    .empty-state {
      padding: 50px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-icon {
      font-size: 4rem;
      color: rgba(255, 255, 255, 0.1);
    }

    .empty-state p {
      font-size: 1rem;
      color: var(--text-light-grey);
      margin: 0;
    }

    .action-btn {
      background-color: var(--primary-red);
      border: none;
      color: var(--text-white);
      font-weight: 700;
      padding: 12px 24px;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: var(--transition-medium);
    }

    .action-btn:hover {
      background-color: #ff1a1a;
      box-shadow: var(--glow-red);
    }

    /* Liste séances */
    .seances-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .seance-card {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: var(--transition-fast);
    }

    .seance-card:hover {
      background-color: rgba(255, 255, 255, 0.04);
      border-color: rgba(208, 0, 0, 0.2);
    }

    .seance-card.past {
      opacity: 0.7;
    }

    .seance-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .seance-icon {
      font-size: 2rem;
      color: var(--primary-red);
      background-color: rgba(208, 0, 0, 0.1);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .seance-info h4 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .seance-date {
      font-size: 0.85rem;
      color: var(--text-light-grey);
      margin: 0;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .status-badge.upcoming {
      background-color: rgba(30, 144, 255, 0.15);
      color: #1e90ff;
      border: 1px solid #1e90ff;
    }

    .status-badge.passed {
      background-color: rgba(34, 139, 34, 0.15);
      color: #32cd32;
      border: 1px solid #228b22;
    }

    /* Onglet Progression / Graphique */
    .metric-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .metric-selector button {
      background-color: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-light-grey);
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: var(--transition-fast);
    }

    .metric-selector button.active {
      background-color: var(--primary-red);
      color: var(--text-white);
      border-color: var(--primary-red);
      box-shadow: var(--glow-red);
    }

    .chart-container {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      padding: 20px;
      margin-bottom: 30px;
    }

    .progression-chart {
      width: 100%;
      height: auto;
      max-height: 250px;
    }

    .chart-point-group {
      cursor: pointer;
    }
    
    .chart-value-text {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      pointer-events: none;
    }
    
    .chart-point {
      transition: r 0.2s ease, fill 0.2s ease, stroke-width 0.2s ease;
    }
    
    .chart-point-group:hover .chart-value-text {
      opacity: 1;
    }
    
    .chart-point-group:hover .chart-point {
      r: 7;
      fill: var(--primary-red);
      stroke: var(--text-white);
      stroke-width: 2px;
    }

    .chart-empty {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      margin-bottom: 30px;
    }

    /* Formulaire stats */
    .stats-form-container {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      padding: 24px;
    }

    .stats-form-container h4 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .stats-form .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .stats-form .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stats-form label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-light-grey);
    }

    .stats-form input {
      background-color: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--border-radius-sm);
      color: var(--text-white);
      padding: 10px 14px;
      font-size: 0.9rem;
    }

    .stats-form input:focus {
      outline: none;
      border-color: var(--primary-red);
    }

    .submit-stats-btn {
      width: 100%;
    }

    /* Onglet Badges */
    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .badge-card {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      padding: 24px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: var(--transition-medium);
      opacity: 0.5;
    }

    .badge-card.unlocked {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.03);
      border-color: rgba(208, 0, 0, 0.2);
      box-shadow: 0 0 15px rgba(208, 0, 0, 0.05);
    }

    .badge-icon-container {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .badge-card.unlocked .badge-icon-container {
      background-color: rgba(208, 0, 0, 0.1);
      border-color: var(--primary-red);
      color: var(--primary-red);
      box-shadow: var(--glow-red);
    }

    .badge-md-icon {
      font-size: 2rem;
    }

    .lock-overlay {
      position: absolute;
      font-size: 1.2rem;
      background-color: rgba(0, 0, 0, 0.85);
      border-radius: 50%;
      padding: 4px;
      bottom: -6px;
      right: -6px;
      color: var(--text-light-grey);
    }

    .badge-name {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 6px 0;
    }

    .badge-desc {
      font-size: 0.8rem;
      color: var(--text-light-grey);
      margin: 0 0 16px 0;
      line-height: 1.4;
      flex-grow: 1;
    }

    .badge-status-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-light-grey);
    }

    .badge-card.unlocked .badge-status-label {
      color: var(--primary-red);
    }

    /* Boutique */
    .boutique-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .trophy-count-header {
      background-color: rgba(255, 223, 0, 0.1);
      border: 1px solid #ffd700;
      color: #ffd700;
      font-weight: 700;
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rewards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .reward-card {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: var(--transition-medium);
    }

    .reward-card:hover {
      transform: translateY(-4px);
      border-color: rgba(255,255,255,0.15);
    }

    .reward-image-placeholder {
      height: 140px;
      background-color: rgba(255, 255, 255, 0.01);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reward-gift-icon {
      font-size: 3.5rem;
      color: rgba(255,255,255,0.06);
    }

    .reward-details {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 8px;
    }

    .reward-name {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
    }

    .reward-desc {
      font-size: 0.85rem;
      color: var(--text-light-grey);
      margin: 0 0 10px 0;
      line-height: 1.4;
      flex-grow: 1;
    }

    .reward-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }

    .reward-cost {
      font-weight: 700;
      color: #ffd700;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.95rem;
    }

    .cost-icon {
      font-size: 1.2rem;
    }

    .redeem-btn {
      background-color: var(--primary-red);
      border: none;
      color: var(--text-white);
      padding: 8px 16px;
      border-radius: var(--border-radius-sm);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .redeem-btn:hover:not(:disabled) {
      background-color: #ff1a1a;
      box-shadow: var(--glow-red);
    }

    .redeem-btn:disabled {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-light-grey);
      cursor: not-allowed;
    }

    .alert-info-boutique {
      background-color: rgba(208, 0, 0, 0.1);
      border: 1px solid var(--primary-red);
      color: #ff4d4d;
      border-radius: var(--border-radius-sm);
      padding: 12px 16px;
      margin-bottom: 24px;
    }

    .alert-info-boutique.success {
      background-color: rgba(34, 139, 34, 0.1);
      border-color: #228b22;
      color: #32cd32;
    }

    .alert-info-boutique p {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--text-white);
      animation: spin 1s ease-in-out infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .member-header-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .profile-info-right {
        width: 100%;
      }
      .stat-box {
        flex: 1;
      }
      .dashboard-tabs button {
        flex-grow: 1;
      }
      .dashboard-tabs .logout-btn-tab {
        margin-left: 0;
        width: 100%;
        justify-content: center;
      }
      .tab-content-card {
        padding: 24px;
      }
      .stats-form .form-row {
        flex-direction: column;
        gap: 16px;
      }
    }

    /* Modal Déverrouillage de Badge (Gaming style) */
    .unlock-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(5, 5, 7, 0.9);
      backdrop-filter: blur(15px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .unlock-card {
      position: relative;
      background-color: #0d0d11;
      border: 2px solid var(--accent-gold);
      border-radius: var(--border-radius-lg);
      padding: 40px 30px;
      width: 100%;
      max-width: 450px;
      text-align: center;
      box-shadow: 0 0 50px rgba(197, 168, 128, 0.25), inset 0 0 20px rgba(197, 168, 128, 0.1);
      overflow: hidden;
      animation: scaleUpUnlock 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }

    @keyframes scaleUpUnlock {
      from { transform: scale(0.85); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .unlock-glow-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      pointer-events: none;
      z-index: 1;
      opacity: 0.75;
    }

    .unlock-rays {
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(197, 168, 128, 0.15) 0%, transparent 60%),
                  repeating-conic-gradient(from 0deg, transparent 0deg, transparent 15deg, rgba(197, 168, 128, 0.05) 15deg, rgba(197, 168, 128, 0.05) 30deg);
      border-radius: 50%;
      animation: rotateRays 20s linear infinite;
    }

    @keyframes rotateRays {
      to { transform: rotate(360deg); }
    }

    .unlock-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .unlock-title {
      font-family: var(--font-headings);
      font-size: 0.9rem;
      font-weight: 900;
      color: var(--accent-gold);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      text-shadow: 0 0 10px rgba(197, 168, 128, 0.4);
      animation: blinkText 1.5s infinite ease-in-out;
    }

    @keyframes blinkText {
      0%, 100% { opacity: 0.8; text-shadow: 0 0 5px rgba(197, 168, 128, 0.3); }
      50% { opacity: 1; text-shadow: 0 0 20px rgba(197, 168, 128, 0.6); }
    }

    .unlock-badge-showcase {
      margin: 15px 0;
      animation: bounceBadge 3s infinite ease-in-out;
    }

    @keyframes bounceBadge {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .unlock-badge-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(208, 0, 0, 0.2) 0%, rgba(13, 13, 17, 0.9) 100%);
      border: 3px solid var(--primary-red);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-red);
      box-shadow: var(--glow-red), 0 0 30px rgba(208, 0, 0, 0.2);
    }

    .unlock-badge-icon {
      font-size: 3.5rem;
      text-shadow: 0 0 15px rgba(208, 0, 0, 0.5);
    }

    .unlock-badge-name {
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--text-white);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .unlock-badge-desc {
      font-size: 0.95rem;
      color: var(--text-light-grey);
      margin: 0 0 15px 0;
      line-height: 1.5;
      max-width: 320px;
    }

    .unlock-confirm-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background-color: var(--primary-red);
      color: var(--text-white);
      border: none;
      border-radius: var(--border-radius-sm);
      font-weight: 800;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      box-shadow: var(--glow-red);
      transition: var(--transition-medium);
    }

    .unlock-confirm-btn:hover {
      background-color: #ff1a1a;
      transform: scale(1.05);
      box-shadow: 0 0 25px rgba(208, 0, 0, 0.6);
    }

    /* Objectifs list */
    .objectives-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .objective-card {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-sm);
      padding: 20px;
      transition: var(--transition-fast);
    }
    
    .objective-card:hover {
      background-color: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-gold);
    }
    
    .objective-header {
      display: flex;
      align-items: center;
      gap: 20px;
      text-align: left;
    }
    
    .obj-icon {
      font-size: 2.2rem;
      color: var(--accent-gold);
      background-color: rgba(197, 168, 128, 0.1);
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .objective-header h4 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 700;
    }
    
    .objective-header p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-light-grey);
    }
    
    .obj-reward {
      margin-left: auto;
      font-weight: 800;
      color: #ffd700;
      font-size: 1.1rem;
    }
    
    /* Profile Form */
    .profile-edit-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .profile-edit-form input {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-sm);
      color: var(--text-white);
      padding: 12px 16px;
      font-size: 0.95rem;
      width: 100%;
    }
    
    .profile-edit-form input:focus {
      outline: none;
      border-color: var(--primary-red);
    }
    
    .profile-edit-form input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Pack promo */
    .pack-promo-banner {
      background: linear-gradient(135deg, rgba(208, 0, 0, 0.15) 0%, rgba(13, 13, 17, 0.9) 100%);
      border: 1px dashed var(--primary-red);
      border-radius: var(--border-radius-lg);
      padding: 24px;
      margin-bottom: 30px;
      text-align: left;
      box-shadow: var(--shadow-sm);
    }
    
    .pack-promo-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .pack-promo-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0 0 6px 0;
      color: var(--text-white);
    }
    
    .pack-promo-desc {
      font-size: 0.9rem;
      color: var(--text-light-grey);
      margin: 0;
    }
    
    .pack-promo-btn {
      background-color: var(--primary-red);
      color: var(--text-white);
      border: none;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--glow-red);
      transition: var(--transition-medium);
    }
    
    .pack-promo-btn:hover {
      background-color: #ff1a1a;
      transform: scale(1.03);
    }
    
    /* Review actions */
    .seance-actions-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }
    
    .review-action-container {
      margin-top: 4px;
    }
    
    .review-btn-action {
      background: none;
      border: 1px dashed var(--accent-gold);
      color: var(--accent-gold);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: var(--transition-fast);
    }
    
    .review-btn-action:hover {
      background-color: rgba(197, 168, 128, 0.1);
      color: var(--text-white);
      border-color: var(--text-white);
    }
    
    .review-done-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #32cd32;
    }
    
    /* Review modal styling */
    .review-modal-card {
      max-width: 500px;
      border-color: var(--accent-gold);
      width: 100%;
    }
    
    .review-textarea-container {
      width: 100%;
      margin: 10px 0;
    }
    
    .review-textarea {
      width: 100%;
      height: 120px;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--border-radius-sm);
      color: var(--text-white);
      padding: 12px;
      font-family: var(--font-body);
      font-size: 0.95rem;
      resize: none;
    }
    
    .review-textarea:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
    
    .review-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      width: 100%;
      margin-top: 10px;
    }

    /* Style des images cadeaux boutique */
    .reward-image-container {
      height: 160px;
      position: relative;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.01);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reward-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 10px;
      transition: opacity 0.4s ease, transform 0.4s ease;
    }

    .tshirt-container .tshirt-back {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
    }

    .tshirt-container:hover .tshirt-front {
      opacity: 0;
      transform: scale(0.95);
    }

    .tshirt-container:hover .tshirt-back {
      opacity: 1;
      transform: scale(1.05);
    }
    }
  `]
})
export class MemberDashboardComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  profileData = { nom: '', prenom: '', telephone: '' };
  profileSaving = signal<boolean>(false);
  packBuying = signal<boolean>(false);
  activeReviewReservation = signal<any | null>(null);
  reviewText = '';
  reviewSaving = signal<boolean>(false);
  reservations = signal<any[]>([]);
  stats = signal<StatRecord[]>([]);
  badges = signal<BadgeItem[]>([]);
  rewards = signal<RewardItem[]>([]);
  seenBadges: number[] = [];
  unseenBadgesCount = computed(() => {
    const list = this.badges();
    return list.filter(b => b.unlocked && !this.seenBadges.includes(b.id)).length;
  });
  activeUnlockNotification = signal<BadgeItem | null>(null);

  activeTab = signal<'seances' | 'progression' | 'badges' | 'boutique' | 'objectifs' | 'profile'>('seances');
  activeMetric = signal<'poids' | 'pompes' | 'gainage'>('poids');

  // Formulaire stats
  newStat = {
    poids: null as number | null,
    force_pompes: null as number | null,
    endurance_gainage: null as number | null
  };
  statsLoading = signal<boolean>(false);

  // Boutique alerts/loading
  boutiqueMessage = signal<string>('');
  boutiqueSuccess = signal<boolean>(false);
  redeemLoading = signal<number | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private bookingService: BookingService
  ) {
    if (!localStorage.getItem('member_token')) {
      this.router.navigate(['/connexion']);
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seen_badges');
      if (stored) {
        try {
          this.seenBadges = JSON.parse(stored);
        } catch (e) {
          this.seenBadges = [];
        }
      }
    }
  }

  ngOnInit() {
    this.loadAllData();
  }

  private getApiUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:3000/api';
    }
    return 'https://combatfit.onrender.com/api'; 
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('member_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadAllData() {
    const headers = this.getHeaders();
    const api = this.getApiUrl();

    // 1. Profil
    this.http.get<UserProfile>(`${api}/member/profile`, { headers }).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileData.nom = data.nom;
        this.profileData.prenom = data.prenom;
        this.profileData.telephone = data.telephone || '';
        localStorage.setItem('member_user', JSON.stringify(data));
      },
      error: () => this.logout()
    });

    // 2. Réservations
    this.http.get<any[]>(`${api}/member/reservations`, { headers }).subscribe({
      next: (data) => this.reservations.set(data),
      error: (err) => console.error(err)
    });

    // 3. Stats physiques
    this.http.get<StatRecord[]>(`${api}/member/stats`, { headers }).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error(err)
    });

    // 4. Badges
    this.http.get<BadgeItem[]>(`${api}/member/badges`, { headers }).subscribe({
      next: (data) => {
        const currentTab = this.activeTab();
        const newlyUnlocked = data.filter(b => b.unlocked && !this.seenBadges.includes(b.id));
        
        this.badges.set(data);

        if (currentTab !== 'badges' && newlyUnlocked.length > 0) {
          this.activeUnlockNotification.set(newlyUnlocked[0]);
        } else if (currentTab === 'badges') {
          const unlockedIds = data.filter(b => b.unlocked).map(b => b.id);
          this.seenBadges = Array.from(new Set([...this.seenBadges, ...unlockedIds]));
          localStorage.setItem('seen_badges', JSON.stringify(this.seenBadges));
        }
      },
      error: (err) => console.error(err)
    });

    // 5. Boutique cadeaux
    this.http.get<RewardItem[]>(`${api}/rewards`).subscribe({
      next: (data) => this.rewards.set(data),
      error: (err) => console.error(err)
    });
  }

  // XP helpers
  getXpPercentage(xp: number): number {
    return xp % 100;
  }

  getXpInCurrentLevel(xp: number): number {
    return xp % 100;
  }

  getBeltName(level: number): string {
    if (level < 2) return 'Blanche';
    if (level < 4) return 'Jaune';
    if (level < 6) return 'Orange';
    if (level < 8) return 'Verte';
    if (level < 10) return 'Bleue';
    if (level < 12) return 'Marron';
    return 'Noire';
  }

  getBeltClass(level: number): string {
    if (level < 2) return 'belt-white';
    if (level < 4) return 'belt-yellow';
    if (level < 6) return 'belt-orange';
    if (level < 8) return 'belt-green';
    if (level < 10) return 'belt-blue';
    if (level < 12) return 'belt-brown';
    return 'belt-black';
  }

  // Dates helpers
  isPastDate(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    // Format YYYY-MM-DD HH:mm:ss -> HH:mm
    if (dateStr.length >= 16) {
      return dateStr.substring(11, 16);
    }
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // Actions
  goToBooking() {
    this.bookingService.open();
  }

  selectBadgesTab() {
    this.activeTab.set('badges');
    const unlockedIds = this.badges().filter(b => b.unlocked).map(b => b.id);
    this.seenBadges = Array.from(new Set([...this.seenBadges, ...unlockedIds]));
    localStorage.setItem('seen_badges', JSON.stringify(this.seenBadges));
  }

  closeUnlockNotification() {
    const badge = this.activeUnlockNotification();
    if (badge) {
      this.seenBadges = Array.from(new Set([...this.seenBadges, badge.id]));
      localStorage.setItem('seen_badges', JSON.stringify(this.seenBadges));
      this.activeUnlockNotification.set(null);

      // Check if there are other newly unlocked badges in the queue
      const nextUnseen = this.badges().filter(b => b.unlocked && !this.seenBadges.includes(b.id));
      if (nextUnseen.length > 0) {
        setTimeout(() => {
          this.activeUnlockNotification.set(nextUnseen[0]);
        }, 300);
      } else {
        this.selectBadgesTab();
      }
    }
  }

  selectObjectivesTab() {
    this.activeTab.set('objectifs');
    
    // Appeler l'API de visite d'objectifs
    const headers = this.getHeaders();
    const api = this.getApiUrl();
    this.http.post<any>(`${api}/member/objectives/visit`, {}, { headers }).subscribe({
      next: (res) => {
        if (res.pointsBonus > 0) {
          this.loadAllData();
          alert(`Objectifs consultés : +5 Trophées déverrouillés !`);
        }
      },
      error: (err) => console.error(err)
    });
  }

  updateProfile(event: Event) {
    event.preventDefault();
    this.profileSaving.set(true);
    
    const headers = this.getHeaders();
    const api = this.getApiUrl();
    
    this.http.put<any>(`${api}/member/profile`, this.profileData, { headers }).subscribe({
      next: (res) => {
        this.profileSaving.set(false);
        this.loadAllData();
        let msg = "Votre profil a bien été enregistré !";
        if (res.pointsBonus > 0) {
          msg += ` Félicitations : +10 Trophées gagnés pour avoir complété votre profil !`;
        }
        alert(msg);
      },
      error: (err) => {
        this.profileSaving.set(false);
        alert(err.error?.message || "Erreur lors de l'enregistrement du profil.");
      }
    });
  }

  buyPack() {
    if (!confirm("Simuler l'achat d'un pack d'entraînement pour gagner 150 trophées ?")) return;
    this.packBuying.set(true);
    
    const headers = this.getHeaders();
    const api = this.getApiUrl();
    
    this.http.post<any>(`${api}/member/buy-pack`, {}, { headers }).subscribe({
      next: (res) => {
        this.packBuying.set(false);
        this.loadAllData();
        alert(res.message);
      },
      error: (err) => {
        this.packBuying.set(false);
        alert("Erreur lors de la simulation d'achat.");
      }
    });
  }

  openReviewPrompt(resv: any) {
    this.activeReviewReservation.set(resv);
    this.reviewText = '';
  }

  submitReview() {
    const resv = this.activeReviewReservation();
    if (!resv || !this.reviewText.trim()) return;
    
    this.reviewSaving.set(true);
    const headers = this.getHeaders();
    const api = this.getApiUrl();
    
    const body = {
      reservationId: resv.id,
      avis: this.reviewText.trim()
    };
    
    this.http.post<any>(`${api}/member/review`, body, { headers }).subscribe({
      next: (res) => {
        this.reviewSaving.set(false);
        this.activeReviewReservation.set(null);
        this.loadAllData();
        alert(res.message);
      },
      error: (err) => {
        this.reviewSaving.set(false);
        alert(err.error?.message || "Erreur lors de la publication de l'avis.");
      }
    });
  }

  copyReferralCode() {
    const code = this.profile()?.code_parrainage;
    if (code) {
      navigator.clipboard.writeText(code);
      alert("Code parrainage copié dans le presse-papiers !");
    }
  }

  // Enregistrer nouvelles stats
  saveStats(event: Event) {
    event.preventDefault();
    if (this.newStat.poids === null && this.newStat.force_pompes === null && this.newStat.endurance_gainage === null) {
      alert("Veuillez saisir au moins une valeur.");
      return;
    }

    this.statsLoading.set(true);
    const headers = this.getHeaders();
    const api = this.getApiUrl();

    this.http.post(`${api}/member/stats`, this.newStat, { headers }).subscribe({
      next: () => {
        this.statsLoading.set(false);
        // Réinitialiser les champs
        this.newStat = { poids: null, force_pompes: null, endurance_gainage: null };
        alert("Mesures enregistrées avec succès !");
        this.loadAllData(); // Recharger pour rafraîchir le graphique et les badges
      },
      error: (err) => {
        this.statsLoading.set(false);
        alert(err.error?.message || "Erreur lors de l'enregistrement.");
      }
    });
  }

  // Boutique : échanger récompense
  redeemReward(r: RewardItem) {
    if (!confirm(`Échanger ${r.cout_points} trophées contre : "${r.nom}" ?`)) return;

    this.redeemLoading.set(r.id);
    this.boutiqueMessage.set('');
    
    const headers = this.getHeaders();
    const api = this.getApiUrl();

    this.http.post<any>(`${api}/rewards/redeem`, { rewardId: r.id }, { headers }).subscribe({
      next: (res) => {
        this.redeemLoading.set(null);
        this.boutiqueSuccess.set(true);
        this.boutiqueMessage.set(res.message);
        this.loadAllData(); // Recharger les points restants et la liste
      },
      error: (err) => {
        this.redeemLoading.set(null);
        this.boutiqueSuccess.set(false);
        this.boutiqueMessage.set(err.error?.message || "Erreur lors de la commande.");
      }
    });
  }

  logout() {
    localStorage.removeItem('member_token');
    localStorage.removeItem('member_user');
    this.router.navigate(['/connexion']);
  }

  // ==========================================
  // GRAPHISME SVG INTELLIGENT
  // ==========================================

  getChartPoints(): any[] {
    const list = this.stats();
    if (list.length === 0) return [];
    
    // Filtrer les valeurs non nulles pour la métrique courante
    const metric = this.activeMetric();
    const data = list
      .map(s => {
        let val = null;
        if (metric === 'poids') val = s.poids;
        if (metric === 'pompes') val = s.force_pompes;
        if (metric === 'gainage') val = s.endurance_gainage;
        return { date: s.date, val };
      })
      .filter(d => d.val !== null) as { date: string; val: number }[];

    if (data.length === 0) return [];

    // Trouver min/max de la métrique
    const vals = data.map(d => d.val);
    let min = Math.min(...vals);
    let max = Math.max(...vals);

    // Ajustement des bornes pour avoir une jolie courbe
    if (min === max) {
      min = min - 5 < 0 ? 0 : min - 5;
      max = max + 5;
    } else {
      const padding = (max - min) * 0.15;
      min = min - padding < 0 ? 0 : min - padding;
      max = max + padding;
    }

    const width = 430; // Zone utile X: [50, 480]
    const height = 120; // Zone utile Y: [30, 150]

    return data.map((d, index) => {
      const x = data.length === 1 
        ? 240 
        : 50 + index * (width / (data.length - 1));
      
      const y = 150 - ((d.val - min) / (max - min) * height);
      
      // Date label (DD/MM/YYYY)
      let dateLabel = '';
      if (d.date) {
        const dateObj = new Date(d.date);
        if (!isNaN(dateObj.getTime())) {
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = dateObj.getFullYear();
          dateLabel = `${day}/${month}/${year}`;
        } else {
          const dateOnly = d.date.includes('T') ? d.date.split('T')[0] : d.date;
          const parts = dateOnly.split('-');
          if (parts.length === 3) dateLabel = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      return { x, y, val: d.val, dateLabel };
    });
  }

  getLinePath(): string {
    const pts = this.getChartPoints();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  }

  getAreaPath(): string {
    const pts = this.getChartPoints();
    if (pts.length === 0) return '';
    const line = this.getLinePath();
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    return `${line} L ${lastX} 150 L ${firstX} 150 Z`;
  }
}
