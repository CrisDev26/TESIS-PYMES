import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Permite controlar estado desde afuera
  @Input() collapsed = false;
  @ViewChild('menuRef') menuRef!: ElementRef<HTMLElement>;

  // Submenús abiertos
  open: { ventas: boolean; inventario: boolean; reportes: boolean } = {
    ventas: false,
    inventario: false,
    reportes: false,
  };

  // Indicador flotante de hover entre secciones
  hoverVisible = false;
  hoverTop = 0;
  hoverHeight = 0;

  get hoverTransform(): string {
    return `translateY(${this.hoverTop}px)`;
  }

  // Estado de presencia (placeholder hasta tener auth real)
  isOnline = true;

  constructor(
    private router: Router,
    private modalService: ModalService
  ) {}

  openPublishModal(): void {
    this.modalService.openPublishTenderModal();
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  toggle(key: keyof SidebarComponent['open']): void {
    this.open[key] = !this.open[key];
  }

  onItemEnter(event: MouseEvent): void {
    if (!this.menuRef) return;
    const el = event.currentTarget as HTMLElement;
    const parent = this.menuRef.nativeElement;
    // Posición relativa al contenedor del menú
    let offset = 0;
    let node: HTMLElement | null = el;
    while (node && node !== parent) {
      offset += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    this.hoverTop = offset;
    this.hoverHeight = el.offsetHeight;
    this.hoverVisible = true;
  }

  onMenuLeave(): void {
    this.hoverVisible = false;
  }

  logout(): void {
    // Limpieza mínima local
    try {
      localStorage.removeItem('auth-token');
      sessionStorage.removeItem('auth-token');
    } catch {}
    this.isOnline = false;
    // Navega al login si existe
    this.router.navigateByUrl('/login').catch(() => {
      // fallback simple
      window.location.href = '/login';
    });
  }
}
