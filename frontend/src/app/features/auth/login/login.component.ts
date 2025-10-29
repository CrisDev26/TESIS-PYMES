import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSlideEffect();
  }

  // Método para cambiar a modo registro
  switchToSignUp(): void {
    const container = document.querySelector('.container');
    if (container) {
      container.classList.add('sign-up-mode');
      console.log('Cambiando a modo registro');
    }
  }

  // Método para cambiar a modo acceso
  switchToSignIn(): void {
    const container = document.querySelector('.container');
    if (container) {
      container.classList.remove('sign-up-mode');
      console.log('Cambiando a modo acceso');
    }
  }

  private initializeSlideEffect(): void {
    const signUpBtn = document.querySelector('#sign-up-btn');
    const signInBtn = document.querySelector('#sign-in-btn');
    const container = document.querySelector('.container');

    if (signUpBtn && signInBtn && container) {
      signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToSignUp();
      });

      signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToSignIn();
      });
    } else {
      console.error('No se encontraron los elementos necesarios para la transición');
    }
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    // Aquí normalmente validarías credenciales. Por ahora solo navegamos.
    this.router.navigateByUrl('/home');
  }
}
