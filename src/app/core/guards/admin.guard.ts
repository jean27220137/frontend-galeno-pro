import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn() && authService.userRole() === 'ADMIN') {
    return true;
  }

  router.navigate(['/farmacia/dashboard']);
  return false;
};
