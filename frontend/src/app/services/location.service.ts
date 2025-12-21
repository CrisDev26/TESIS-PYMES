import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Country {
  id: number;
  name: string;
  code?: string;
}

export interface Province {
  id: number;
  name: string;
  country_id: number;
}

export interface City {
  id: number;
  name: string;
  province_id: number;
}

export interface Canton {
  id: number;
  name: string;
  province_id: number;
}

export interface Parish {
  id: number;
  name: string;
  canton_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/countries/`);
  }

  getProvinces(countryId?: number): Observable<Province[]> {
    const url = countryId 
      ? `${this.baseUrl}/provinces/?country_id=${countryId}`
      : `${this.baseUrl}/provinces/`;
    return this.http.get<Province[]>(url);
  }

  getCities(provinceId?: number): Observable<City[]> {
    const url = provinceId 
      ? `${this.baseUrl}/cities/?province_id=${provinceId}`
      : `${this.baseUrl}/cities/`;
    return this.http.get<City[]>(url);
  }

  getCantons(provinceId?: number): Observable<Canton[]> {
    const url = provinceId 
      ? `${this.baseUrl}/cantons/?province_id=${provinceId}`
      : `${this.baseUrl}/cantons/`;
    return this.http.get<Canton[]>(url);
  }

  getParishes(cantonId?: number): Observable<Parish[]> {
    const url = cantonId 
      ? `${this.baseUrl}/parishes/?canton_id=${cantonId}`
      : `${this.baseUrl}/parishes/`;
    return this.http.get<Parish[]>(url);
  }
}
