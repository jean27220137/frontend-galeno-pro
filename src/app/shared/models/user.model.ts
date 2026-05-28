export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastLogin?: Date;
}

export type UserRole =
  | 'ADMIN'
  | 'MEDICO'
  | 'ENFERMERO'
  | 'FARMACEUTICO'
  | 'CAJA'
  | 'RECEPCION'
  | 'TECNICO_FARMACIA'
  | 'QUIMICO_FARMACEUTICO'
  | 'JEFE_FARMACIA'
  | 'AUXILIAR_ALMACEN';

export type TipoDocumento   = 'DNI' | 'CARNET_EXTRANJERIA' | 'PASAPORTE';
export type CondicionLaboral = 'NOMBRADO' | 'CAS' | 'TERCEROS';
export type EstadoUsuario    = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'VACACIONES';

export interface CreateUserRequest {
  /* Acceso */
  username:             string;
  correoInstitucional:  string;
  password:             string;
  roles:                string[];
  estado:               EstadoUsuario;
  firmaDigital?:        string;
  /* Personales */
  tipoDocumento:        TipoDocumento;
  numeroDocumento:      string;
  nombres:              string;
  apellidoPaterno:      string;
  apellidoMaterno:      string;
  fechaNacimiento:      string;
  telefono:             string;
  direccionDomicilio:   string;
  /* Profesionales */
  colegiatura?:         string;
  condicionLaboral:     CondicionLaboral;
  areaAsignada:         string;
  fechaIngreso:         string;
}

export interface UserListDto {
  id: number;
  username: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correoInstitucional: string;
  numeroDocumento: string;
  areaAsignada?: string;
  estado: EstadoUsuario;
  colegiatura?: string;
  roles: UserRole[];
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
