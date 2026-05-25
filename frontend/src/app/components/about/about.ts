import { Component, ElementRef, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <section id="apropos" class="about-section">
      <div class="container">
        <div class="about-layout">
          <!-- Left: Coach Video, Control Button & Watermark -->
          <div class="about-visual">
            <div class="watermark-kanji">空手道</div>
            <div class="image-wrapper">
              
              <!-- Iframe avec identifiant pour le contrôle TS -->
              <iframe 
                #youtubePlayer
                src="https://www.youtube.com/embed/04uZPeN8c0M?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=04uZPeN8c0M&controls=0&modestbranding=1&rel=0" 
                title="Mathias Coach Video"
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                class="coach-img youtube-short">
              </iframe>

              <!-- Bouton Custom Mute / Unmute -->
              <button class="video-control-btn" (click)="toggleMute()" [attr.aria-label]="isMuted() ? 'Activer le son' : 'Couper le son'">
                <span class="material-icons-outlined">
                  {{ isMuted() ? 'volume_off' : 'volume_up' }}
                </span>
              </button>
              
            </div>
          </div>

          <!-- Right: Bio Content -->
          <div class="about-content">
            <p class="section-subtitle">À Propos</p>
            <h2 class="section-title">Passionné par le karaté, engagé pour ta progression.</h2>
            
            <p class="bio-text">
              Pratiquant le karaté depuis mon plus jeune âge, compétiteur pendant de nombreuses années et aujourd'hui professeur et préparateur physique. J'accompagne chaque personne avec exigence et bienveillance.
            </p>
            <p class="bio-text bold-bio">
              Mon objectif : t'aider à développer ton plein potentiel sur le tatami comme dans la vie.
            </p>

            <!-- Quick Stats -->
            <div class="stats-grid">
              <div class="stat-item">
                <span class="material-icons-outlined stat-icon">schedule</span>
                <span class="stat-number">+10 Ans</span>
                <span class="stat-label">Expérience</span>
              </div>
              <div class="stat-item">
                <span class="material-icons-outlined stat-icon">sports_kabaddi</span>
                <span class="stat-number">Ceinture Noire</span>
                <span class="stat-label">2e Dan</span>
              </div>
              <div class="stat-item">
                <span class="material-icons-outlined stat-icon">emoji_events</span>
                <span class="stat-number">Nombreux</span>
                <span class="stat-label">Compétiteurs</span>
              </div>
              <div class="stat-item">
                <span class="material-icons-outlined stat-icon">people_outline</span>
                <span class="stat-number">+100</span>
                <span class="stat-label">Élèves Accompagnés</span>
              </div>
            </div>
          </div>

          <!-- Values Sidebar Card -->
          <div class="values-card">
            <h3 class="values-title">Mes Valeurs</h3>
            <ul class="values-list">
              <li>
                <span class="material-icons-outlined val-check">check_circle</span>
                <span class="val-text">Discipline</span>
              </li>
              <li>
                <span class="material-icons-outlined val-check">check_circle</span>
                <span class="val-text">Respect</span>
              </li>
              <li>
                <span class="material-icons-outlined val-check">check_circle</span>
                <span class="val-text">Dépassement de soi</span>
              </li>
              <li>
                <span class="material-icons-outlined val-check">check_circle</span>
                <span class="val-text">Travail</span>
              </li>
              <li>
                <span class="material-icons-outlined val-check">check_circle</span>
                <span class="val-text">Progression</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-section {
      background-color: #F3F4F6;
      color: var(--text-dark);
      overflow: hidden;
    }
    
    .about-layout {
      display: grid;
      grid-template-columns: 1.1fr 1.3fr 0.8fr;
      gap: 40px;
      align-items: center;
    }
    
    /* Photo / Vidéo & watermark styles */
    .about-visual {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .watermark-kanji {
      position: absolute;
      left: -20px;
      top: 50%;
      transform: translateY(-50%);
      font-family: "Noto Serif JP", serif;
      font-size: 8rem;
      font-weight: 900;
      color: rgba(0, 0, 0, 0.035);
      writing-mode: vertical-rl;
      line-height: 1;
      user-select: none;
      z-index: 1;
    }
    
    .image-wrapper {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 320px;
    }
    
    .coach-img {
      width: 100%;
      height: 480px; /* Légèrement augmenté pour mieux cadrer le format vertical des Shorts */
      object-fit: cover;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      display: block;
    }

    .youtube-short {
      aspect-ratio: 9 / 16;
      border: none;
    }

    /* Bouton de contrôle du son */
    .video-control-btn {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 10;
      background-color: rgba(0, 0, 0, 0.6);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .video-control-btn:hover {
      background-color: var(--primary-red);
      transform: scale(1.05);
    }

    .video-control-btn .material-icons-outlined {
      font-size: 1.3rem;
    }
    
 
    /* Content Column */
    .about-content {
      display: flex;
      flex-direction: column;
    }
    
    .section-subtitle {
      font-family: var(--font-headings);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--primary-red);
      margin-bottom: 12px;
    }
    
    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-dark);
      margin-bottom: 24px;
      line-height: 1.25;
    }
    
    .bio-text {
      font-size: 1rem;
      color: #4B5563;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    
    .bold-bio {
      font-weight: 600;
      color: var(--text-dark);
    }
    
    /* Stats Layout */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 30px;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      background-color: var(--light-surface);
      padding: 16px;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: var(--transition-fast);
    }
    
    .stat-item:hover {
      border-color: rgba(208, 0, 0, 0.2);
      transform: translateY(-2px);
    }
    
    .stat-icon {
      color: var(--primary-red);
      font-size: 1.8rem;
      margin-bottom: 8px;
    }
    
    .stat-number {
      font-family: var(--font-headings);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-dark);
      line-height: 1.1;
    }
    
    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-grey);
      margin-top: 4px;
    }
    
    /* Values Card Sidebar */
    .values-card {
      background-color: var(--light-surface);
      padding: 30px 24px;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      border-left: 4px solid var(--primary-red);
      height: fit-content;
    }
    
    .values-title {
      font-family: var(--font-headings);
      font-size: 1.1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 24px;
      color: var(--text-dark);
    }
    
    .values-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .values-list li {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .val-check {
      color: var(--primary-red);
      font-size: 1.3rem;
    }
    
    .val-text {
      font-family: var(--font-headings);
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dark);
    }
    
    /* Responsive Styling */
    @media (max-width: 1200px) {
      .about-layout {
        grid-template-columns: 1fr 1.2fr;
      }
      .values-card {
        grid-column: span 2;
        margin-top: 20px;
      }
    }
    
    @media (max-width: 768px) {
      .about-layout {
        grid-template-columns: 1fr;
      }
      .about-visual {
        order: 2;
        margin-top: 30px;
      }
      .values-card {
        grid-column: 1;
        order: 3;
      }
      .section-title {
        font-size: 1.7rem;
      }
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AboutComponent {
  @ViewChild('youtubePlayer') youtubePlayer!: ElementRef<HTMLIFrameElement>;
  
  // Utilisation d'un Signal Angular (puisque tu es sur Angular 19) pour gérer l'état
  protected readonly isMuted = signal(true);

  toggleMute(): void {
    const iframe = this.youtubePlayer.nativeElement;
    
    // Inversion de l'état actuel
    this.isMuted.update(value => !value);

    // Construction de la commande API YouTube Player
    const command = this.isMuted() ? 'unMute' : 'mute';
    
    // On envoie le message postMessage à l'iframe pour piloter le lecteur YouTube
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }), 
      '*'
    );
  }
}