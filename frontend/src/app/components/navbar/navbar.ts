import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  template: `
    <header class="navbar" [class.scrolled]="isScrolled()">
      <div class="navbar-container">
        <a href="#accueil" class="logo-area" (click)="goToHome()">
          <img src="images/logo_torii.png" alt="Torii Gate Logo" class="logo-img" />
          <div class="logo-text">
            <span class="logo-title">COACHING KARATÉ</span>
            <span class="logo-subtitle">PRÉPARATION PHYSIQUE</span>
          </div>
        </a>

        <!-- Desktop Menu -->
        <nav class="nav-menu">
          <a href="#accueil" class="nav-link active">Accueil</a>
          <a href="#apropos" class="nav-link">À Propos</a>
          <a href="#services" class="nav-link">Services</a>
          <a href="#videos" class="nav-link">Vidéos</a>
          <a href="#galerie" class="nav-link">Galerie</a>
          <a href="#testimonials" class="nav-link">Témoignages</a>
          <a href="#contact" class="nav-link">Contact</a>
          <a (click)="goToMemberSpace()" class="nav-link member-nav-link" style="cursor: pointer;">
            {{ isLoggedIn() ? 'Mon Espace' : 'Espace Membre' }}
          </a>
        </nav>

        <div class="nav-actions">
          <button id="nav-booking-btn" class="btn btn-primary rdv-btn" (click)="bookAppointment()">
            Prendre RDV
          </button>
          
          <!-- Mobile Menu Trigger -->
          <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Toggle Navigation">
            <span class="material-icons-outlined">{{ isMobileMenuOpen() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Drawer -->
      <div class="mobile-menu" [class.open]="isMobileMenuOpen()">
        <nav class="mobile-nav">
          <a href="#accueil" (click)="closeMobileMenu()" class="mobile-link">Accueil</a>
          <a href="#apropos" (click)="closeMobileMenu()" class="mobile-link">À Propos</a>
          <a href="#services" (click)="closeMobileMenu()" class="mobile-link">Services</a>
          <a href="#videos" (click)="closeMobileMenu()" class="mobile-link">Vidéos</a>
          <a href="#galerie" (click)="closeMobileMenu()" class="mobile-link">Galerie</a>
          <a href="#testimonials" (click)="closeMobileMenu()" class="mobile-link">Témoignages</a>
          <a href="#contact" (click)="closeMobileMenu()" class="mobile-link">Contact</a>
          <a (click)="goToMemberSpace(true)" class="mobile-link" style="cursor: pointer;">
            {{ isLoggedIn() ? 'Mon Espace' : 'Espace Membre' }}
          </a>
          <button class="btn btn-primary mobile-rdv-btn" (click)="bookAppointment(true)">
            Prendre RDV
          </button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  background-color: #000000; 
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 1000;
  transition: var(--transition-medium);
}
    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    
    .logo-img {
      height: 42px;
      width: auto;
      border-radius: 20px;
      object-fit: contain;
      filter: drop-shadow(0 0 5px rgba(208, 0, 0, 0.3));
      transition: var(--transition-medium);
    }
    
    .logo-text {
      display: flex;
      flex-direction: column;
      color: var(--text-white);
    }
    
    .logo-title {
      font-family: var(--font-headings);
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }
    
    .logo-subtitle {
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    
    .nav-link {
      font-family: var(--font-headings);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-light-grey);
      position: relative;
      padding: 8px 0;
    }
    
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--primary-red);
      transition: var(--transition-medium);
    }
    
    .nav-link:hover {
      color: var(--text-white);
    }
    
    .nav-link:hover::after, .nav-link.active::after {
      width: 100%;
    }

    .member-nav-link {
      color: #ff4d4d;
      font-weight: 700;
    }

    .member-nav-link::after {
      background-color: var(--text-white);
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .rdv-btn {
      padding: 10px 20px;
      font-size: 0.75rem;
      border-radius: var(--border-radius-sm);
    }
    
    .mobile-toggle {
      display: none;
      color: var(--text-white);
      font-size: 1.8rem;
      padding: 4px;
    }
    
    .mobile-menu {
      top: var(--header-height);
      left: 0;
      width: 100%;
      height: 0;
      background-color: rgba(10, 10, 12, 0.98);
      backdrop-filter: blur(20px);
      overflow: hidden;
      transition: var(--transition-medium);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .mobile-menu.open {
      height: calc(100vh - var(--header-height));
    }
    
    .mobile-nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 24px;
      gap: 24px;
    }
    
    .mobile-link {
      font-family: var(--font-headings);
      font-size: 1.25rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-white);
    }
    
    .mobile-link:hover {
      color: var(--primary-red);
    }
    
    .mobile-rdv-btn {
      width: 100%;
      max-width: 280px;
      margin-top: 16px;
    }
    
    @media (max-width: 992px) {
      .nav-menu {
        display: none;
      }
      
      .mobile-toggle {
        display: block;
      }
    }
  `]
})
export class NavbarComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  readonly isMobileMenuOpen = signal(false);
  readonly isScrolled = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 50);
      });
    }
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('member_token');
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToMemberSpace(isMobile: boolean = false) {
    if (isMobile) {
      this.closeMobileMenu();
    }
    if (this.isLoggedIn()) {
      this.router.navigate(['/espace-membre']);
    } else {
      this.router.navigate(['/connexion']);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  bookAppointment(isMobile: boolean = false) {
    if (isMobile) {
      this.closeMobileMenu();
    }
    this.bookingService.open();
  }
}
