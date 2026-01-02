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

  // Recomendaciones diarias
  dailyRecommendations: any = null;
  isLoadingRecommendations = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ tenders: TenderItem[] }>('assets/mock_tenders.json')
      .subscribe(data => {
        this.all = data.tenders;
      });
    
    // Cargar recomendaciones diarias
    this.loadDailyRecommendations();
  }

  loadDailyRecommendations() {
    // Verificar si hay recomendaciones en localStorage que aún sean válidas
    const cachedData = localStorage.getItem('daily_recommendations');
    const cacheTimestamp = localStorage.getItem('daily_recommendations_timestamp');
    
    if (cachedData && cacheTimestamp) {
      const cacheTime = new Date(cacheTimestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
      
      // Si han pasado menos de 24 horas, usar caché
      if (hoursDiff < 24) {
        console.log('📦 Usando recomendaciones del caché local (válidas por', (24 - hoursDiff).toFixed(1), 'horas más)');
        this.dailyRecommendations = JSON.parse(cachedData);
        this.isLoadingRecommendations = false;
        return;
      }
    }
    
    // Si no hay caché válido, consultar al backend
    this.isLoadingRecommendations = true;
    console.log('🔍 Consultando nuevas recomendaciones diarias...');
    
    this.http.get<any>('http://127.0.0.1:8000/api/v1/recommendations/daily')
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta recibida:', response);
          if (response.success) {
            this.dailyRecommendations = response.data;
            
            // Guardar en localStorage con timestamp
            localStorage.setItem('daily_recommendations', JSON.stringify(response.data));
            localStorage.setItem('daily_recommendations_timestamp', new Date().toISOString());
            
            console.log('📊 Recomendaciones guardadas en caché hasta:', new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString());
          }
          this.isLoadingRecommendations = false;
        },
        error: (err) => {
          console.error('❌ Error cargando recomendaciones:', err);
          this.isLoadingRecommendations = false;
        }
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
    try { 
      return new Intl.NumberFormat('es-EC', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(v); 
    } catch { 
      return v.toString(); 
    }
  }

  // Formatear número sin símbolo de moneda (para mostrar valores)
  formatNumber(v: number) {
    try { 
      return new Intl.NumberFormat('es-EC', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(v); 
    } catch { 
      return v.toString(); 
    }
  }

  // Formatear input mientras el usuario escribe
  onBidAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Guardar posición del cursor antes de formatear
    const cursorPos = input.selectionStart || 0;
    const oldValue = value;
    
    // Remover todo excepto números y el separador decimal
    // Permitir punto o coma como separador decimal
    value = value.replace(/[^\d.,]/g, '');
    
    // Contar cuántos separadores hay antes del cursor para ajustar posición
    const separatorsBeforeCursor = (oldValue.substring(0, cursorPos).match(/[.,]/g) || []).length;
    
    // Convertir comas a puntos para procesar
    value = value.replace(/,/g, '.');
    
    // Asegurar solo un punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      // Mantener la parte entera y solo los primeros 2 decimales
      value = parts[0] + '.' + parts.slice(1).join('').substring(0, 2);
    } else if (parts.length === 2) {
      // Limitar a 2 decimales
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Convertir a número
    const numValue = parseFloat(value) || 0;
    this.bidAmount = numValue;
    
    // Formatear para mostrar con separadores de miles
    if (value && value !== '0') {
      // Separar parte entera y decimal
      const valueParts = value.split('.');
      const integerPart = valueParts[0] || '0';
      const decimalPart = valueParts[1] || '';
      
      // Formatear parte entera con separadores de miles (puntos)
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      // Construir valor formateado
      let formatted = formattedInteger;
      if (value.includes('.')) {
        formatted += ',' + decimalPart;
      }
      
      this.bidAmountFormatted = formatted;
      input.value = formatted;
      
      // Calcular nueva posición del cursor
      const newSeparatorsBeforeCursor = (formatted.substring(0, cursorPos).match(/\./g) || []).length;
      const diff = newSeparatorsBeforeCursor - separatorsBeforeCursor;
      const newCursorPos = Math.min(cursorPos + diff, formatted.length);
      
      // Restaurar posición del cursor
      setTimeout(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      this.bidAmountFormatted = '';
      input.value = '';
    }
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
  bidAmountFormatted = '';
  contractStartDate = '';
  contractEndDate = '';
  isLoadingPrediction = false;
  loadingProgress = 0;
  loadingMessage = '';
  predictionResult: {
    probability: number;
    recommendation: string;
  } | null = null;

  getAIRecommendation(tender: TenderItem) {
    this.selectedTender = tender;
    this.showAIModal = true;
    this.bidAmount = tender.budget_amount * 0.95; // Sugerir 5% menos que presupuesto
    this.bidAmountFormatted = new Intl.NumberFormat('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(this.bidAmount);
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
    this.loadingProgress = 0;
    this.loadingMessage = '';
    this.bidAmountFormatted = '';
  }

  cancelPrediction() {
    this.isLoadingPrediction = false;
    this.loadingProgress = 0;
    this.loadingMessage = '';
    alert('Predicción cancelada. No se consumieron créditos.');
  }

  async requestPrediction() {
    if (!this.selectedTender || this.bidAmount <= 0) return;

    this.isLoadingPrediction = true;
    this.loadingProgress = 0;
    this.loadingMessage = 'Iniciando análisis...';

    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      if (this.loadingProgress < 90) {
        this.loadingProgress += Math.random() * 15;
        if (this.loadingProgress > 90) this.loadingProgress = 90;
        
        // Cambiar mensajes según el progreso
        if (this.loadingProgress < 30) {
          this.loadingMessage = 'Analizando datos históricos...';
        } else if (this.loadingProgress < 60) {
          this.loadingMessage = 'Procesando con CatBoost...';
        } else if (this.loadingProgress < 90) {
          this.loadingMessage = 'Generando recomendación con GPT...';
        }
      }
    }, 300);

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

      // Completar la barra de progreso
      clearInterval(progressInterval);
      this.loadingProgress = 100;
      this.loadingMessage = '¡Análisis completado!';

      // Pequeño delay para mostrar el 100%
      await new Promise(resolve => setTimeout(resolve, 500));

      this.predictionResult = {
        probability: response.predicted_win_probability,
        recommendation: response.recommendation
      };
    } catch (error: any) {
      clearInterval(progressInterval);
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
      this.loadingProgress = 0;
      this.loadingMessage = '';
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
