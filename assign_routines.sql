INSERT INTO rutina (fecha_asignacion, nombre_rutina, id_entrenador, id_socio)
SELECT CURDATE(), 'Rutina de Fuerza Corporativa', 1, id_socio FROM socio;

-- Insert exercises into these routines
INSERT INTO rutina_ejercicio (repeticiones, series, id_ejercicio, id_rutina)
SELECT 12, 4, 1, id_rutina FROM rutina; -- Press Banca
INSERT INTO rutina_ejercicio (repeticiones, series, id_ejercicio, id_rutina)
SELECT 10, 4, 2, id_rutina FROM rutina; -- Sentadilla
INSERT INTO rutina_ejercicio (repeticiones, series, id_ejercicio, id_rutina)
SELECT 8, 4, 3, id_rutina FROM rutina; -- Peso Muerto
INSERT INTO rutina_ejercicio (repeticiones, series, id_ejercicio, id_rutina)
SELECT 15, 3, 6, id_rutina FROM rutina; -- Hip Thrust
