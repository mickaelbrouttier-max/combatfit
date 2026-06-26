import { Component, signal, inject, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  thumbnailUrl: string;
  embedUrl: SafeResourceUrl;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="videos" class="videos-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <p class="section-subtitle">Galerie Compétition</p>
          <h2 class="section-title">Mes combats en vidéo</h2>
          <div class="header-line"></div>
          <p class="section-desc">
            Vois la technique et l'intensité du karaté de compétition. Suis mon parcours complet durant le championnat de département, du premier combat jusqu'à la grande finale.
          </p>
        </div>

        <!-- Video Carousel -->
        <div class="carousel-wrapper">
          <!-- Control Buttons -->
          <button 
            class="carousel-nav-btn prev" 
            [class.disabled]="!canScrollLeft()"
            [disabled]="!canScrollLeft()"
            (click)="scroll('left', track)"
            aria-label="Vidéos précédentes"
          >
            <span class="material-icons-outlined">keyboard_arrow_left</span>
          </button>

          <div class="carousel-track" #track (scroll)="checkScroll(track)">
            @for (video of videos; track video.id; let idx = $index) {
              <div class="video-card animate-fade-in-up" 
                   [style.animation-delay]="(idx * 0.08) + 's'" 
                   (click)="openVideo(video)">
                <div class="card-visual">
                  <img [src]="video.thumbnailUrl" [alt]="'Combat ' + (idx + 1)" class="card-img" loading="lazy" />
                  <div class="card-overlay">
                    <div class="play-button-badge">
                      <span class="material-icons-outlined">play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <button 
            class="carousel-nav-btn next" 
            [class.disabled]="!canScrollRight()"
            [disabled]="!canScrollRight()"
            (click)="scroll('right', track)"
            aria-label="Vidéos suivantes"
          >
            <span class="material-icons-outlined">keyboard_arrow_right</span>
          </button>
        </div>
      </div>

      <!-- Lightbox Modal -->
      @if (selectedVideo(); as video) {
        <div class="modal-backdrop" (click)="closeVideo()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <!-- Close Button -->
            <button class="close-btn" (click)="closeVideo()" aria-label="Fermer la vidéo">
              <span class="material-icons-outlined">close</span>
            </button>

            <!-- Main Player & Navigation Wrapper -->
            <div class="player-wrapper">
              <!-- Prev Button -->
              <button class="nav-arrow-btn prev-btn" (click)="prevVideo()" aria-label="Vidéo précédente">
                <span class="material-icons-outlined">keyboard_arrow_left</span>
              </button>

              <!-- Video Iframe -->
              <div class="iframe-container">
                <iframe 
                  [src]="video.embedUrl" 
                  title="YouTube video player" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
                  allowfullscreen>
                </iframe>
              </div>

              <!-- Next Button -->
              <button class="nav-arrow-btn next-btn" (click)="nextVideo()" aria-label="Vidéo suivante">
                <span class="material-icons-outlined">keyboard_arrow_right</span>
              </button>
            </div>

            <!-- Video Info & Pagination -->
            <div class="modal-info">
              <div class="modal-info-header">
                <span class="modal-category">Combat {{ getSelectedIndex() + 1 }}</span>
                <span class="modal-counter">{{ getSelectedIndex() + 1 }} / {{ videos.length }}</span>
              </div>
              
              <!-- Direct selector dots -->
              <div class="modal-navigation-dots">
                @for (v of videos; track v.id; let idx = $index) {
                  <button class="dot" 
                          [class.active]="v.id === video.id" 
                          (click)="selectByIndex(idx)"
                          [attr.aria-label]="'Aller au combat ' + (idx + 1)">
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .videos-section {
      background-color: var(--dark-bg);
      color: var(--text-white);
      padding: 100px 0;
      position: relative;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
      color: var(--text-white);
      max-width: 600px;
      margin: 0 auto 16px auto;
    }
    
    .header-line {
      width: 60px;
      height: 3px;
      background-color: var(--primary-red);
      margin: 0 auto 20px auto;
    }

    .section-desc {
      font-size: 1rem;
      color: var(--text-muted);
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Carousel layout styles */
    .carousel-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0 50px;
    }

    .carousel-track {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      scrollbar-width: none; /* Firefox */
      width: 100%;
      padding: 12px 0; /* Space for hover shadow/transform */
    }

    .carousel-track::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
    
    .video-card {
      flex: 0 0 calc(33.333% - 16px);
      scroll-snap-align: start;
      background-color: var(--dark-card);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      border: 1px solid var(--dark-border);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: var(--transition-medium);
      opacity: 0; /* managed by animate-fade-in-up */
    }
    
    .video-card:hover {
      transform: translateY(-8px);
      border-color: rgba(208, 0, 0, 0.35);
      box-shadow: 0 10px 25px rgba(208, 0, 0, 0.2);
    }
    
    .card-visual {
      position: relative;
      aspect-ratio: 16 / 9;
      width: 100%;
      overflow: hidden;
      background-color: #000;
    }
    
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition-slow);
    }
    
    .video-card:hover .card-img {
      transform: scale(1.05);
    }
    
    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(0deg, rgba(10, 10, 12, 0.8) 0%, rgba(208, 0, 0, 0.25) 100%);
      opacity: 0.3;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-medium);
    }
    
    .video-card:hover .card-overlay {
      opacity: 1;
    }
    
    .play-button-badge {
      width: 50px;
      height: 50px;
      background-color: var(--primary-red);
      color: var(--text-white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--glow-red);
      transform: scale(0.8);
      transition: var(--transition-medium);
    }
    
    .video-card:hover .play-button-badge {
      transform: scale(1);
    }
    
    .play-button-badge span {
      font-size: 1.8rem;
      margin-left: 2px;
    }

    /* Carousel Nav Buttons */
    .carousel-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(10, 10, 12, 0.7);
      color: var(--text-white);
      border: 1px solid rgba(255, 255, 255, 0.15);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      z-index: 10;
      transition: var(--transition-medium);
    }

    .carousel-nav-btn:hover:not(.disabled) {
      background-color: var(--primary-red);
      border-color: var(--primary-red);
      box-shadow: var(--glow-red);
      color: var(--text-white);
    }

    .carousel-nav-btn.disabled {
      opacity: 0.25;
      cursor: not-allowed;
      pointer-events: none;
    }

    .carousel-nav-btn.prev {
      left: -12px;
    }

    .carousel-nav-btn.next {
      right: -12px;
    }

    /* Lightbox Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(5, 5, 7, 0.94);
      backdrop-filter: blur(16px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeIn 0.3s ease-out forwards;
    }

    .modal-container {
      position: relative;
      background-color: var(--dark-surface);
      border: 1px solid var(--dark-border);
      border-radius: var(--border-radius-md);
      width: 100%;
      max-width: 960px;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(208, 0, 0, 0.15);
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 2100;
      background-color: rgba(0, 0, 0, 0.5);
      color: var(--text-white);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .close-btn:hover {
      background-color: var(--primary-red);
      border-color: var(--primary-red);
      transform: scale(1.05);
    }

    .close-btn span {
      font-size: 1.3rem;
    }

    .player-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
      position: relative;
      background-color: #000;
    }

    .iframe-container {
      width: 100%;
      aspect-ratio: 16 / 9;
      position: relative;
    }

    .iframe-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .nav-arrow-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2050;
      background-color: rgba(10, 10, 12, 0.6);
      color: var(--text-white);
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: var(--transition-medium);
    }

    .nav-arrow-btn:hover {
      background-color: var(--primary-red);
      border-color: var(--primary-red);
      box-shadow: var(--glow-red);
    }

    .prev-btn {
      left: 20px;
    }

    .next-btn {
      right: 20px;
    }

    .nav-arrow-btn span {
      font-size: 2rem;
    }

    .modal-info {
      padding: 24px 30px;
      background-color: var(--dark-surface);
      border-top: 1px solid var(--dark-border);
      position: relative;
    }

    .modal-info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .modal-category {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary-red);
      letter-spacing: 0.1em;
    }

    .modal-counter {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .modal-navigation-dots {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 10px;
    }

    .dot {
      width: 10px;
      height: 10px;
      background-color: rgba(255, 255, 255, 0.15);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: var(--transition-fast);
      padding: 0;
    }

    .dot:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }

    .dot.active {
      background-color: var(--primary-red);
      box-shadow: var(--glow-red);
      transform: scale(1.2);
    }

    /* Keyframes for animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments for carousel and modal */
    @media (max-width: 1200px) {
      .video-card {
        flex: 0 0 calc(33.333% - 16px);
      }
    }

    @media (max-width: 900px) {
      .video-card {
        flex: 0 0 calc(50% - 12px);
      }
      .carousel-wrapper {
        padding: 0 30px;
      }
      .carousel-nav-btn {
        width: 40px;
        height: 40px;
      }
      .carousel-nav-btn.prev { left: -5px; }
      .carousel-nav-btn.next { right: -5px; }
    }

    @media (max-width: 768px) {
      .modal-backdrop {
        padding: 12px;
      }
      .nav-arrow-btn {
        width: 44px;
        height: 44px;
      }
      .prev-btn { left: 8px; }
      .next-btn { right: 8px; }
      .nav-arrow-btn span { font-size: 1.5rem; }
      .modal-info { padding: 16px 20px; }
      .modal-desc { font-size: 0.8rem; }
    }

    @media (max-width: 600px) {
      .video-card {
        flex: 0 0 100%;
      }
      .carousel-wrapper {
        padding: 0 10px;
      }
      .carousel-nav-btn {
        display: none;
      }
      .carousel-track {
        padding: 5px 0;
      }
    }
  `]
})
export class VideosComponent implements AfterViewInit {
  private readonly sanitizer = inject(DomSanitizer);
  readonly selectedVideo = signal<VideoItem | null>(null);

  @ViewChild('track') trackElement!: ElementRef<HTMLDivElement>;
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(true);

  readonly videos: VideoItem[] = [
    {
      id: 'YR31GHnAPhI',
      title: 'Combat département 1',
      subtitle: 'Premier tour qualificatif',
      category: '1er Combat'
    },
    {
      id: 'owPe-jF6BG0',
      title: 'Combat département 2',
      subtitle: 'Deuxième tour éliminatoire',
      category: '2e Combat'
    },
    {
      id: '3gm8oqDbVPs',
      title: 'Combat département 3',
      subtitle: 'Troisième tour de tableau',
      category: '3e Combat'
    },
    {
      id: 'opWm0AwMLUA',
      title: 'Combat département 4',
      subtitle: 'Quart de finale',
      category: '4e Combat'
    },
    {
      id: '4X44htDtRxg',
      title: 'Combat département 5',
      subtitle: 'Demi-finale du championnat',
      category: 'Demi-Finale'
    },
    {
      id: 'X1tojyqNFsM',
      title: 'Combat département 6',
      subtitle: 'Finale de tableau',
      category: 'Finale Tableau'
    },
    {
      id: 'o03AB0yzuio',
      title: 'Combat département finale 1',
      subtitle: 'Grande finale or',
      category: 'Grande Finale'
    }
  ].map(v => ({
    ...v,
    thumbnailUrl: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
    embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`)
  }));

  ngAfterViewInit(): void {
    if (this.trackElement && typeof window !== 'undefined') {
      setTimeout(() => {
        this.checkScroll(this.trackElement.nativeElement);
      }, 150);
    }
  }

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.selectedVideo()) return;
    if (event.key === 'Escape') {
      this.closeVideo();
    } else if (event.key === 'ArrowRight') {
      this.nextVideo();
    } else if (event.key === 'ArrowLeft') {
      this.prevVideo();
    }
  }

  getSelectedIndex(): number {
    const current = this.selectedVideo();
    if (!current) return -1;
    return this.videos.findIndex(v => v.id === current.id);
  }

  openVideo(video: VideoItem): void {
    this.selectedVideo.set(video);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeVideo(): void {
    this.selectedVideo.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  nextVideo(): void {
    const currentIndex = this.getSelectedIndex();
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % this.videos.length;
    this.selectedVideo.set(this.videos[nextIndex]);
  }

  prevVideo(): void {
    const currentIndex = this.getSelectedIndex();
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + this.videos.length) % this.videos.length;
    this.selectedVideo.set(this.videos[prevIndex]);
  }

  selectByIndex(index: number): void {
    if (index >= 0 && index < this.videos.length) {
      this.selectedVideo.set(this.videos[index]);
    }
  }

  checkScroll(track: HTMLDivElement): void {
    this.canScrollLeft.set(track.scrollLeft > 5);
    this.canScrollRight.set(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 5
    );
  }

  scroll(direction: 'left' | 'right', track: HTMLDivElement): void {
    const cardWidth = track.firstElementChild ? (track.firstElementChild as HTMLElement).offsetWidth + 24 : 300;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}
