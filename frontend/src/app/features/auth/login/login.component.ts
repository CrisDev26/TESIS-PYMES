import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Estado para alternar entre Acceso y Registro
  isSignUp = false;

  username: string = '';
  password: string = '';

  loginError: string | null = null;

  // Campos de registro
  signUpUsername: string = '';
  signUpEmail: string = '';
  signUpPassword: string = '';

  // Toast flotante
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  // Método para cambiar a modo registro
  switchToSignUp(): void {
    this.isSignUp = true;
  }

  // Método para cambiar a modo acceso
  switchToSignIn(): void {
    this.isSignUp = false;
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    console.log('showToast llamado:', { message, type });
    this.toastMessage = message;
    this.toastType = type;
    console.log('toastMessage establecido:', this.toastMessage);

    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.loginError = null;

    if (!this.username || !this.password) {
      this.showToast('Ingresa usuario y contraseña.', 'error');
      return;
    }

    this.authService.loginWithUsername(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        
        try {
          // Guardar datos del usuario en localStorage
          localStorage.setItem('userEmail', response.user.email || '');
          localStorage.setItem('username', response.user.username || '');
          localStorage.setItem('userId', response.user.id?.toString() || '0');
          localStorage.setItem('companyId', response.user.company_id?.toString() || '0');
          localStorage.setItem('isCompanyAdmin', response.user.is_company_admin?.toString() || 'false');
          localStorage.setItem('membershipStatus', response.user.membership_status || 'pending');
          
          // Guardar perfil completo
          localStorage.setItem('pyme-user-profile', JSON.stringify({
            firstName: response.user.first_name || '',
            lastName: response.user.last_name || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            position: response.user.position || '',
            username: response.user.username || '',
            avatarDataUrl: ''
          }));

          this.showToast('Inicio de sesión exitoso.', 'success');
          this.router.navigateByUrl('/home');
        } catch (error) {
          console.error('Error saving user data:', error);
          this.showToast('Error al guardar datos de sesión.', 'error');
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.showToast('Usuario o contraseña incorrectos.', 'error');
        } else {
          this.showToast('Ocurrió un error al iniciar sesión.', 'error');
        }
      },
    });
  }

  onSignUpSubmit(event: Event): void {
    event.preventDefault();

    console.log('onSignUpSubmit llamado', {
      username: this.signUpUsername,
      email: this.signUpEmail,
    });

    if (!this.signUpUsername || !this.signUpEmail || !this.signUpPassword) {
      console.log('Campos incompletos en registro');
      this.showToast('Completa usuario, correo y contraseña.', 'error');
      return;
    }

    this.userService
      .createUser({
        email: this.signUpEmail,
        username: this.signUpUsername,
        password: this.signUpPassword,
      })
      .subscribe({
        next: (user) => {
          console.log('Usuario creado exitosamente', user);
          this.showToast('Usuario creado exitosamente.', 'success');
          // Opcional: pasar automáticamente a modo login
          this.isSignUp = false;
          this.username = this.signUpUsername;
          this.signUpPassword = '';
        },
        error: (err) => {
          console.error('Error al registrar usuario', err);
          if (err.status === 400 && err.error?.detail === 'User with this email already exists') {
            this.showToast('Ya existe un usuario con ese correo.', 'error');
          } else {
            this.showToast('No se pudo registrar el usuario.', 'error');
          }
        },
      });
  }
}
