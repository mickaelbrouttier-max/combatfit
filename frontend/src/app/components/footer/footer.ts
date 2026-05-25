import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer-section">
      <div class="container footer-container">
        <!-- Copyright -->
        <div class="footer-copy">
          <p>© 2026 Coaching Karate - Tous droits réservés</p>
        </div>

        <!-- Links -->
        <div class="footer-links">
          <a href="#" (click)="$event.preventDefault()" class="footer-link">Mentions légales</a>
          <span class="divider">|</span>
          <a href="#" (click)="$event.preventDefault()" class="footer-link">Politique de confidentialité</a>
        </div>

        <!-- Social Icons -->
        <div class="footer-socials">
          <!-- Instagram -->
          <a href="https://www.instagram.com/combatfitentrainement/" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Instagram">
            <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          <!-- Facebook -->
          <a href="https://www.facebook.com/profile.php?id=61576724577190" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Facebook">
            <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-section {
      background-color: #08080A;
      color: var(--text-muted);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 30px 0;
      font-size: 0.85rem;
    }
    
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .footer-copy p {
      margin: 0;
    }
    
    .footer-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .footer-link:hover {
      color: var(--primary-red);
    }
    
    .divider {
      color: rgba(255, 255, 255, 0.15);
    }
    
    .footer-socials {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .social-icon {
      color: var(--text-muted);
      transition: var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .social-icon:hover {
      color: var(--primary-red);
      transform: scale(1.1);
    }
    
    .svg-icon {
      width: 20px;
      height: 20px;
    }
    
    /* Floating WhatsApp Widget */
    .floating-whatsapp {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background-color: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-white);
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
      z-index: 999;
      transition: var(--transition-medium);
    }
    
    .floating-whatsapp:hover {
      transform: scale(1.1) rotate(8deg);
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.6);
    }
    
    .whatsapp-icon {
      width: 32px;
      height: 32px;
    }
    
    .whatsapp-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #25D366;
      border-radius: 50%;
      z-index: -1;
      opacity: 0.4;
      animation: pulse-ring 2s infinite ease-out;
    }
    
    @keyframes pulse-ring {
      0% {
        transform: scale(0.95);
        opacity: 0.5;
      }
      50% {
        opacity: 0.3;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }
    
    /* Responsive Styling */
    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }
      .footer-socials {
        order: -1; /* Place social icons at the top on mobile */
      }
      .floating-whatsapp {
        bottom: 16px;
        right: 16px;
        width: 50px;
        height: 50px;
      }
      .whatsapp-icon {
        width: 26px;
        height: 26px;
      }
    }
  `]
})
export class FooterComponent {}
