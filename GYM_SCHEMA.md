# ESQUEMA EXACTO DE LA BD GYMSYSTEM (Motor: MySQL)
Las entidades JPA deben coincidir EXACTAMENTE con estas tablas y columnas.
Mapeo Java: INT->Long, VARCHAR->String, DATE->LocalDate, DATETIME->LocalDateTime, TIME->LocalTime, DECIMAL->BigDecimal, TINYINT(1)->Boolean.

1. Rol: id_rol PK, nombre_rol VARCHAR(50)
2. Usuario: id_usuario PK, id_rol FK->Rol, correo VARCHAR(100), contrasena VARCHAR(255), estado TINYINT(1)
3. Socio: id_socio PK, id_usuario FK->Usuario, dni VARCHAR(20), nombres VARCHAR(100), apellidos VARCHAR(100), telefono VARCHAR(20), fecha_nacimiento DATE
4. Entrenador: id_entrenador PK, id_usuario FK->Usuario, dni VARCHAR(20), nombres VARCHAR(100), apellidos VARCHAR(100), especialidad VARCHAR(100)
5. Administrador: id_administrador PK, id_usuario FK->Usuario, dni VARCHAR(20), nombres VARCHAR(100), apellidos VARCHAR(100), cargo VARCHAR(50)
6. Plan_Membresia: id_plan PK, nombre_plan VARCHAR(100), duracion_dias INT, tarifa DECIMAL(10,2), estado TINYINT(1)
7. Membresia: id_membresia PK, id_socio FK->Socio, id_plan FK->Plan_Membresia, fecha_inicio DATE, fecha_vencimiento DATE, estado VARCHAR(20)
8. Metodo_Pago: id_metodo_pago PK, nombre_metodo VARCHAR(50)
9. Pago: id_pago PK, id_membresia FK->Membresia, id_metodo_pago FK->Metodo_Pago, fecha_pago DATE, monto DECIMAL(10,2)
10. Comprobante: id_comprobante PK, id_pago FK->Pago, numero_serie VARCHAR(50), fecha_emision DATE, archivo_url VARCHAR(255)
11. Alerta_Notificacion: id_alerta PK, id_membresia FK->Membresia, tipo_alerta VARCHAR(50), fecha_envio DATETIME, estado_envio VARCHAR(20)
12. Metodo_Acceso: id_metodo_acceso PK, nombre_metodo VARCHAR(50)
13. Acceso: id_acceso PK, id_socio FK->Socio, id_metodo_acceso FK->Metodo_Acceso, fecha DATE, hora_ingreso TIME, hora_salida TIME, resultado VARCHAR(20)
14. Rutina: id_rutina PK, id_socio FK->Socio, id_entrenador FK->Entrenador, nombre_rutina VARCHAR(100), fecha_asignacion DATE, estado VARCHAR(20)
15. Ejercicio: id_ejercicio PK, nombre_ejercicio VARCHAR(100), descripcion VARCHAR(255), grupo_muscular VARCHAR(50)
16. Rutina_Ejercicio: id_rutina_ejercicio PK, id_rutina FK->Rutina, id_ejercicio FK->Ejercicio, series INT, repeticiones INT, completado TINYINT(1)
17. Meta_Objetivo: id_meta PK, id_socio FK->Socio, id_entrenador FK->Entrenador, tipo_meta VARCHAR(50), descripcion VARCHAR(255), fecha_limite DATE, estado VARCHAR(20)
18. Medicion_Biometrica: id_medicion PK, id_socio FK->Socio, fecha_medicion DATE, peso DECIMAL(5,2), talla DECIMAL(4,2), porcentaje_grasa DECIMAL(5,2)
19. Reporte: id_reporte PK, id_usuario FK->Usuario, tipo_reporte VARCHAR(50), fecha_generacion DATETIME, parametros VARCHAR(255), archivo_url VARCHAR(255)
