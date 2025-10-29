import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router) {}

  profileMenuOpen = false;

  irInicio() {
    this.profileMenuOpen = false;
    this.router.navigateByUrl('/home');
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.profileMenuOpen) {
      this.profileMenuOpen = false;
    }
  }

  gestionarCuenta() {
    // Navega a la página de gestión de cuenta
    this.router.navigateByUrl('/account');
  }

  cerrarSesion() {
    // Placeholder: aquí limpiarías estado/autenticación
    this.router.navigateByUrl('/login');
  }
}
