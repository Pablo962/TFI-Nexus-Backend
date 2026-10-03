# NEXUS · Backend API REST (NestJS & TypeScript)

API REST empresarial para la plataforma de People Analytics y Gestión del Talento **NEXUS**. Desarrollada bajo arquitectura modular con **NestJS 12**, **TypeScript**, **Passport JWT (RBAC)** y generación de reportes en **Excel (.xlsx)** y **CSV**.

---

## 🚀 Inicio Rápido

### 1. Requisitos
* Node.js v20+ (probado en v25.1.0)
* npm v10+

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Configuración de entorno
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

### 4. Ejecutar el servidor en desarrollo
```bash
npm run start:dev
```
El servidor quedará disponible en:
* **API REST Base:** `http://localhost:4000/api/v1`
* **Swagger UI Interactiva:** `http://localhost:4000/api/docs`

---

## 🧪 Pruebas Automatizadas

El backend incluye una suite de pruebas con **Vitest**:
```bash
npm test
```
Para ver la cobertura:
```bash
npm run test:cov
```

---

## 📦 Compilación para Producción
```bash
npm run build
npm run start:prod
```

---

## 📂 Estructura de Módulos

```text
src/
├── common/             # Enums (Roles), Decoradores (@Roles, @CurrentUser), Guards (JWT, RBAC)
├── data/               # Semilla inicial con datos de colaboradores, puestos y glosario
├── modules/
│   ├── auth/           # Login, Registro, JWT y Passport Strategy
│   ├── employees/      # Directorio 360°, Talent Map y alertas SPOF
│   ├── jobs/           # Catálogo de cargos, vacantes y exportación de matriz
│   ├── recruitment/    # Pipeline de selección, Match Score y ofertas
│   ├── evaluations/    # Evaluaciones 360°, Matriz 9-Box y calibración colegiada
│   ├── training/       # Cursos, itinerarios de upskilling e inscripciones
│   ├── porter/         # Cadena de Valor (Porter) y simulador presupuestario
│   ├── reports/        # KPIs ejecutivos, heatmap de squads y exportación analítica
│   └── export/         # Generador de Excel (.xlsx) con ExcelJS y CSV con csv-stringify
├── app.module.ts       # Módulo raíz que integra toda la aplicación
└── main.ts             # Punto de entrada con CORS, ValidationPipe y Swagger OpenAPI
```

---

## 📑 Principales Endpoints y Exportaciones

| Método | Endpoint | Descripción | Formato de Salida |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Autenticación con credenciales | JSON con `access_token` |
| `GET` | `/api/v1/employees` | Directorio y fichas de colaboradores | JSON |
| `GET` | `/api/v1/employees/talent-map` | Red y flujo para Mapa de Talento | JSON |
| `GET` | `/api/v1/jobs` | Catálogo de puestos organizacionales | JSON |
| `GET` | `/api/v1/jobs/export?format=xlsx` | Exportar Matriz General de Puestos | **Excel (.xlsx)** / **CSV** |
| `POST` | `/api/v1/jobs/:code/open-vacancy` | Apertura de vacante de selección | JSON |
| `GET` | `/api/v1/recruitment/candidates` | Postulantes con cálculo de Match Score | JSON |
| `PATCH` | `/api/v1/recruitment/candidates/:id/stage` | Cambio de fase en el pipeline | JSON |
| `GET` | `/api/v1/evaluations/9box` | Distribución consolidada 9-Box Grid | JSON |
| `GET` | `/api/v1/evaluations/9box/export` | Acta del Comité de Calibración | **Excel (.xlsx)** / **CSV** |
| `PATCH` | `/api/v1/evaluations/:id/calibrate` | Consensuar nota en comité | JSON |
| `GET` | `/api/v1/training/tracks` | Itinerarios de cierre de brechas | JSON |
| `POST` | `/api/v1/training/enroll` | Asignar curso a colaborador | JSON |
| `GET` | `/api/v1/porter/activities` | Actividades primarias y de apoyo | JSON |
| `POST` | `/api/v1/porter/simulate` | Simulación de headcount y presupuesto | JSON |
| `GET` | `/api/v1/reports/dashboard-kpis` | KPIs ejecutivos en tiempo real | JSON |
| `GET` | `/api/v1/reports/export?format=xlsx` | Reporte analítico de squads | **Excel (.xlsx)** / **CSV** |
| `GET` | `/api/v1/reports/export/skills-json` | Inventario de competencias | **JSON** |
