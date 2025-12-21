import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  username: string | null;
  email: string | null;
  password: string;
}

export interface UserDto {
  id: number;
  company_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  position?: string | null;
  username?: string | null;
  membership_status: string;
  is_company_admin: boolean;
  is_active: boolean;
  created_at?: string | null;
  last_login_at?: string | null;
}

export interface LoginResponse {
  user: UserDto;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/v1/auth';

  constructor(private http: HttpClient) {}

  loginWithUsername(username: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = {
      username,
      email: null,
      password,
    };
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body);
  }

  loginWithEmail(email: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = {
      username: null,
      email,
      password,
    };
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body);
  }
}
