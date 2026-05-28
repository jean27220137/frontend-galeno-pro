import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (_route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.userRole();

    if (authService.isLoggedIn() && role && allowedRoles.includes(role)) {
      return true;
    }

    router.navigate(['/farmacia/dashboard']);
    return false;
  };
};
