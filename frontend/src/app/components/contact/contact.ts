import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  template: `
    <section id="contact" class="contact-section">
      <!-- Background Image covering the right side -->
      <div class="contact-bg">
        <img src="images/matthias_punch.png" alt="Mathias Karate" class="contact-bg-img" />
        <div class="contact-overlay"></div>
        <div class="contact-red-glow"></div>
      </div>

      <div class="container contact-container">
        <!-- Call to Action Content -->
        <div class="contact-content">
          <p class="contact-subtitle">Prêt à passer au niveau supérieur ?</p>
          <h2 class="contact-title">Contacte-moi dès maintenant !</h2>
          
          <div class="contact-buttons">

            <!-- Email -->
            <a href="mailto:contact@mathiaskarate.com" class="btn btn-secondary contact-btn">
              <span class="material-icons-outlined">mail</span>
              Email
            </a>

            <!-- Instagram -->
            <a href="https://www.instagram.com/combatfitentrainement/" target="_blank" rel="noopener noreferrer" class="btn btn-secondary contact-btn">
              <span class="material-icons-outlined">photo_camera</span>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-section {
      background-color: #050507;
      color: var(--text-white);
      min-height: 400px;
      display: flex;
      align-items: center;
      padding: 80px 0;
      overflow: hidden;
      position: relative;
    }
    
    .contact-bg {
      position: absolute;
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
      z-index: 1;
    }
    
    .contact-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: left 25%;
      filter: grayscale(100%) contrast(150%) brightness(35%);
      mix-blend-mode: luminosity;
      transform: scaleX(-1);
    }
    
    .contact-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        #050507 0%,
        rgba(5, 5, 7, 0.9) 30%,
        rgba(5, 5, 7, 0.4) 100%
      );
    }
    
    .contact-red-glow {
      position: absolute;
      top: 50%;
      left: 20%;
      transform: translateY(-50%);
      width: 300px;
      height: 300px;
      background: radial-gradient(
        circle,
        rgba(208, 0, 0, 0.2) 0%,
        transparent 70%
      );
      filter: blur(40px);
      pointer-events: none;
    }
    
    .contact-container {
      position: relative;
      z-index: 2;
      width: 100%;
    }
    
    .contact-content {
      max-width: 650px;
    }
    
    .contact-subtitle {
      font-family: var(--font-headings);
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--accent-gold);
      margin-bottom: 12px;
    }
    
    .contact-title {
      font-size: 2.5rem;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 40px;
      line-height: 1.1;
      letter-spacing: -0.01em;
    }
    
    .contact-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .contact-btn {
      font-size: 0.8rem;
      padding: 12px 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Hover effects */
    .whatsapp-btn:hover {
      border-color: #25D366;
      box-shadow: 0 0 15px rgba(37, 211, 102, 0.3);
    }
    
    /* Responsive Styling */
    @media (max-width: 992px) {
      .contact-bg {
        width: 100%;
        opacity: 0.35;
      }
      .contact-overlay {
        background: linear-gradient(
          to bottom,
          rgba(5, 5, 7, 0.95) 0%,
          rgba(5, 5, 7, 0.8) 100%
        );
      }
      .contact-title {
        font-size: 2rem;
      }
    }
    
    @media (max-width: 768px) {
      .contact-section {
        padding: 60px 0;
      }
      .contact-buttons {
        flex-direction: column;
        width: 100%;
      }
      .contact-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ContactComponent {}
