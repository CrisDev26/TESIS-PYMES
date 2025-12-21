import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublishTenderComponent } from './features/tenders/publish-tender.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PublishTenderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Título de la aplicación usado por pruebas y metadatos
  title = 'PymeCore';
}
