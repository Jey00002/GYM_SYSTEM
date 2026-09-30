package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "disciplina")
@Data
@NoArgsConstructor
public class Disciplina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disciplina")
    private Long id;

    @Column(name = "nombre", length = 60, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "color", length = 20)
    private String color;
}
