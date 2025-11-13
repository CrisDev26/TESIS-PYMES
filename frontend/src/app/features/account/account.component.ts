import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

interface AccountInfo {
  // Identidad
  companyName: string;            // Razón social
  tradeName?: string;             // Nombre comercial
  taxId: string;                  // RUC/NIT/CIF/NIF
  companyType?: string;           // S.A., S.R.L., autónomo, etc.
  incorporationDate?: string;     // Fecha de constitución (YYYY-MM-DD)
  avatarDataUrl?: string;         // Foto de perfil
  displayName?: string;           // Nombre visible (empresa o persona)

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
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  // Sección activa (tabs sin scroll)
  activeSection: 'identidad' | 'contacto' | 'direccion' | 'responsable' | 'branding' = 'identidad';

  account: AccountInfo = {
    // Identidad
    companyName: '',
    tradeName: '',
    taxId: '',
    companyType: '',
    incorporationDate: '',
    avatarDataUrl: '',
    displayName: '',

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

  // Referencia al formulario para detectar cambios sin guardar
  // (Angular la rellena después de que el template se inicializa)
  @ViewChild('f') formRef?: NgForm;
  @ViewChild('formNavRef') formNavRef?: ElementRef<HTMLElement>;

  // Hover indicator para la navegación interna del formulario
  formHoverVisible = false;
  formHoverTop = 0;
  formHoverHeight = 0;
  get formHoverTransform(): string { return `translateY(${this.formHoverTop}px)`; }

  onFormNavItemEnter(event: MouseEvent): void {
    if (!this.formNavRef) return;
    const el = event.currentTarget as HTMLElement;
    const parent = this.formNavRef.nativeElement;
    let offset = 0;
    let node: HTMLElement | null = el;
    while (node && node !== parent) {
      offset += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    this.formHoverTop = offset;
    this.formHoverHeight = el.offsetHeight;
    this.formHoverVisible = true;
  }

  onFormNavLeave(): void {
    this.formHoverVisible = false;
  }

  get hasUnsavedChanges(): boolean { return !!this.formRef?.dirty; }

  // Cambiar de sección preguntando por guardado si hay cambios
  navigateSection(target: AccountComponent['activeSection']) {
    if (this.activeSection === target) return;

    if (this.hasUnsavedChanges) {
      const shouldSave = window.confirm('Tienes cambios sin guardar. ¿Deseas guardarlos antes de cambiar de sección?');
      if (shouldSave) {
        this.save();
        // El guardado por sí solo no limpia el estado sucio; lo marcamos manualmente
        this.formRef?.form.markAsPristine();
      }
    }
    this.activeSection = target;
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

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.account.avatarDataUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    localStorage.setItem('pyme-account', JSON.stringify(this.account));
    alert('Información guardada localmente.');
  }
}
