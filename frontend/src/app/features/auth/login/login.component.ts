import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Estado para alternar entre Acceso y Registro
  isSignUp = false;

  constructor(private router: Router) {}

  // Método para cambiar a modo registro
  switchToSignUp(): void {
    this.isSignUp = true;
  }

  // Método para cambiar a modo acceso
  switchToSignIn(): void {
    this.isSignUp = false;
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    // Aquí normalmente validarías credenciales. Por ahora solo navegamos.
    this.router.navigateByUrl('/home');
  }
}
