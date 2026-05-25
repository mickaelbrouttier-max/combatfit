import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  name: string;
  age: number;
  initials: string;
  rating: number;
  text: string;
}

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule],
  template: `
    <section id="testimonials" class="testimonials-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <p class="section-subtitle">Ils me font confiance</p>
          <h2 class="section-title">Témoignages</h2>
          <div class="header-line"></div>
        </div>

        <!-- Carousel / Grid Area -->
        <div class="testimonials-wrapper">
          <!-- Left Control -->
          <button class="nav-btn prev" (click)="prevSlide()" aria-label="Previous Testimonial">
            <span class="material-icons-outlined">chevron_left</span>
          </button>

          <!-- Cards Container -->
          <div class="testimonials-container">
            <div class="testimonials-slider" [style.transform]="'translateX(' + translationOffset() + 'px)'">
              @for (item of items; track item.name) {
                <div class="testimonial-card">
                  <!-- Star Rating -->
                  <div class="star-rating">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <span class="material-icons-outlined star-icon">star</span>
                    }
                  </div>

                  <!-- Feedback Text -->
                  <p class="testimonial-text">
                    "{{ item.text }}"
                  </p>

                  <!-- Client Info -->
                  <div class="client-info">
                    <div class="client-avatar">
                      {{ item.initials }}
                    </div>
                    <div class="client-details">
                      <h4 class="client-name">{{ item.name }}</h4>
                      <p class="client-meta">{{ item.age }} ans</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right Control -->
          <button class="nav-btn next" (click)="nextSlide()" aria-label="Next Testimonial">
            <span class="material-icons-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials-section {
      background-color: var(--light-surface);
      color: var(--text-dark);
      position: relative;
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
    }
    
    .header-line {
      width: 60px;
      height: 3px;
      background-color: var(--primary-red);
      margin: 16px auto 0 auto;
    }
    
    .testimonials-wrapper {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
    }
    
    .testimonials-container {
      width: 100%;
      overflow: hidden;
      padding: 15px 0;
    }
    
    .testimonials-slider {
      display: flex;
      gap: 24px;
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    }
    
    .testimonial-card {
      flex: 0 0 calc(33.333% - 16px);
      background-color: var(--light-bg);
      border-radius: var(--border-radius-md);
      padding: 30px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--light-border);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 250px;
      transition: var(--transition-medium);
    }
    
    .testimonial-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
      border-color: rgba(208, 0, 0, 0.2);
    }
    
    .star-rating {
      display: flex;
      gap: 2px;
      margin-bottom: 20px;
    }
    
    .star-icon {
      color: var(--primary-red);
      font-size: 1.25rem;
    }
    
    .testimonial-text {
      font-size: 0.95rem;
      font-style: italic;
      color: #3F3F46;
      line-height: 1.6;
      margin-bottom: 24px;
      flex-grow: 1;
    }
    
    .client-info {
      display: flex;
      align-items: center;
      gap: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      padding-top: 16px;
    }
    
    .client-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--primary-red) 0%, #7A0000 100%);
      color: var(--text-white);
      font-family: var(--font-headings);
      font-weight: 800;
      font-size: 1rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--light-surface);
      box-shadow: 0 0 10px rgba(208, 0, 0, 0.2);
    }
    
    .client-details {
      display: flex;
      flex-direction: column;
    }
    
    .client-name {
      font-family: var(--font-headings);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-dark);
    }
    
    .client-meta {
      font-size: 0.8rem;
      color: var(--text-grey);
    }
    
    /* Control Buttons */
    .nav-btn {
      width: 44px;
      height: 44px;
      background-color: var(--light-surface);
      border: 1px solid var(--light-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-dark);
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: var(--transition-fast);
      z-index: 10;
      flex-shrink: 0;
    }
    
    .nav-btn:hover {
      background-color: var(--primary-red);
      color: var(--text-white);
      border-color: var(--primary-red);
      box-shadow: var(--glow-red);
    }
    
    /* Responsive Styling */
    @media (max-width: 1024px) {
      .testimonial-card {
        flex: 0 0 calc(50% - 12px);
      }
    }
    
    @media (max-width: 768px) {
      .testimonial-card {
        flex: 0 0 100%;
      }
      .nav-btn {
        display: none; /* Hide arrows on mobile and support swiping/scrolling naturally */
      }
      .testimonials-container {
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
      }
      .testimonial-card {
        scroll-snap-align: start;
      }
      .testimonials-slider {
        transform: none !important; /* Disable TS translation on mobile */
      }
    }
  `]
})
export class TestimonialsComponent {
  readonly items: Testimonial[] = [
    {
      name: 'Lucas',
      age: 19,
      initials: 'L',
      rating: 5,
      text: 'Grâce à son suivi, j\'ai amélioré ma condition physique et mes performances en compétition. Un coach exigeant et motivant !'
    },
    {
      name: 'Manon',
      age: 35,
      initials: 'M',
      rating: 5,
      text: 'Les entraînements sont variés, adaptés et toujours efficaces. Je recommande à 100% !'
    },
    {
      name: 'Julien',
      age: 54,
      initials: 'J',
      rating: 5,
      text: 'Super coach, à l\'écoute et passionné. J\'ai progressé autant physiquement que mentalement.'
    }
  ];

  readonly currentIndex = signal(0);

  translationOffset() {
    if (typeof window !== 'undefined') {
      const cardWidth = window.innerWidth > 1024 
        ? (window.innerWidth > 1200 ? 1152 : window.innerWidth - 48) / 3 
        : window.innerWidth > 768 
          ? (window.innerWidth - 48) / 2 
          : window.innerWidth - 48;
      
      const gap = 24;
      return -this.currentIndex() * (cardWidth + gap);
    }
    return 0;
  }

  nextSlide() {
    const maxIndex = window.innerWidth > 1024 
      ? 0 // No sliding needed if 3 fit
      : window.innerWidth > 768 
        ? this.items.length - 2 
        : this.items.length - 1;
        
    this.currentIndex.update(index => index >= maxIndex ? 0 : index + 1);
  }

  prevSlide() {
    const maxIndex = window.innerWidth > 1024 
      ? 0 
      : window.innerWidth > 768 
        ? this.items.length - 2 
        : this.items.length - 1;

    this.currentIndex.update(index => index <= 0 ? maxIndex : index - 1);
  }
}
