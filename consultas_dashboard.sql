-- ====================================================================
-- SISTEMA DE GESTIÓN DE GIMNASIO (GYM_SYSTEM)
-- CONSULTAS SQL COMPLETAS: VENTAS, REPORTES Y KPIS DE DASHBOARD
-- Base de Datos: gym_system
-- ====================================================================

USE `gym_system`;

-- ====================================================================
-- 1. CONSULTA RESUMEN PARA EL INDEX / DASHBOARD (KPIS EN 1 SOLA FILA)
-- ====================================================================
SELECT 
    -- Ventas e Ingresos por mes
    (SELECT COALESCE(SUM(monto), 0) FROM pago WHERE fecha_pago BETWEEN '2026-08-01' AND '2026-08-31') AS ventas_agosto_2026,
    (SELECT COALESCE(SUM(monto), 0) FROM pago WHERE fecha_pago BETWEEN '2026-09-01' AND '2026-09-30') AS ventas_setiembre_2026,
    (SELECT COALESCE(SUM(monto), 0) FROM pago WHERE fecha_pago BETWEEN '2026-10-01' AND '2026-10-31') AS ventas_octubre_2026,
    (SELECT COALESCE(SUM(monto), 0) FROM pago WHERE fecha_pago BETWEEN '2026-11-01' AND '2026-11-30') AS ventas_noviembre_2026,
    
    -- Cantidad de ventas por mes
    (SELECT COUNT(*) FROM pago WHERE fecha_pago BETWEEN '2026-08-01' AND '2026-08-31') AS transacciones_agosto,
    (SELECT COUNT(*) FROM pago WHERE fecha_pago BETWEEN '2026-09-01' AND '2026-09-30') AS transacciones_setiembre,
    (SELECT COUNT(*) FROM pago WHERE fecha_pago BETWEEN '2026-10-01' AND '2026-10-31') AS transacciones_octubre,
    (SELECT COUNT(*) FROM pago WHERE fecha_pago BETWEEN '2026-11-01' AND '2026-11-30') AS transacciones_noviembre,

    -- Estado de socios
    (SELECT COUNT(DISTINCT id_socio) FROM membresia WHERE estado = 'ACTIVA' AND fecha_vencimiento >= CURDATE()) AS socios_activos,
    (SELECT COUNT(*) FROM (
        SELECT id_socio FROM membresia GROUP BY id_socio 
        HAVING MIN(fecha_inicio) BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND LAST_DAY(CURDATE())
    ) AS nuevos) AS socios_nuevos_mes,
    (SELECT COUNT(DISTINCT id_socio) FROM membresia WHERE estado IN ('INACTIVO', 'MOROSO') OR (fecha_vencimiento < CURDATE() AND estado != 'CANCELADA')) AS socios_inactivos;


-- ====================================================================
-- 2. VENTAS COMPARATIVAS (TABLA CONSOLIDADA POR MES)
-- ====================================================================
SELECT 
    DATE_FORMAT(p.fecha_pago, '%Y-%m') AS periodo,
    CASE MONTH(p.fecha_pago)
        WHEN 8 THEN 'Agosto'
        WHEN 9 THEN 'Setiembre'
        WHEN 10 THEN 'Octubre'
        WHEN 11 THEN 'Noviembre'
        ELSE MONTHNAME(p.fecha_pago)
    END AS mes,
    COUNT(p.id_pago) AS cantidad_ventas,
    COUNT(DISTINCT m.id_socio) AS clientes_atendidos,
    SUM(p.monto) AS total_ventas,
    AVG(p.monto) AS ticket_promedio
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
WHERE p.fecha_pago BETWEEN '2026-08-01' AND '2026-11-30'
GROUP BY periodo, mes
ORDER BY periodo ASC;


-- ====================================================================
-- 3. VENTAS DE LOS MESES SEPARADOS (CADA MES INDIVIDUAL)
-- ====================================================================

-----------------------------------------------------------------------
-- 3.1. VENTAS AGOSTO 2026
-----------------------------------------------------------------------
-- A) Total de ventas de Agosto:
SELECT 
    'Agosto 2026' AS mes,
    COUNT(p.id_pago) AS total_ventas_realizadas,
    COUNT(DISTINCT m.id_socio) AS total_clientes,
    COALESCE(SUM(p.monto), 0) AS total_ingresos_ventas,
    COALESCE(AVG(p.monto), 0) AS ticket_promedio
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
WHERE p.fecha_pago BETWEEN '2026-08-01' AND '2026-08-31';

