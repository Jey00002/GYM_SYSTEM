-- 1. Tabla disciplina
CREATE TABLE IF NOT EXISTS disciplina (
    id_disciplina BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    descripcion VARCHAR(255),
    color VARCHAR(20)
);

-- 2. FK en plan_membresia
-- Alteramos ignorando si ya existe en mysql
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'plan_membresia' AND table_schema = DATABASE() AND column_name = 'id_disciplina') > 0,
    'SELECT 1',
    'ALTER TABLE plan_membresia ADD COLUMN id_disciplina BIGINT;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name = 'plan_membresia' AND table_schema = DATABASE() AND constraint_name = 'fk_plan_disciplina') > 0,
    'SELECT 1',
    'ALTER TABLE plan_membresia ADD CONSTRAINT fk_plan_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina);'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Semillas de disciplinas (Idempotentes)
INSERT INTO disciplina (id_disciplina, nombre, descripcion, color) VALUES 
(1, 'Maquinas', 'sala de musculación y cardio', '#f97316'),
(2, 'Danza', 'zumba, salsa, ritmos urbanos', '#ec4899'),
(3, 'Clases con Mentor', 'entrenamiento personal / small group', '#22c55e'),
(4, 'Full Access', 'todo incluido, plan premium', '#eab308')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion), color=VALUES(color);

-- Asignar planes existentes a Maquinas
UPDATE plan_membresia SET id_disciplina = 1 WHERE id_disciplina IS NULL AND id_plan IN (1,2,3);
-- Asignar a nombre si sus ID no corresponden
UPDATE plan_membresia SET id_disciplina = 1 WHERE id_disciplina IS NULL;

-- 3. Vista v_ventas_por_disciplina
CREATE OR REPLACE VIEW v_ventas_por_disciplina AS
SELECT d.nombre, d.color, COUNT(p.id_pago) AS ventas, COALESCE(SUM(p.monto),0) AS ingreso_total
FROM disciplina d
LEFT JOIN plan_membresia pm ON pm.id_disciplina = d.id_disciplina
LEFT JOIN membresia m ON m.id_plan = pm.id_plan
LEFT JOIN pago p ON p.id_membresia = m.id_membresia
GROUP BY d.id_disciplina, d.nombre, d.color;
