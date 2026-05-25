import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home';
// Importe tes autres composants ici, par exemple :
// import { AproposComponent } from './components/apropos/apropos.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: '', component: HomeComponent },
  
  // Ajoute les autres ici :
  // { path: 'apropos', component: AproposComponent },
  
  // Cette ligne évite les erreurs 404 en redirigeant tout le reste vers home
  { path: '**', redirectTo: '' } 
];