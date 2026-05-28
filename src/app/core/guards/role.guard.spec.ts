import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { signal, computed } from '@angular/core';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/user.model';

const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = {} as RouterStateSnapshot;

function buildAuthService(role: UserRole | null, loggedIn = true) {
  return {
    isLoggedIn: computed(() => loggedIn),
    userRole: computed(() => role),
  } as unknown as AuthService;
}

describe('roleGuard', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
  });

  it('permite acceso a ADMIN cuando ADMIN está en la lista de roles permitidos', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('ADMIN'),
    });
    const guard = roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('permite acceso a QUIMICO_FARMACEUTICO cuando está en la lista', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('QUIMICO_FARMACEUTICO'),
    });
    const guard = roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeTrue();
  });

  it('bloquea AUXILIAR_ALMACEN para la ruta de movimientos', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('AUXILIAR_ALMACEN'),
    });
    const guard = roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/farmacia/dashboard']);
  });

  it('bloquea TECNICO_FARMACIA para la ruta de categorias', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('TECNICO_FARMACIA'),
    });
    const guard = roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/farmacia/dashboard']);
  });

  it('bloquea usuario no autenticado aunque el rol esté en la lista', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('ADMIN', false),
    });
    const guard = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/farmacia/dashboard']);
  });

  it('bloquea usuario sin rol asignado', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService(null),
    });
    const guard = roleGuard(['ADMIN', 'JEFE_FARMACIA']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeFalse();
  });

  it('JEFE_FARMACIA puede acceder a movimientos', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('JEFE_FARMACIA'),
    });
    const guard = roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeTrue();
  });

  it('AUXILIAR_ALMACEN puede acceder a inventario', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: buildAuthService('AUXILIAR_ALMACEN'),
    });
    const guard = roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA', 'AUXILIAR_ALMACEN']);
    const result = TestBed.runInInjectionContext(() => guard(mockRoute, mockState));
    expect(result).toBeTrue();
  });
});