-- B) Ventas de Agosto por Disciplina y Plan:
SELECT 
    d.nombre AS disciplina,
    pm.nombre_plan,
    pm.tarifa,
    COUNT(p.id_pago) AS cantidad_vendida,
    SUM(p.monto) AS subtotal_ventas
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
WHERE p.fecha_pago BETWEEN '2026-08-01' AND '2026-08-31'
GROUP BY d.nombre, pm.nombre_plan, pm.tarifa
ORDER BY subtotal_ventas DESC;

-- C) Listado detallado de cada venta de Agosto:
SELECT 
    p.id_pago,
    c.numero_serie AS comprobante,
    p.fecha_pago,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    d.nombre AS disciplina,
    pm.nombre_plan,
    mp.nombre_metodo,
    p.monto
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN socio s ON s.id_socio = m.id_socio
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
JOIN metodo_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
LEFT JOIN comprobante c ON c.id_pago = p.id_pago
WHERE p.fecha_pago BETWEEN '2026-08-01' AND '2026-08-31'
ORDER BY p.fecha_pago DESC, p.id_pago DESC;


-----------------------------------------------------------------------
-- 3.2. VENTAS SETIEMBRE 2026
-----------------------------------------------------------------------
-- A) Total de ventas de Setiembre:
SELECT 
    'Setiembre 2026' AS mes,
    COUNT(p.id_pago) AS total_ventas_realizadas,
    COUNT(DISTINCT m.id_socio) AS total_clientes,
    COALESCE(SUM(p.monto), 0) AS total_ingresos_ventas,
    COALESCE(AVG(p.monto), 0) AS ticket_promedio
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
WHERE p.fecha_pago BETWEEN '2026-09-01' AND '2026-09-30';

-- B) Ventas de Setiembre por Disciplina y Plan:
SELECT 
    d.nombre AS disciplina,
    pm.nombre_plan,
    pm.tarifa,
    COUNT(p.id_pago) AS cantidad_vendida,
    SUM(p.monto) AS subtotal_ventas
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
WHERE p.fecha_pago BETWEEN '2026-09-01' AND '2026-09-30'
GROUP BY d.nombre, pm.nombre_plan, pm.tarifa
ORDER BY subtotal_ventas DESC;

-- C) Listado detallado de cada venta de Setiembre:
SELECT 
    p.id_pago,
    c.numero_serie AS comprobante,
    p.fecha_pago,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    d.nombre AS disciplina,
    pm.nombre_plan,
    mp.nombre_metodo,
    p.monto
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN socio s ON s.id_socio = m.id_socio
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
JOIN metodo_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
LEFT JOIN comprobante c ON c.id_pago = p.id_pago
WHERE p.fecha_pago BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY p.fecha_pago DESC, p.id_pago DESC;


-----------------------------------------------------------------------
-- 3.3. VENTAS OCTUBRE 2026
-----------------------------------------------------------------------
-- A) Total de ventas de Octubre:
SELECT 
    'Octubre 2026' AS mes,
    COUNT(p.id_pago) AS total_ventas_realizadas,
    COUNT(DISTINCT m.id_socio) AS total_clientes,
    COALESCE(SUM(p.monto), 0) AS total_ingresos_ventas,
    COALESCE(AVG(p.monto), 0) AS ticket_promedio
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
WHERE p.fecha_pago BETWEEN '2026-10-01' AND '2026-10-31';

-- B) Ventas de Octubre por Disciplina y Plan:
SELECT 
    d.nombre AS disciplina,
    pm.nombre_plan,
    pm.tarifa,
    COUNT(p.id_pago) AS cantidad_vendida,
    SUM(p.monto) AS subtotal_ventas
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
WHERE p.fecha_pago BETWEEN '2026-10-01' AND '2026-10-31'
GROUP BY d.nombre, pm.nombre_plan, pm.tarifa
ORDER BY subtotal_ventas DESC;

-- C) Listado detallado de cada venta de Octubre:
SELECT 
    p.id_pago,
    c.numero_serie AS comprobante,
    p.fecha_pago,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    d.nombre AS disciplina,
    pm.nombre_plan,
    mp.nombre_metodo,
    p.monto
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN socio s ON s.id_socio = m.id_socio
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
JOIN metodo_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
LEFT JOIN comprobante c ON c.id_pago = p.id_pago
WHERE p.fecha_pago BETWEEN '2026-10-01' AND '2026-10-31'
ORDER BY p.fecha_pago DESC, p.id_pago DESC;


