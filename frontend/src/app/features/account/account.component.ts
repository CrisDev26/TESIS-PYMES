import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { CompanyService, Company } from '../../services/company.service';
import { LocationService } from '../../services/location.service';
import { UserService } from '../auth/user.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavbarComponent, SidebarComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  // Sección principal activa
  activeSection: 'usuario' | 'empresa' = 'usuario';
  
  // Subsección activa de Mi Perfil
  activeUserSubsection: 'personal' | 'contacto' | 'configuracion' = 'personal';
  
  // Modo de empresa: seleccionar, crear o editar
  companyMode: 'select' | 'create' | 'edit' = 'select';

  // Toast notifications
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Información del usuario/colaborador
  userProfile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    username: '',
    avatarDataUrl: ''
  };

  // Información de la empresa
  companyInfo = {
    id: null as number | null,
    legalName: '',
    tradeName: '',
    displayName: '',
    ruc: '',
    incorporationDate: '',
    email: '',
    phone: '',
    website: '',
    countryId: 0,
    provinceId: 0,
    cityId: 0,
    addressLine: '',
    postalCode: '',
    logoDataUrl: '',
    companyTypeId: null as number | null,
    sectorId: null as number | null,
    companySizeId: null as number | null
  };

  // Lista de empresas disponibles
  availableCompanies: Company[] = [];
  
  // RUC para búsqueda
  searchRuc = '';

  // Estado de membresía del usuario
  isCompanyAdmin = false;
  membershipStatus: 'pending' | 'approved' | 'rejected' = 'pending';

  // Usuarios pendientes de aprobación (solo para admins)
  pendingUsers: any[] = [];

  // Datos de ubicación
  countries: any[] = [];
  provinces: any[] = [];
  cities: any[] = [];
  
  @ViewChild('f') formRef?: NgForm;
  @ViewChild('formNavRef') formNavRef?: ElementRef<HTMLElement>;

  formHoverVisible = false;
  formHoverTop = 0;
  formHoverHeight = 0;

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadAvailableCompanies();
    this.loadCountries();
  }

  get formHoverTransform(): string {
    return `translateY(${this.formHoverTop}px)`;
  }

  loadUserProfile(): void {
    // Intentar cargar datos del usuario guardados
    const saved = localStorage.getItem('pyme-user-profile');
    if (saved) {
      try {
        this.userProfile = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading user profile', e);
      }
    }

    // Cargar email del usuario desde localStorage (guardado al hacer login)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail && !this.userProfile.email) {
      this.userProfile.email = userEmail;
    }

    // Cargar username desde localStorage si existe
    const username = localStorage.getItem('username');
    if (username && !this.userProfile.username) {
      this.userProfile.username = username;
    }

    // Cargar estado de membresía y rol de admin
    const membershipStatus = localStorage.getItem('membershipStatus');
    if (membershipStatus) {
      this.membershipStatus = membershipStatus as 'pending' | 'approved' | 'rejected';
    }

    const isCompanyAdmin = localStorage.getItem('isCompanyAdmin');
    if (isCompanyAdmin) {
      this.isCompanyAdmin = isCompanyAdmin === 'true';
    }

    // Cargar empresa asociada si existe
    const companyId = localStorage.getItem('companyId');
    if (companyId && companyId !== '0') {
      this.companyService.getCompany(Number(companyId)).subscribe({
        next: (company) => {
          this.selectCompany(company);
          // Si es admin, cargar usuarios pendientes
          if (this.isCompanyAdmin) {
            this.loadPendingUsers();
          }
        },
        error: (err) => {
          console.error('Error loading user company', err);
        }
      });
    }
  }

  loadPendingUsers(): void {
    const companyId = localStorage.getItem('companyId');
    if (!companyId || companyId === '0') return;

    this.userService.getPendingUsers(Number(companyId)).subscribe({
      next: (users) => {
        this.pendingUsers = users;
      },
      error: (err) => {
        console.error('Error loading pending users', err);
      }
    });
  }

  approveMembership(userId: number, approve: boolean): void {
    const action = approve ? 'aprobar' : 'rechazar';
    if (!confirm(`¿Está seguro de ${action} este usuario?`)) {
      return;
    }

    this.userService.approveMembership(userId, approve).subscribe({
      next: () => {
        this.showToast(
          approve ? 'Usuario aprobado exitosamente' : 'Usuario rechazado',
          'success'
        );
        this.loadPendingUsers();
      },
      error: (err) => {
        console.error('Error approving/rejecting user', err);
        this.showToast('Error al procesar la solicitud', 'error');
      }
    });
  }

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

  get hasUnsavedChanges(): boolean {
    return !!this.formRef?.dirty;
  }

  navigateSection(target: 'usuario' | 'empresa'): void {
    if (this.activeSection === target) return;

    if (this.hasUnsavedChanges) {
      const shouldSave = window.confirm('Tienes cambios sin guardar. ¿Deseas guardarlos?');
      if (shouldSave) {
        this.saveUserProfile();
        this.formRef?.form.markAsPristine();
      }
    }
    this.activeSection = target;
  }

  navigateUserSubsection(target: 'personal' | 'contacto' | 'configuracion'): void {
    this.activeUserSubsection = target;
  }

  loadAvailableCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.availableCompanies = companies;
      },
      error: (err) => {
        console.error('Error loading companies', err);
      }
    });
  }

  searchCompanyByRuc(): void {
    if (!this.searchRuc || this.searchRuc.length !== 13) {
      this.showToast('El RUC debe tener 13 dígitos.', 'error');
      return;
    }

    this.companyService.searchByRuc(this.searchRuc).subscribe({
      next: (company) => {
        if (company) {
          this.selectCompany(company);
          this.showToast('Empresa encontrada.', 'success');
        } else {
          this.showToast('No se encontró empresa con ese RUC.', 'error');
        }
      },
      error: (err) => {
        console.error('Error searching company', err);
        this.showToast('Error al buscar empresa.', 'error');
      }
    });
  }

  selectCompany(company: Company): void {
    this.companyInfo = {
      id: company.id,
      legalName: company.legal_name,
      tradeName: company.trade_name || '',
      displayName: company.display_name || '',
      ruc: company.tax_id,
      incorporationDate: company.incorporation_date || '',
      email: company.email || '',
      phone: company.phone || '',
      website: company.website || '',
      countryId: company.country_id,
      provinceId: company.province_id,
      cityId: company.city_id,
      addressLine: company.address_line || '',
      postalCode: company.postal_code || '',
      logoDataUrl: company.logo_url || '',
      companyTypeId: company.company_type_id || null,
      sectorId: company.sector_id || null,
      companySizeId: company.company_size_id || null
    };
    this.companyMode = 'edit';
  }

  setCompanyMode(mode: 'select' | 'create' | 'edit'): void {
    this.companyMode = mode;
    if (mode === 'create') {
      // Limpiar formulario
      this.companyInfo = {
        id: null,
        legalName: '',
        tradeName: '',
        displayName: '',
        ruc: '',
        incorporationDate: '',
        email: '',
        phone: '',
        website: '',
        countryId: 0,
        provinceId: 0,
        cityId: 0,
        addressLine: '',
        postalCode: '',
        logoDataUrl: '',
        companyTypeId: null,
        sectorId: null,
        companySizeId: null
      };
    }
  }

  validateRuc(ruc: string): boolean {
    // Validación básica de RUC ecuatoriano (13 dígitos)
    if (!/^\d{13}$/.test(ruc)) {
      return false;
    }
    // Aquí podrías agregar validación más compleja del RUC
    return true;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.userProfile.avatarDataUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveUserProfile(): void {
    // Validación básica
    if (!this.userProfile.firstName || !this.userProfile.lastName || !this.userProfile.email) {
      this.showToast('Por favor completa los campos obligatorios.', 'error');
      return;
    }

    // Obtener ID del usuario
    const userId = localStorage.getItem('userId');
    if (!userId || userId === '0') {
      this.showToast('Error: No se encontró el ID del usuario.', 'error');
      return;
    }

    // Preparar datos para actualizar
    const updateData = {
      first_name: this.userProfile.firstName,
      last_name: this.userProfile.lastName,
      phone: this.userProfile.phone,
      position: this.userProfile.position,
      username: this.userProfile.username
    };

    // Llamar al backend para actualizar
    this.userService.updateUser(Number(userId), updateData).subscribe({
      next: (updatedUser) => {
        // Guardar en localStorage también
        localStorage.setItem('pyme-user-profile', JSON.stringify(this.userProfile));
        localStorage.setItem('username', updatedUser.username || '');
        
        this.showToast('Perfil actualizado correctamente.', 'success');
        this.formRef?.form.markAsPristine();
      },
      error: (err) => {
        console.error('Error updating profile', err);
        this.showToast('Error al actualizar el perfil.', 'error');
      }
    });
  }

  saveCompany(): void {
    // Validar RUC
    if (!this.validateRuc(this.companyInfo.ruc)) {
      this.showToast('RUC inválido. Debe tener 13 dígitos.', 'error');
      return;
    }

    // Validar campos requeridos
    if (!this.companyInfo.legalName || !this.companyInfo.email) {
      this.showToast('Complete los campos requeridos.', 'error');
      return;
    }

    const companyData = {
      legal_name: this.companyInfo.legalName,
      trade_name: this.companyInfo.tradeName,
      display_name: this.companyInfo.displayName,
      tax_id: this.companyInfo.ruc,
      incorporation_date: this.companyInfo.incorporationDate,
      email: this.companyInfo.email,
      phone: this.companyInfo.phone,
      website: this.companyInfo.website,
      country_id: this.companyInfo.countryId,
      province_id: this.companyInfo.provinceId,
      city_id: this.companyInfo.cityId,
      address_line: this.companyInfo.addressLine,
      postal_code: this.companyInfo.postalCode,
      logo_url: this.companyInfo.logoDataUrl,
      company_type_id: this.companyInfo.companyTypeId ?? undefined,
      sector_id: this.companyInfo.sectorId ?? undefined,
      company_size_id: this.companyInfo.companySizeId ?? undefined
    };

    if (this.companyMode === 'create') {
      this.companyService.createCompany(companyData).subscribe({
        next: (company) => {
          this.companyInfo.id = company.id;
          
          // Asignar automáticamente al usuario como administrador de la empresa
          const userId = localStorage.getItem('userId');
          if (userId && userId !== '0') {
            this.userService.updateUser(Number(userId), {
              company_id: company.id,
              is_company_admin: true,
              membership_status: 'approved'
            }).subscribe({
              next: () => {
                // Actualizar estado local
                localStorage.setItem('companyId', company.id.toString());
                localStorage.setItem('isCompanyAdmin', 'true');
                localStorage.setItem('membershipStatus', 'approved');
                
                this.isCompanyAdmin = true;
                this.membershipStatus = 'approved';
                
                this.showToast('Empresa creada exitosamente. Ahora eres el administrador.', 'success');
              },
              error: (err) => {
                console.error('Error updating user with company', err);
                this.showToast('Empresa creada pero hubo un error al asignar permisos.', 'error');
              }
            });
          } else {
            this.showToast('Empresa creada exitosamente.', 'success');
          }
          
          this.companyMode = 'edit';
          this.loadAvailableCompanies();
        },
        error: (err) => {
          console.error('Error creating company', err);
          this.showToast('Error al crear empresa. Verifique que el RUC no esté registrado.', 'error');
        }
      });
    } else if (this.companyMode === 'edit' && this.companyInfo.id) {
      if (!this.isCompanyAdmin) {
        this.showToast('No tiene permisos para editar la empresa.', 'error');
        return;
      }

      this.companyService.updateCompany(this.companyInfo.id, companyData).subscribe({
        next: () => {
          this.showToast('Empresa actualizada exitosamente.', 'success');
          this.loadAvailableCompanies();
        },
        error: (err) => {
          console.error('Error updating company', err);
          this.showToast('Error al actualizar empresa.', 'error');
        }
      });
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.companyInfo.logoDataUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  loadCountries(): void {
    this.locationService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (err) => {
        console.error('Error loading countries', err);
      }
    });
  }

  onCountryChange(): void {
    this.provinces = [];
    this.cities = [];
    this.companyInfo.provinceId = 0;
    this.companyInfo.cityId = 0;

    if (this.companyInfo.countryId > 0) {
      this.locationService.getProvinces(this.companyInfo.countryId).subscribe({
        next: (provinces) => {
          this.provinces = provinces;
        },
        error: (err) => {
          console.error('Error loading provinces', err);
        }
      });
    }
  }

  onProvinceChange(): void {
    this.cities = [];
    this.companyInfo.cityId = 0;

    if (this.companyInfo.provinceId > 0) {
      this.locationService.getCities(this.companyInfo.provinceId).subscribe({
        next: (cities) => {
          this.cities = cities;
        },
        error: (err) => {
          console.error('Error loading cities', err);
        }
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
