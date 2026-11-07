# 🏋️ GYM_SYSTEM - Plataforma Integral de Gestión de Gimnasio

Sistema completo para la administración y operación de gimnasios modernos: control de membresías, rutinas interactivas con catálogo de 1,339 ejercicios visuales, métricas y reportes para gerencia, control de aforo y recepción, y portal de autoservicio para socios.

---

## 🛠️ Stack Tecnológico

* **Backend**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Spring Security con JWT, MySQL 8.
* **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Sonner.
* **Base de Datos**: MySQL (`gym_system`).

---

## 🚀 Puesta en Marcha

### 1. Base de Datos
Asegúrate de tener un servicio MySQL activo con la base de datos `gym_system`:
```sql
CREATE DATABASE IF NOT EXISTS gym_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (Spring Boot)
Desde la raíz del proyecto:
```bash
cd backend
./mvnw spring-boot:run
```
> **Nota de contraseña de BD**: Por defecto usa `broaster321`. Si tu MySQL usa otra contraseña, puedes pasarla vía variable de entorno:
> ```bash
> DB_PASSWORD='TuPassword' ./mvnw spring-boot:run
> ```
> El backend corre en `http://localhost:8080`.

### 3. Frontend (React + Vite)
En otra terminal desde la raíz:
```bash
cd frontend
npm install
npm run dev
```
> El frontend estará disponible en `http://localhost:5173`.

---

## 👥 Cuentas de Demostración

| Rol | Correo | Contraseña | Acceso / Panel |
| :--- | :--- | :--- | :--- |
| **Gerente** | `gerente@gmail.com` | `123456` | Dashboard, gestión de planes, KPIs y finanzas (`/gerente`) |
| **Recepción** | `recepcion@gmail.com` | `123456` | Registro de clientes, cobro de planes y control de accesos (`/recepcion`) |
| **Entrenador** | `entrenador@gmail.com` | `123456` | Asignación de rutinas con catálogo visual de 1,339 ejercicios (`/entrenador`) |
| **Socio** | `socio@gmail.com` | `123456` | Carnet digital QR, rutina activa con GIFs y registro de progreso (`/socio`) |

---

## ✨ Características Principales

1. **Catálogo de 1,339 Ejercicios**: Base de datos completa con animaciones GIF, descripción de técnica, músculo objetivo y equipo requerido.
2. **Sincronización en Tiempo Real**: Los planes modificados o creados por el Gerente se actualizan de forma instantánea en la página principal (`Landing`).
3. **Control de Membresías y Estados**: Gestión automática de vencimientos y estados (`ACTIVA` / `INACTIVO`).
4. **Control de Accesos y Aforo**: Validación de membresía vigente y control de concurrencia en tiempo real.
