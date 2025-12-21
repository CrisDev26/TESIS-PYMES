import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TenderService, TenderCreateRequest } from '../../services/tender.service';
import { LocationService } from '../../services/location.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-publish-tender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish-tender.component.html',
  styleUrls: ['./publish-tender.component.css']
})
export class PublishTenderComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  
  // Datos del formulario
  tender: TenderCreateRequest = {
    external_id: '',
    title: '',
    ocid: '',
    description: '',
    status: 'active',
    main_category: '',
    buyer_name: '',
    buyer_ruc: '',
    buyer_region: '',
    buyer_city: '',
    buyer_address: '',
    budget_amount: undefined,
    budget_currency: 'USD',
    estimated_value: undefined,
    tender_start_date: '',
    tender_end_date: '',
    contract_start_date: '',
    contract_end_date: '',
    number_of_tenderers: undefined,
    award_criteria: '',
    country_id: undefined,
    requirement_city_id: undefined
  };

  // Opciones de listas
  categories = [
    { value: 'Bienes', label: 'Bienes' },
    { value: 'Servicios', label: 'Servicios' },
    { value: 'Obras', label: 'Obras' }
  ];

  statuses = [
    { value: 'active', label: 'Activa' },
    { value: 'closed', label: 'Cerrada' },
    { value: 'awarded', label: 'Adjudicada' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  countries: any[] = [];
  cities: any[] = [];

  // Estados de UI
  isSubmitting = false;
  errorMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private tenderService: TenderService,
    private locationService: LocationService,
    public modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.generateExternalId();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  generateExternalId(): void {
    // Generar ID externo automáticamente: LICI-YYYY-NNNN
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.tender.external_id = `LICI-${year}-${random}`;
    
    // Generar OCID siguiendo estándar Open Contracting: ocds-xxxxxx-YYYY-NNNN
    this.tender.ocid = `ocds-ec-${year}-${random}`;
  }

  loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (countries: any[]) => {
        this.countries = countries;
      },
      error: (err: any) => {
        console.error('Error al cargar países:', err);
      }
    });
  }

  onCountryChange(): void {
    if (this.tender.country_id) {
      // Cargar todas las ciudades (el backend podría filtrar por país si es necesario)
      this.locationService.getCities().subscribe({
        next: (cities: any[]) => {
          this.cities = cities;
        },
        error: (err: any) => {
          console.error('Error al cargar ciudades:', err);
        }
      });
    } else {
      this.cities = [];
      this.tender.requirement_city_id = undefined;
    }
  }

  validateRuc(): boolean {
    if (this.tender.buyer_ruc && this.tender.buyer_ruc.length > 0) {
      const rucPattern = /^\d{13}$/;
      return rucPattern.test(this.tender.buyer_ruc);
    }
    return true; // RUC es opcional
  }

  validateDates(): boolean {
    if (this.tender.tender_start_date && this.tender.tender_end_date) {
      return new Date(this.tender.tender_start_date) <= new Date(this.tender.tender_end_date);
    }
    if (this.tender.contract_start_date && this.tender.contract_end_date) {
      return new Date(this.tender.contract_start_date) <= new Date(this.tender.contract_end_date);
    }
    return true;
  }

  onSubmit(): void {
    // Validaciones
    if (!this.tender.title) {
      this.showToast('Por favor completa el título de la licitación', 'error');
      return;
    }

    if (!this.validateRuc()) {
      this.showToast('El RUC debe tener exactamente 13 dígitos', 'error');
      return;
    }

    if (!this.validateDates()) {
      this.showToast('Las fechas de fin deben ser posteriores a las fechas de inicio', 'error');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Limpiar campos vacíos
    const tenderData: any = { ...this.tender };
    Object.keys(tenderData).forEach(key => {
      if (tenderData[key] === '' || tenderData[key] === undefined) {
        delete tenderData[key];
      }
    });

    this.tenderService.createTender(tenderData).subscribe({
      next: (response) => {
        this.showToast('Licitación publicada exitosamente', 'success');
        setTimeout(() => {
          this.router.navigate(['/licitaciones']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al publicar licitación:', err);
        this.errorMessage = err.error?.detail || 'Error al publicar la licitación';
        this.showToast(this.errorMessage, 'error');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.modalService.closePublishTenderModal();
  }

  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
