import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ApiResponse,
} from '../../shared/models/user.model';

const TOKEN_KEY = 'gp_token';
const USER_KEY  = 'gp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // Signals de estado
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  private readonly _token       = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser() && !!this._token());
  readonly userFullName = computed(() => this._currentUser()?.fullName ?? '');
  readonly userRole     = computed(() => this._currentUser()?.role ?? null);

  /**
   * Login con validación del lado del cliente (usuario de prueba).
   * En producción reemplazar `of(mockResponse)` por llamada HTTP real.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, request)
      .pipe(
        tap(res => this.handleAuthSuccess(res)),
        catchError(err => {
          const msg = err.error?.message ?? 'Credenciales incorrectas';
          return throwError(() => new Error(msg));
        }),
      );
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${environment.apiBaseUrl}/auth/change-password`,
      request,
    );
  }

  getToken(): string | null {
    return this._token();
  }

  private handleAuthSuccess(res: LoginResponse): void {
    this._token.set(res.token);
    this._currentUser.set(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; }
    catch { return null; }
  }
}
