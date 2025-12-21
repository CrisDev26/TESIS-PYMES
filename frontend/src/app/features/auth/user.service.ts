import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  position?: string;
  username?: string;
  company_id?: number;
  is_company_admin?: boolean;
  membership_status?: string;
}

export interface UserDto {
  id: number;
  company_id: number | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone?: string | null;
  position?: string | null;
  username: string;
  membership_status: string;
  is_company_admin: boolean;
  is_active: boolean;
  created_at?: string | null;
  last_login_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/v1/users';

  constructor(private http: HttpClient) {}

  createUser(payload: CreateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(this.baseUrl + '/', payload);
  }

  getUser(userId: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${userId}`);
  }

  updateUser(userId: number, payload: UpdateUserRequest): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.baseUrl}/${userId}`, payload);
  }

  getPendingUsers(companyId: number): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseUrl}/company/${companyId}/pending`);
  }

  approveMembership(userId: number, approve: boolean): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.baseUrl}/${userId}/approve-membership?approve=${approve}`, {});
  }
}
