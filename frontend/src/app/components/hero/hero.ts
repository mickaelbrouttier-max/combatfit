import { Component, inject } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-hero',
  template: `
    <section id="accueil" class="hero-section">
      <!-- Background & Overlays -->
      <div class="hero-bg">
        <img src="images/matthias_punch.png" alt="Mathias Karate" class="hero-bg-img" />
        <div class="hero-overlay"></div>
        <div class="hero-red-glow"></div>
      </div>

      <div class="container hero-container">
        <!-- Text Content -->
        <div class="hero-content animate-fade-in-up">
          <p class="hero-subtitle">Coaching Karaté & Préparation Physique</p>
          <h1 class="hero-title">
            Dépasse tes limites,<br />
            <span class="text-primary">deviens la meilleure</span><br />
            version de toi-même.
          </h1>
          <p class="hero-desc">
            Un accompagnement personnalisé pour améliorer ta technique, ta condition physique et ton mental.
          </p>

          <!-- Action Buttons -->
          <div class="hero-buttons">
            <a href="#services" class="btn btn-secondary hero-btn">
              <span class="material-icons-outlined">sell</span>
              Voir les offres
            </a>
            <a href="#contact" class="btn btn-secondary hero-btn">
              <span class="material-icons-outlined">mail</span>
              Me contacter
            </a>
          </div>
        </div>

        <!-- Vertical Japanese Calligraphy Banner -->
        <div class="japanese-scroll">
          <div class="scroll-border">
            <span class="kanji-char">空</span>
            <span class="kanji-char">手</span>
            <span class="kanji-char">道</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      height: 100vh;
      min-height: 700px;
      display: flex;
      align-items: center;
      color: var(--text-white);
      overflow: hidden;
      padding: 0;
    }
    
    .hero-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: left 25%;
      filter: grayscale(100%) contrast(140%) brightness(55%);
      mix-blend-mode: luminosity;
      transform: scaleX(-1);
    }
    
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(10, 10, 12, 0.95) 0%,
        rgba(10, 10, 12, 0.8) 50%,
        rgba(10, 10, 12, 0.4) 100%
      );
    }
    
    .hero-red-glow {
      position: absolute;
      bottom: -10%;
      right: -10%;
      width: 60%;
      height: 60%;
      background: radial-gradient(
        circle,
        rgba(208, 0, 0, 0.15) 0%,
        transparent 70%
      );
      filter: blur(50px);
      pointer-events: none;
    }
    
    .hero-container {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-top: calc(var(--header-height) + 20px);
    }
    
    .hero-content {
      max-width: 650px;
    }
    
    .hero-subtitle {
      font-family: var(--font-headings);
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--accent-gold);
      margin-bottom: 20px;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-bottom: 24px;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
    
    .hero-desc {
      font-size: 1.1rem;
      color: var(--text-light-grey);
      margin-bottom: 40px;
      max-width: 500px;
      line-height: 1.5;
    }
    
    .hero-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Japanese Scroll style */
    .japanese-scroll {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--light-surface);
      color: var(--text-dark);
      padding: 20px 12px;
      border-radius: var(--border-radius-sm);
      box-shadow: var(--shadow-lg), 0 0 30px rgba(0, 0, 0, 0.8);
      writing-mode: vertical-rl;
      border: 3px double var(--text-dark);
      animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
    }
    
    .scroll-border {
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      padding: 10px 4px;
    }
    
    .kanji-char {
      font-family: "Noto Serif JP", "Georgia", serif;
      font-size: 2.2rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      line-height: 1;
    }
    
    /* Responsive queries */
    @media (max-width: 992px) {
      .hero-title {
        font-size: 2.8rem;
      }
      .japanese-scroll {
        display: none; /* Hide scroll on tablet and mobile */
      }
    }
    
    @media (max-width: 768px) {
      .hero-section {
        height: auto;
        min-height: 100vh;
        padding-bottom: 60px;
      }
      .hero-container {
        padding-top: 120px;
      }
      .hero-title {
        font-size: 2.2rem;
      }
      .hero-desc {
        font-size: 1rem;
      }
      .hero-buttons {
        flex-direction: column;
        width: 100%;
      }
      .hero-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class HeroComponent {
  private readonly bookingService = inject(BookingService);

  bookCall() {
    this.bookingService.open('Appel découverte gratuit');
  }
}