-----------------------------------------------------------------------
-- 3.4. VENTAS NOVIEMBRE 2026
-----------------------------------------------------------------------
-- A) Total de ventas de Noviembre:
SELECT 
    'Noviembre 2026' AS mes,
    COUNT(p.id_pago) AS total_ventas_realizadas,
    COUNT(DISTINCT m.id_socio) AS total_clientes,
    COALESCE(SUM(p.monto), 0) AS total_ingresos_ventas,
    COALESCE(AVG(p.monto), 0) AS ticket_promedio
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
WHERE p.fecha_pago BETWEEN '2026-11-01' AND '2026-11-30';

-- B) Ventas de Noviembre por Disciplina y Plan:
SELECT 
    d.nombre AS disciplina,
    pm.nombre_plan,
    pm.tarifa,
    COUNT(p.id_pago) AS cantidad_vendida,
    SUM(p.monto) AS subtotal_ventas
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
WHERE p.fecha_pago BETWEEN '2026-11-01' AND '2026-11-30'
GROUP BY d.nombre, pm.nombre_plan, pm.tarifa
ORDER BY subtotal_ventas DESC;

-- C) Listado detallado de cada venta de Noviembre:
SELECT 
    p.id_pago,
    c.numero_serie AS comprobante,
    p.fecha_pago,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    d.nombre AS disciplina,
    pm.nombre_plan,
    mp.nombre_metodo,
    p.monto
FROM pago p
JOIN membresia m ON m.id_membresia = p.id_membresia
JOIN socio s ON s.id_socio = m.id_socio
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
JOIN disciplina d ON d.id_disciplina = pm.id_disciplina
JOIN metodo_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
LEFT JOIN comprobante c ON c.id_pago = p.id_pago
WHERE p.fecha_pago BETWEEN '2026-11-01' AND '2026-11-30'
ORDER BY p.fecha_pago DESC, p.id_pago DESC;


-- ====================================================================
-- 4. ESTADOS DE SOCIOS / USUARIOS (INDEX / GESTIÓN)
-- ====================================================================

-- 4.1. SOCIOS ACTIVOS (Con membresía activa vigente)
SELECT 
    s.id_socio,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    s.telefono,
    u.correo,
    pm.nombre_plan,
    m.fecha_inicio,
    m.fecha_vencimiento,
    DATEDIFF(m.fecha_vencimiento, CURDATE()) AS dias_restantes,
    m.estado AS estado_membresia
FROM socio s
JOIN usuario u ON u.id_usuario = s.id_usuario
JOIN membresia m ON m.id_socio = s.id_socio
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
WHERE m.estado = 'ACTIVA' 
  AND m.fecha_vencimiento >= CURDATE()
ORDER BY m.fecha_vencimiento ASC;


-- 4.2. SOCIOS NUEVOS (Socios cuya primera membresía inició en los últimos 30 días o este mes)
SELECT 
    s.id_socio,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    s.telefono,
    u.correo,
    MIN(m.fecha_inicio) AS fecha_ingreso,
    DATEDIFF(CURDATE(), MIN(m.fecha_inicio)) AS dias_desde_ingreso
FROM socio s
JOIN usuario u ON u.id_usuario = s.id_usuario
JOIN membresia m ON m.id_socio = s.id_socio
GROUP BY s.id_socio, s.nombres, s.apellidos, s.dni, s.telefono, u.correo
HAVING MIN(m.fecha_inicio) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY fecha_ingreso DESC;


-- 4.3. SOCIOS MOROSOS (Con membresías vencidas o marcadas como MOROSO)
SELECT 
    s.id_socio,
    CONCAT(s.nombres, ' ', COALESCE(s.apellidos, '')) AS socio,
    s.dni,
    s.telefono,
    u.correo,
    pm.nombre_plan,
    m.fecha_vencimiento,
    DATEDIFF(CURDATE(), m.fecha_vencimiento) AS dias_mora,
    m.estado AS estado_membresia
FROM socio s
JOIN usuario u ON u.id_usuario = s.id_usuario
JOIN membresia m ON m.id_socio = s.id_socio
JOIN plan_membresia pm ON pm.id_plan = m.id_plan
WHERE m.estado = 'MOROSO' 
   OR (m.fecha_vencimiento < CURDATE() AND m.estado != 'CANCELADA')
ORDER BY dias_mora DESC;
