import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tender {
  id?: number;
  external_id: string;
  ocid?: string;
  title: string;
  description?: string;
  status?: string;
  main_category?: string;
  buyer_name?: string;
  buyer_ruc?: string;
  buyer_region?: string;
  buyer_city?: string;
  buyer_address?: string;
  budget_amount?: number;
  budget_currency?: string;
  estimated_value?: number;
  tender_start_date?: string;
  tender_end_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  publish_date?: string;
  number_of_tenderers?: number;
  award_criteria?: string;
  country_id?: number;
  requirement_city_id?: number;
  publishing_company_id?: number;
  created_by_user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TenderSummary {
  id: number;
  title: string;
  status?: string;
  main_category?: string;
  buyer_name?: string;
  budget_amount?: number;
  budget_currency?: string;
  tender_start_date?: string;
  tender_end_date?: string;
  publishing_company_id: number;
  created_at: string;
}

export interface TenderCreateRequest {
  external_id: string;
  title: string;
  ocid?: string;
  description?: string;
  status?: string;
  main_category?: string;
  buyer_name?: string;
  buyer_ruc?: string;
  buyer_region?: string;
  buyer_city?: string;
  buyer_address?: string;
  budget_amount?: number;
  budget_currency?: string;
  estimated_value?: number;
  tender_start_date?: string;
  tender_end_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  publish_date?: string;
  number_of_tenderers?: number;
  award_criteria?: string;
  country_id?: number;
  requirement_city_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/tenders';

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva licitación
   */
  createTender(tender: TenderCreateRequest): Observable<Tender> {
    return this.http.post<Tender>(`${this.apiUrl}/`, tender);
  }

  /**
   * Listar todas las licitaciones con filtros opcionales
   */
  getTenders(
    excludeParticipated: boolean = false,
    statusFilter?: string,
    categoryFilter?: string,
    skip: number = 0,
    limit: number = 100
  ): Observable<TenderSummary[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (excludeParticipated) {
      params = params.set('exclude_participated', 'true');
    }

    if (statusFilter) {
      params = params.set('status_filter', statusFilter);
    }

    if (categoryFilter) {
      params = params.set('category_filter', categoryFilter);
    }

    return this.http.get<TenderSummary[]>(`${this.apiUrl}/`, { params });
  }

  /**
   * Obtener licitaciones de mi empresa
   */
  getMyCompanyTenders(skip: number = 0, limit: number = 100): Observable<Tender[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<Tender[]>(`${this.apiUrl}/my-company`, { params });
  }

  /**
   * Obtener detalle de una licitación
   */
  getTender(tenderId: number): Observable<Tender> {
    return this.http.get<Tender>(`${this.apiUrl}/${tenderId}`);
  }

  /**
   * Actualizar una licitación
   */
  updateTender(tenderId: number, tender: Partial<TenderCreateRequest>): Observable<Tender> {
    return this.http.put<Tender>(`${this.apiUrl}/${tenderId}`, tender);
  }

  /**
   * Eliminar una licitación
   */
  deleteTender(tenderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tenderId}`);
  }
}
