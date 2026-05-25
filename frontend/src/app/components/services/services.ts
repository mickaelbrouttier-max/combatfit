import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';

interface ServiceItem {
  id: string;
  title: string;
  icon: string;
  image?: string;
  hasCustomGradient?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  points: string[];
}

@Component({
  selector: 'app-services',
  imports: [CommonModule],
  template: `
    <section id="services" class="services-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <p class="section-subtitle">Mes Services</p>
          <h2 class="section-title">Un accompagnement complet et adapté à tes objectifs</h2>
          <div class="header-line"></div>
        </div>

        <!-- Services Cards Grid -->
        <div class="services-grid">
          @for (service of services; track service.id) {
            <div class="service-card" (click)="selectService(service.title)">
              <!-- Card Top Image / Gradient Visual -->
              <div class="card-visual">
                @if (service.image) {
                  <img [src]="service.image" [alt]="service.title" class="card-img" />
                } @else {
                  <div class="card-gradient-fallback" 
                       [style.background]="'linear-gradient(135deg, ' + service.gradientStart + ' 0%, ' + service.gradientEnd + ' 100%)'">
                    <span class="material-icons-outlined fallback-icon">{{ service.icon }}</span>
                  </div>
                }
                <div class="card-red-overlay"></div>
                <div class="card-icon-badge">
                  <span class="material-icons-outlined">{{ service.icon }}</span>
                </div>
              </div>

              <!-- Card Content -->
              <div class="card-body">
                <h3 class="service-title">{{ service.title }}</h3>
                <ul class="service-points">
                  @for (point of service.points; track point) {
                    <li>
                      <span class="material-icons-outlined check-icon">check</span>
                      <span>{{ point }}</span>
                    </li>
                  }
                </ul>
                <div class="card-action">
                  <span class="action-text">Réserver ce service</span>
                  <span class="material-icons-outlined arrow-icon">arrow_forward</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .services-section {
      background-color: var(--light-bg);
      color: var(--text-dark);
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 60px;
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
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-dark);
      max-width: 600px;
      margin: 0 auto 16px auto;
    }
    
    .header-line {
      width: 60px;
      height: 3px;
      background-color: var(--primary-red);
      margin: 0 auto;
    }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    
    .service-card {
      background-color: var(--light-surface);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--light-border);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: var(--transition-medium);
    }
    
    .service-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(208, 0, 0, 0.3);
    }
    
    .card-visual {
      position: relative;
      height: 160px;
      width: 100%;
      overflow: hidden;
    }
    
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition-slow);
    }
    
    .service-card:hover .card-img {
      transform: scale(1.1);
    }
    
    .card-gradient-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .fallback-icon {
      font-size: 4rem;
      color: rgba(255, 255, 255, 0.15);
    }
    
    .card-red-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      mix-blend-mode: multiply;
    }
    
    .card-icon-badge {
      position: absolute;
      bottom: 10px;
      left: 20px;
      width: 44px;
      height: 44px;
      background-color: var(--primary-red);
      color: var(--text-white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(208, 0, 0, 0.3);
    }
    
    .card-icon-badge span {
      font-size: 1.3rem;
    }
    
    .card-body {
      padding: 36px 20px 24px 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    
    .service-title {
      font-size: 1.15rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
      color: var(--text-dark);
    }
    
    .service-points {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 28px;
      flex-grow: 1;
    }
    
    .service-points li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.875rem;
      line-height: 1.4;
      color: #3f3f46;
    }
    
    .check-icon {
      color: var(--primary-red);
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }
    
    .card-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--light-border);
      padding-top: 16px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-grey);
      transition: var(--transition-fast);
    }
    
    .service-card:hover .card-action {
      color: var(--primary-red);
    }
    
    .arrow-icon {
      font-size: 1.1rem;
      transition: var(--transition-fast);
    }
    
    .service-card:hover .arrow-icon {
      transform: translateX(4px);
    }
    
    /* Responsive styling */
    @media (max-width: 1024px) {
      .services-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 600px) {
      .services-grid {
        grid-template-columns: 1fr;
      }
      .section-title {
        font-size: 1.8rem;
      }
    }
  `]
})
export class ServicesComponent {
  private readonly bookingService = inject(BookingService);

  readonly services: ServiceItem[] = [
    {
      id: 'physique',
      title: 'Préparation Physique',
      icon: 'fitness_center',
      image: 'images/service_physique.png',
      points: [
        'Renforcement musculaire spécifique',
        'Explosivité & vitesse de réaction',
        'Endurance & conditionnement cardio',
        'Mobilité & prévention des blessures'
      ]
    },
    {
      id: 'karate',
      title: 'Coaching Karaté',
      icon: 'sports_kabaddi',
      image: 'images/service_karate.png',
      points: [
        'Technique de base et avancée',
        'Kumite (combat tactique)',
        'Préparation mentale à la compétition',
        'Enfants, ados et adultes'
      ]
    },
    {
      id: 'online',
      title: 'Suivi en Ligne',
      icon: 'phonelink',
      image: 'images/service_online.png',
      hasCustomGradient: true,
      gradientStart: '#1C1C22',
      gradientEnd: '#330B0B',
      points: [
        'Programmes d\'entraînement personnalisés',
        'Suivi à distance hebdomadaire (WhatsApp)',
        'Vidéos correctives & conseils réguliers',
        'Bilan de progression & ajustements'
      ]
    },
    {
      id: 'interventions',
      title: 'Interventions',
      icon: 'groups',
      image: 'images/service_interventions.png',
      hasCustomGradient: true,
      gradientStart: '#330B0B',
      gradientEnd: '#1C1C22',
      points: [
        'Stages techniques & séminaires clubs',
        'Interventions écoles & associations',
        'Ateliers team building en entreprise',
        'Conférences sur la préparation physique'
      ]
    }
  ];

  selectService(serviceTitle: string) {
    this.bookingService.open(serviceTitle);
  }
}
