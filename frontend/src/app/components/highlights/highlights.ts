import { Component } from '@angular/core';

@Component({
  selector: 'app-highlights',
  template: `
    <section class="highlights-section">
      <div class="container">
        <div class="highlights-grid">
          <!-- Highlight Item 1 -->
          <div class="highlight-item">
            <div class="icon-container">
              <span class="material-icons-outlined">sports_kabaddi</span>
            </div>
            <div class="highlight-text">
              <h3 class="highlight-title">Professeur de Karaté</h3>
              <p class="highlight-desc">Plus de 10 ans d'expérience</p>
            </div>
          </div>

          <!-- Highlight Item 2 -->
          <div class="highlight-item">
            <div class="icon-container">
              <span class="material-icons-outlined">fitness_center</span>
            </div>
            <div class="highlight-text">
              <h3 class="highlight-title">Préparateur Physique</h3>
              <p class="highlight-desc">Performance & prévention</p>
            </div>
          </div>

          <!-- Highlight Item 3 -->
          <div class="highlight-item">
            <div class="icon-container">
              <span class="material-icons-outlined">my_location</span>
            </div>
            <div class="highlight-text">
              <h3 class="highlight-title">Accompagnement Personnalisé</h3>
              <p class="highlight-desc">Adapté à ton niveau et tes objectifs</p>
            </div>
          </div>

          <!-- Highlight Item 4 -->
          <div class="highlight-item">
            <div class="icon-container">
              <span class="material-icons-outlined">self_improvement</span>
            </div>
            <div class="highlight-text">
              <h3 class="highlight-title">Discipline - Performance - Progression</h3>
              <p class="highlight-desc">Approche complète du corps et du mental</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .highlights-section {
      background-color: var(--primary-red);
      color: var(--text-white);
      padding: 30px 0;
      z-index: 10;
      box-shadow: 0 4px 20px rgba(208, 0, 0, 0.25);
    }
    
    .highlights-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    
    .highlight-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 10px;
      transition: var(--transition-fast);
    }
    
    .highlight-item:hover {
      transform: translateY(-2px);
    }
    
    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      background-color: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }
    
    .icon-container span {
      font-size: 1.6rem;
      color: var(--text-white);
    }
    
    .highlight-text {
      display: flex;
      flex-direction: column;
    }
    
    .highlight-title {
      font-family: var(--font-headings);
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    
    .highlight-desc {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }
    
    /* Responsive styling */
    @media (max-width: 1024px) {
      .highlights-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;
      }
    }
    
    @media (max-width: 600px) {
      .highlights-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .highlights-section {
        padding: 40px 0;
      }
    }
  `]
})
export class HighlightsComponent {}
