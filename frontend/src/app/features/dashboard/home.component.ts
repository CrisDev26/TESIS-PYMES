import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

interface TenderItem {
  id: number;
  external_id: string;
  ocid: string;
  title: string;
  description: string;
  status: string;
  main_category: string;
  buyer_name: string;
  buyer_ruc: string;
  budget_amount: number;
  budget_currency: string;
  tender_start_date: string;
  tender_end_date: string;
  tender_duration_days: number;
  number_of_tenderers: number;
  procedure_type: string;
  has_enquiries: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Filtros
  q = '';
  category = '';
  minBudget: number | null = null;
  maxBudget: number | null = null;
  showOpen = true;
  showClosed = true;

  categories = ['Bienes', 'Servicios', 'Obras'];

  // Dropdown de categorías
  catOpen = false;
  @ViewChild('catBox') catBox?: ElementRef;

  // Datos de licitaciones
  all: TenderItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ tenders: TenderItem[] }>('assets/mock_tenders.json')
      .subscribe(data => {
        this.all = data.tenders;
      });
  }

  get filtered() {
    const q = this.q.trim().toLowerCase();
    return this.all.filter(t => {
      if (q && !(t.title.toLowerCase().includes(q) || t.buyer_name.toLowerCase().includes(q) || t.external_id.toLowerCase().includes(q))) return false;
      if (this.category && t.main_category !== this.category) return false;
      if (this.minBudget != null && t.budget_amount < this.minBudget) return false;
      if (this.maxBudget != null && t.budget_amount > this.maxBudget) return false;
      const isOpen = t.status === 'active';
      const isClosed = t.status === 'complete';
      if (!this.showOpen && isOpen) return false;
      if (!this.showClosed && isClosed) return false;
      return true;
    });
  }

  get openResults() { return this.filtered.filter(t => t.status === 'active'); }
  get closedResults() { return this.filtered.filter(t => t.status === 'complete'); }

  resetFilters() {
    this.q = '';
    this.category = '';
    this.minBudget = null;
    this.maxBudget = null;
    this.showOpen = true;
    this.showClosed = true;
  }

  formatMoney(v: number) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v); } catch { return v.toString(); }
  }

  // UI helpers para el nuevo panel
  clearQ() { this.q = ''; }
  clearCategory() { this.category = ''; }
  clearMin() { this.minBudget = null; }
  clearMax() { this.maxBudget = null; }
  toggleStatus(which: 'open' | 'closed') {
    if (which === 'open') this.showOpen = !this.showOpen;
    else this.showClosed = !this.showClosed;
    // Evitar estado sin resultados posibles (ambos en false) → reactivar ambos
    if (!this.showOpen && !this.showClosed) { this.showOpen = this.showClosed = true; }
  }
  hasActiveFilters() {
    return !!(this.q || this.category || this.minBudget != null || this.maxBudget != null);
  }

  // UI: Dropdown de categorías
  toggleCatMenu() { this.catOpen = !this.catOpen; }
  selectCategory(c: string) { this.category = c; this.catOpen = false; }
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.catOpen) return;
    const target = ev.target as Node;
    if (this.catBox && !this.catBox.nativeElement.contains(target)) {
      this.catOpen = false;
    }
  }

  // Modal de recomendación IA
  showAIModal = false;
  selectedTender: TenderItem | null = null;
  bidAmount = 0;
  contractStartDate = '';
  contractEndDate = '';
  isLoadingPrediction = false;
  predictionResult: {
    probability: number;
    recommendation: string;
  } | null = null;

  getAIRecommendation(tender: TenderItem) {
    this.selectedTender = tender;
    this.showAIModal = true;
    this.bidAmount = tender.budget_amount * 0.95; // Sugerir 5% menos que presupuesto
    this.predictionResult = null;
    
    // Calcular fechas sugeridas (contrato de 1 año desde hoy)
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    this.contractStartDate = today.toISOString().split('T')[0];
    this.contractEndDate = nextYear.toISOString().split('T')[0];
  }

  closeAIModal() {
    this.showAIModal = false;
    this.selectedTender = null;
    this.predictionResult = null;
    this.isLoadingPrediction = false;
  }

  cancelPrediction() {
    this.isLoadingPrediction = false;
    alert('Predicción cancelada. No se consumieron créditos.');
  }

  async requestPrediction() {
    if (!this.selectedTender || this.bidAmount <= 0) return;

    this.isLoadingPrediction = true;

    // Calcular duración del contrato en días
    const contractDurationDays = this.calculateDaysBetween(this.contractStartDate, this.contractEndDate);

    try {
      console.log('Enviando request a /predict...');

      const response = await this.http.post<any>('http://127.0.0.1:8000/api/v1/participations/predict', {
        tender_data: {
          title: this.selectedTender.title,
          description: this.selectedTender.description,
          main_category: this.selectedTender.main_category,
          budget_amount: this.selectedTender.budget_amount,
          buyer_name: this.selectedTender.buyer_name,
          eligibility_criteria: this.selectedTender.has_enquiries ? 'Cumplir requisitos técnicos y legales' : 'Requisitos estándar',
          number_of_tenderers: this.selectedTender.number_of_tenderers,
          tender_duration_days: this.selectedTender.tender_duration_days
        },
        bid_amount: this.bidAmount,
        contract_duration_days: contractDurationDays
      }).toPromise();

      console.log('Respuesta recibida:', response);

      this.predictionResult = {
        probability: response.predicted_win_probability,
        recommendation: response.recommendation
      };
    } catch (error: any) {
      console.error('Error completo:', error);
      let errorMsg = 'Error desconocido';
      
      if (error.status === 0) {
        errorMsg = 'No se puede conectar al backend. Verifica que esté corriendo en http://127.0.0.1:8000';
      } else if (error.error?.detail) {
        errorMsg = `Error del servidor: ${JSON.stringify(error.error.detail)}`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(`Error al obtener la recomendación:\n\n${errorMsg}`);
    } finally {
      this.isLoadingPrediction = false;
    }
  }

  calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 365; // Default 1 año
  }
}
