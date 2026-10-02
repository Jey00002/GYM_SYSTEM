package pe.gym.backend.modulo_acceso.entity;

import jakarta.persistence.*;
import lombok.Data;
import pe.gym.backend.modulo_finanzas.entity.Disciplina;

@Data
@Entity
@Table(name = "zona_acceso")
public class ZonaAcceso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_zona")
    private Long id;

    @Column(name = "nombre_zona", nullable = false, length = 50)
    private String nombreZona;

    @ManyToOne
    @JoinColumn(name = "id_disciplina")
    private Disciplina disciplina;
}
