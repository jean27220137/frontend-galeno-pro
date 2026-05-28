# Galenos Pro — Frontend

Frontend del sistema de gestión hospitalaria **Galenos Pro**, desarrollado con Angular 21.
Proporciona la interfaz de usuario para los módulos clínicos y administrativos del sistema,
comunicándose con los microservicios del backend mediante JWT.

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | ^21.0.0 |
| Angular CDK | ^21.0.0 |
| PrimeNG | ^21.1.6 |
| PrimeIcons | ^7.0.0 |
| @primeuix/themes | ^2.0.0 |
| Tailwind CSS | ^3.4.14 |
| Chart.js | ^4.4.4 |
| RxJS | ~7.8.0 |
| TypeScript | ~5.9.3 |
| Zone.js | ~0.15.0 |

---

## Requisitos previos

- **Node.js 18.19.0** o superior
- **npm 9+**
- **Angular CLI 21**

```bash
npm install -g @angular/cli@21
```

---

## Instalación

```bash
git clone https://github.com/tu-usuario/frontend-galeno-pro.git
cd frontend-galeno-pro
npm install
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo (`http://localhost:4200`) |
| `npm run start:qa` | Servidor de desarrollo con configuración QA |
| `npm run build` | Compilación de producción |
| `npm run build:qa` | Compilación con configuración QA |
| `npm run build:prod` | Compilación de producción explícita |
| `npm test` | Ejecuta pruebas unitarias con Karma y Jasmine |
| `npm run watch` | Compilación en modo watch (desarrollo) |
| `npm run lint` | Análisis de código con ESLint |

---

## Configuración de entornos

El proyecto dispone de tres perfiles de entorno en `src/environments/`:

| Archivo | Entorno | URL auth-service | URL farmacia-service |
|---|---|---|---|
| `environment.ts` | Development | `http://localhost:8085/api/v1` | `http://localhost:8081/api/v1` |
| `environment.qa.ts` | QA | `https://api-qa.galenosp.com/api/v1` | — |
| `environment.prod.ts` | Production | `https://api.galenosp.com/api/v1` | — |

Para desarrollo local, asegúrate de que los microservicios del backend
(`auth-service` en el puerto `8085` y `farmacia-service` en el `8081`) estén
en ejecución antes de arrancar el frontend.

Para ajustar las URLs base edita el campo `apiBaseUrl` y `farmaciaApiUrl`
en el archivo de entorno correspondiente. No incluyas tokens, contraseñas
ni claves en estos archivos.

---

## Estructura de carpetas

```
src/
├── app/
│   ├── core/                        # Servicios y utilidades globales
│   │   ├── guards/                  # auth.guard, admin.guard
│   │   ├── interceptors/            # auth.interceptor (adjunta el token JWT)
│   │   └── services/               # AuthService, UserService, NotificationService
│   │
│   ├── shared/                      # Elementos reutilizables entre features
│   │   ├── components/
│   │   │   ├── layout/              # MainLayoutComponent (shell principal)
│   │   │   └── navbar/              # NavbarComponent
│   │   └── models/                  # user.model.ts (interfaces compartidas)
│   │
│   ├── features/                    # Módulos funcionales por dominio
│   │   ├── auth/                    # Login y cambio de contraseña
│   │   ├── farmacia/                # Módulo de inventario farmacéutico (activo)
│   │   ├── dashboard/               # Panel de resumen general
│   │   ├── consulta-externa/        # Gestión de consultas ambulatorias
│   │   ├── emergencia/              # Atención de urgencias
│   │   ├── hospitalizacion/         # Control de hospitalización
│   │   ├── programacion/            # Programación de citas y quirófanos
│   │   ├── caja/                    # Caja y cobros
│   │   └── facturacion/             # Facturación electrónica
│   │
│   ├── app.routes.ts                # Enrutamiento principal (lazy loading)
│   └── app.config.ts                # Configuración global de la aplicación
│
└── environments/                    # Perfiles development / qa / production
```

---

## Módulos funcionales

| Módulo | Ruta | Estado | Descripción |
|---|---|---|---|
| **auth** | `/auth/login` | Activo | Login con credenciales y cambio de contraseña. |
| **farmacia** | `/farmacia` | Activo | Gestión de categorías, inventario de productos, lotes, movimientos de entrada/salida y alertas de stock bajo y vencimiento. |
| **dashboard** | `/dashboard` | En desarrollo | Panel con métricas y resumen general del sistema. |
| **consulta-externa** | `/consulta-externa` | En desarrollo | Registro y seguimiento de consultas ambulatorias. |
| **emergencia** | `/emergencia` | En desarrollo | Atención y triage de pacientes de urgencias. |
| **hospitalizacion** | `/hospitalizacion` | En desarrollo | Control de camas, ingresos y altas hospitalarias. |
| **programacion** | `/programacion` | En desarrollo | Programación de citas médicas y quirúrgicas. |
| **caja** | `/caja` | En desarrollo | Registro de pagos y movimientos de caja. |
| **facturacion** | `/facturacion` | En desarrollo | Generación y gestión de facturas electrónicas. |

> Los módulos en estado **En desarrollo** existen en el código fuente pero sus rutas
> están deshabilitadas temporalmente. Para habilitarlos, descomentar los bloques
> correspondientes en `src/app/app.routes.ts`.

---

## Pruebas

El proyecto utiliza **Karma + Jasmine** con cobertura de código habilitada por defecto.

```bash
npm test
# Reporte de cobertura HTML: coverage/galenos-pro/index.html
```

El módulo `features/farmacia` cuenta con pruebas unitarias que cubren
servicios (con `HttpClientTestingModule`) y componentes (con mocks de servicios).
