# CONTEXTO DEL PROYECTO: GYMSYSTEM (Spring Boot + React)
Este archivo contiene las reglas absolutas del sistema. El asistente DEBE obedecer estas reglas al generar código Java (Spring Boot) o React.

## 1. STACK TECNOLÓGICO
- Backend: Java 17+, Spring Boot 3, Spring Data JPA, Spring Security + JWT, PostgreSQL.
- Frontend: React (Vite), Tailwind CSS, Axios, Recharts (gráficos), react-qr-code.

## 2. ENTIDADES JPA (19 Tablas Normalizadas a 3FN)
1. Usuario (id, nombre, email, password_cifrada, estado)
2. Rol (id, nombre_rol) -> Roles: GERENTE, ADMIN, RECEPCIONISTA, ENTRENADOR, SOCIO
3. Socio (id, usuario_id, dni, fecha_nacimiento, qr_code, estado_membresia)
4. Entrenador (id, usuario_id, especialidad)
5. Administrador_Recepcionista (id, usuario_id, tipo)
6. Plan_Membresia (id, nombre, duracion_dias, precio, estado)
7. Membresia (id, socio_id, plan_id, fecha_inicio, fecha_vencimiento, estado)
8. Pago (id, membresia_id, metodo_pago_id, monto, fecha_pago)
9. Metodo_Pago (id, nombre)
10. Comprobante (id, pago_id, numero_serie, fecha_emision, url_pdf)
11. Alerta_Notificacion (id, socio_id, mensaje, fecha_envio, tipo, estado)
12. Acceso (id, socio_id, metodo_acceso_id, fecha_hora, resultado, tipo_movimiento)
13. Metodo_Acceso (id, nombre) -> QR, DNI, BIOMETRICO
14. Rutina (id, socio_id, entrenador_id, nombre, fecha_asignacion, estado)
15. Ejercicio (id, nombre, descripcion, grupo_muscular)
16. Rutina_Ejercicio (id, rutina_id, ejercicio_id, series, repeticiones, peso)
17. Meta_Objetivo (id, socio_id, tipo_meta, valor_objetivo, fecha_limite, estado)
18. Medicion_Biometrica (id, socio_id, fecha_medicion, peso_kg, talla_cm, grasa_corporal_pct)
19. Reporte (id, tipo_reporte, fecha_generacion, parametros_json, url_archivo)

## 3. REGLAS DE NEGOCIO OBLIGATORIAS (RN-01 a RN-21)
[FINANZAS]
- RN-01: Si faltan <= 3 días para vencimiento, generar Alerta_Notificacion automática (@Scheduled).
- RN-02: Si fecha_actual > fecha_vencimiento, cambiar estado Socio/Membresia a "MOROSO" (@Scheduled).
- RN-03: Pago.monto NO PUEDE ser < Plan_Membresia.precio.
- RN-04: Nueva fecha_vencimiento = fecha_inicio + plan.duracion_dias (o fecha_vencimiento_anterior + duracion si renueva).
- RN-05: Un Socio solo puede tener 1 Membresia con estado "ACTIVA".
- RN-06: No eliminar Plan_Membresia si tiene Membresias activas (solo desactivar).
- RN-07: Todo Pago genera automáticamente 1 Comprobante.

[ACCESO]
- RN-08: Si Membresia está VENCIDA/SUSPENDIDA -> denegar Acceso (sin importar método).
- RN-09: TODO intento de acceso (éxito/fallo) se guarda en tabla Acceso con fecha/hora/resultado.
- RN-10: Si acceso denegado -> notificar a Recepción inmediatamente (WebSocket/Alerta).
- RN-11: Un Socio no puede registrar INGRESO si ya tiene un ingreso sin SALIDA.
- RN-12: Aforo real-time = Total(Ingresos hoy) - Total(Salidas hoy).

[ENTRENAMIENTO]
- RN-13: Solo el Entrenador asignado puede crear/modificar la Rutina de su Socio.
- RN-14: Una Rutina debe tener >= 1 Ejercicio para guardarse.
- RN-15: Medicion_Biometrica: peso/talla/grasa NO PUEDEN ser <= 0.
- RN-16: Historial biométrico es INMUTABLE (no se borra, solo se añaden nuevos).
- RN-17: Si medicion_reciente alcanza Meta_Objetivo -> marcar meta como "CUMPLIDA".
- RN-18: Socio solo marca ejercicios completados de su Rutina vigente.

[SEGURIDAD]
- RN-19: Control de acceso estricto por Rol (JWT Claims).
- RN-20: Passwords cifradas con BCrypt (NUNCA texto plano). Ley 29733 Perú.
- RN-21: No eliminar Usuarios con historial (pagos/accesos). Solo desactivar (estado = false).
