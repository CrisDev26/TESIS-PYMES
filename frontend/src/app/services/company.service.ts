import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: number;
  legal_name: string;
  trade_name?: string;
  display_name?: string;
  tax_id: string;
  incorporation_date?: string;
  email?: string;
  phone?: string;
  website?: string;
  country_id: number;
  province_id: number;
  city_id: number;
  address_line?: string;
  postal_code?: string;
  logo_url?: string;
  company_type_id?: number;
  sector_id?: number;
  company_size_id?: number;
  created_at?: string;
}

export interface CompanyCreate {
  legal_name: string;
  tax_id: string;
  country_id: number;
  province_id: number;
  city_id: number;
  trade_name?: string;
  display_name?: string;
  incorporation_date?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line?: string;
  postal_code?: string;
  logo_url?: string;
  company_type_id?: number;
  sector_id?: number;
  company_size_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/companies';

  constructor(private http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/`);
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}/`);
  }

  createCompany(company: CompanyCreate): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/`, company);
  }

  updateCompany(id: number, company: Partial<CompanyCreate>): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}/`, company);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  // Buscar empresa por RUC
  searchByRuc(ruc: string): Observable<Company | null> {
    return this.http.get<Company | null>(`${this.apiUrl}/search/ruc/${ruc}`);
  }
}
