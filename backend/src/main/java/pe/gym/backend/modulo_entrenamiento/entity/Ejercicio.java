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

    @Column(name = "nombre_ejercicio", length = 150)
    private String nombreEjercicio;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "grupo_muscular", length = 50)
    private String grupoMuscular;

    @Column(name = "musculo_objetivo", length = 80)
    private String musculoObjetivo;

    @Column(name = "equipamiento", length = 80)
    private String equipamiento;

    @Column(name = "url_gif", columnDefinition = "TEXT")
    private String urlGif;

    @Column(name = "url_imagen", columnDefinition = "TEXT")
    private String urlImagen;
}
