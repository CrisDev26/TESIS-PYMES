import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar.component';

interface AccountInfo {
  // Identidad
  companyName: string;            // Razón social
  tradeName?: string;             // Nombre comercial
  taxId: string;                  // RUC/NIT/CIF/NIF
  companyType?: string;           // S.A., S.R.L., autónomo, etc.
  incorporationDate?: string;     // Fecha de constitución (YYYY-MM-DD)

  // Contacto
  email: string;                  // Email principal
  phone: string;                  // Teléfono principal
  website?: string;               // Sitio web

  // Dirección fiscal
  country: string;                // País
  state?: string;                 // Provincia/Estado/Departamento
  city?: string;                  // Ciudad
  address: string;                // Dirección
  postalCode?: string;            // Código postal

  // Branding
  logoDataUrl?: string;           // Logotipo

  // Responsable
  contactName?: string;           // Persona de contacto
  contactRole?: string;           // Cargo
  contactEmail?: string;          // Email de contacto
  contactPhone?: string;          // Teléfono de contacto

  // Sector
  sector?: string;                // Sector/industria
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  account: AccountInfo = {
    // Identidad
    companyName: '',
    tradeName: '',
    taxId: '',
    companyType: '',
    incorporationDate: '',

    // Contacto
    email: '',
    phone: '',
    website: '',

    // Dirección fiscal
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',

    // Responsable
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',

    // Sector
    sector: ''
  };

  companyTypes: string[] = [
    'S.A.', 'S.R.L.', 'Autónomo', 'S.A.C.', 'S.A.S.', 'Cooperativa', 'Otro'
  ];

  sectors: string[] = [
    'Tecnológica', 'Farmacéutica', 'Salud', 'Educación', 'Financiera', 'Construcción',
    'Agroindustrial', 'Logística', 'Energía', 'Retail/Comercio', 'Alimentaria',
    'Manufactura', 'Telecomunicaciones', 'Software / SaaS', 'E-commerce',
    'Servicios Profesionales', 'Turismo / Hotelería', 'Gobierno / ONG', 'Otro'
  ];

  constructor() {
    const saved = localStorage.getItem('pyme-account');
    if (saved) {
      try { this.account = JSON.parse(saved); } catch {}
    }
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.account.logoDataUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    localStorage.setItem('pyme-account', JSON.stringify(this.account));
    alert('Información guardada localmente.');
  }
}
