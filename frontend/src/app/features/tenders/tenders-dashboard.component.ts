import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

interface TenderItem {
  id: string;
  title: string;
  status: 'open' | 'closed';
  publishedAt: string; // ISO date
  closesAt?: string;   // ISO date for open tenders
  budget: number;      // in local currency
  category: string;
  buyer: string;
}

@Component({
  selector: 'app-tenders-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './tenders-dashboard.component.html',
  styleUrl: './tenders-dashboard.component.css'
})
export class TendersDashboardComponent {
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

  // Datos mock
  all: TenderItem[] = [
    { id: 'OCID-001', title: 'Adquisición de equipos de cómputo', status: 'open',  publishedAt: '2025-11-01', closesAt: '2025-11-25', budget: 120000, category: 'Bienes',    buyer: 'Municipalidad de Lima' },
    { id: 'OCID-002', title: 'Mantenimiento de red vial',        status: 'closed',publishedAt: '2025-08-10',                       budget: 950000,  category: 'Obras',     buyer: 'Provías' },
    { id: 'OCID-003', title: 'Servicio de limpieza institucional',status: 'open',  publishedAt: '2025-11-05', closesAt: '2025-11-22', budget: 180000, category: 'Servicios', buyer: 'Hospital Regional' },
    { id: 'OCID-004', title: 'Reparación de tuberías',           status: 'closed',publishedAt: '2025-07-03',                       budget: 300000,  category: 'Obras',     buyer: 'EPS Norte' },
    { id: 'OCID-005', title: 'Compra de mobiliario escolar',     status: 'open',  publishedAt: '2025-11-12', closesAt: '2025-11-28', budget: 75000,  category: 'Bienes',    buyer: 'UGEL 04' },
  ];

  get filtered() {
    const q = this.q.trim().toLowerCase();
    return this.all.filter(t => {
      if (q && !(t.title.toLowerCase().includes(q) || t.buyer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))) return false;
      if (this.category && t.category !== this.category) return false;
      if (this.minBudget != null && t.budget < this.minBudget) return false;
      if (this.maxBudget != null && t.budget > this.maxBudget) return false;
      if (!this.showOpen && t.status === 'open') return false;
      if (!this.showClosed && t.status === 'closed') return false;
      return true;
    });
  }

  get openResults() { return this.filtered.filter(t => t.status === 'open'); }
  get closedResults() { return this.filtered.filter(t => t.status === 'closed'); }

  resetFilters() {
    this.q = '';
    this.category = '';
    this.minBudget = null;
    this.maxBudget = null;
    this.showOpen = true;
    this.showClosed = true;
  }

  formatMoney(v: number) {
    try { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(v); } catch { return v.toString(); }
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
}
