import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateUserRequest,
  UserListDto,
  UpdateUserRolesRequest,
} from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/users`;

  createUser(request: CreateUserRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/register`, request);
  }

  getAll(): Observable<UserListDto[]> {
    return this.http.get<UserListDto[]>(this.base);
  }

  updateRoles(id: number, request: UpdateUserRolesRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/roles`, request);
  }

  toggleEnabled(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
