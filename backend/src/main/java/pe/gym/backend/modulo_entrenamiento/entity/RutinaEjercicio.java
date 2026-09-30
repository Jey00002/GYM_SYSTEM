package pe.gym.backend.modulo_entrenamiento.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Rutina_Ejercicio")
@Data
@NoArgsConstructor
public class RutinaEjercicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rutina_ejercicio")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rutina", nullable = false)
    private Rutina rutina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ejercicio", nullable = false)
    private Ejercicio ejercicio;

    @Column(name = "series")
    private Integer series;

    @Column(name = "repeticiones")
    private Integer repeticiones;

    @Column(name = "completado")
    private Boolean completado;
}
