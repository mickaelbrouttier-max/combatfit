import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryItem {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="galerie" class="gallery-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <p class="section-subtitle">Moments en Images</p>
          <h2 class="section-title">Galerie Photos & Moments Forts</h2>
          <div class="header-line"></div>
        </div>

        <!-- Carousel Wrapper -->
        <div class="gallery-wrapper">
          <!-- Navigation Buttons -->
          <button class="nav-btn prev" (click)="prevSlide()" aria-label="Photo précédente">
            <span class="material-icons-outlined">chevron_left</span>
          </button>

          <div class="gallery-container">
            <div class="gallery-slider" [style.transform]="'translateX(' + translationOffset() + '%)'">
              @for (item of items; track item.image; let idx = $index) {
                <div class="gallery-slide" [class.active]="idx === currentIndex()">
                  <img [src]="item.image" [alt]="item.title" class="gallery-img" />
                  <div class="slide-overlay"></div>
                  <div class="slide-info">
                    <h3 class="slide-title">{{ item.title }}</h3>
                    <p class="slide-desc">{{ item.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <button class="nav-btn next" (click)="nextSlide()" aria-label="Photo suivante">
            <span class="material-icons-outlined">chevron_right</span>
          </button>

          <!-- Navigation Dots -->
          <div class="gallery-dots">
            @for (item of items; track item.image; let idx = $index) {
              <button 
                class="dot" 
                [class.active]="idx === currentIndex()" 
                (click)="goToSlide(idx)" 
                [attr.aria-label]="'Aller à la photo ' + (idx + 1)">
              </button>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .gallery-section {
      background-color: var(--dark-bg);
      color: var(--text-white);
      padding: 100px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 50px;
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
      color: var(--text-white);
    }
    
    .header-line {
      width: 60px;
      height: 3px;
      background-color: var(--primary-red);
      margin: 16px auto 0 auto;
    }
    
    .gallery-wrapper {
      position: relative;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .gallery-container {
      width: 100%;
      overflow: hidden;
      border-radius: var(--border-radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: var(--shadow-lg), 0 0 35px rgba(208, 0, 0, 0.1);
      background-color: var(--dark-surface);
    }
    
    .gallery-slider {
      display: flex;
      width: 100%;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .gallery-slide {
      flex: 0 0 100%;
      position: relative;
      aspect-ratio: 16 / 10;
      min-height: 420px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }
    
    .gallery-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 8s ease;
    }
    
    .gallery-slide.active .gallery-img {
      transform: scale(1.05);
    }
    
    .slide-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(10, 10, 12, 0.95) 0%, rgba(10, 10, 12, 0.4) 50%, transparent 100%);
      z-index: 1;
    }
    
    .slide-info {
      position: relative;
      z-index: 2;
      padding: 40px;
      width: 100%;
      box-sizing: border-box;
      transform: translateY(15px);
      opacity: 0;
      transition: all 0.5s ease 0.2s;
    }
    
    .gallery-slide.active .slide-info {
      transform: translateY(0);
      opacity: 1;
    }
    
    .slide-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }
    
    .slide-desc {
      font-size: 0.95rem;
      color: var(--text-light-grey);
      max-width: 650px;
      line-height: 1.5;
    }
    
    /* Navigation Buttons */
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      background-color: rgba(20, 20, 24, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-white);
      cursor: pointer;
      box-shadow: var(--shadow-md);
      transition: var(--transition-medium);
      z-index: 10;
      backdrop-filter: blur(4px);
    }
    
    .nav-btn:hover {
      background-color: var(--primary-red);
      border-color: var(--primary-red);
      box-shadow: var(--glow-red);
    }
    
    .nav-btn.prev {
      left: -25px;
    }
    
    .nav-btn.next {
      right: -25px;
    }
    
    /* Dots Indicators */
    .gallery-dots {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 24px;
    }
    
    .dot {
      width: 10px;
      height: 10px;
      background-color: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: var(--transition-fast);
      padding: 0;
    }
    
    .dot:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }
    
    .dot.active {
      background-color: var(--primary-red);
      transform: scale(1.2);
      box-shadow: var(--glow-red);
    }
    
    /* Responsive Styling */
    @media (max-width: 960px) {
      .nav-btn.prev { left: 10px; }
      .nav-btn.next { right: 10px; }
      .gallery-slide {
        aspect-ratio: 4 / 3;
        min-height: 360px;
      }
      .slide-info {
        padding: 30px;
      }
    }
    
    @media (max-width: 600px) {
      .gallery-slide {
        aspect-ratio: 1 / 1;
        min-height: 300px;
      }
      .slide-info {
        padding: 20px;
      }
      .slide-title {
        font-size: 1.2rem;
      }
      .slide-desc {
        font-size: 0.85rem;
      }
      .nav-btn {
        width: 40px;
        height: 40px;
      }
      .nav-btn.prev { left: 5px; }
      .nav-btn.next { right: 5px; }
    }
  `]
})
export class GalleryComponent {
  readonly currentIndex = signal(0);

  readonly items: GalleryItem[] = [
    {
      image: 'images/karate_podium.jpg',
      title: 'Podium de Compétition',
      description: 'Championnats et podiums - La récompense du travail, de la rigueur et de la régularité sur les tatamis.'
    },
    {
      image: 'images/karate_dojo.png',
      title: 'Transmission & Dojo',
      description: 'Le plaisir de partager et d\'enseigner la passion du karaté au dojo, avec exigence et convivialité.'
    },
    {
      image: 'images/hero_kick.png',
      title: 'Technique & Précision',
      description: 'Le karaté comme art de la précision, de la vitesse et de la maîtrise absolue du mouvement.'
    },
    {
      image: 'images/about_matthias.png',
      title: 'Préparation Physique',
      description: 'Le conditionnement physique ciblé, la clé pour booster l\'explosivité et prévenir les blessures.'
    }
  ];

  translationOffset() {
    return -this.currentIndex() * 100;
  }

  nextSlide() {
    this.currentIndex.update(index => (index >= this.items.length - 1 ? 0 : index + 1));
  }

  prevSlide() {
    this.currentIndex.update(index => (index <= 0 ? this.items.length - 1 : index - 1));
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex.set(index);
    }
  }
}
