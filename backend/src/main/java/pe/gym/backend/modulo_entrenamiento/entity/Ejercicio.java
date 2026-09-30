package pe.gym.backend.modulo_entrenamiento.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Ejercicio")
@Data
@NoArgsConstructor
public class Ejercicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ejercicio")
    private Long id;

    @Column(name = "nombre_ejercicio", length = 100)
    private String nombreEjercicio;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "grupo_muscular", length = 50)
    private String grupoMuscular;
}
