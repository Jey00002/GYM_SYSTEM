package pe.gym.backend.modulo_entrenamiento.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import pe.gym.backend.modulo_seguridad.entity.Usuario;

@Entity
@Table(name = "Entrenador")
@Data
@NoArgsConstructor
public class Entrenador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrenador")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "dni", length = 20)
    private String dni;

    @Column(name = "nombres", length = 100)
    private String nombres;

    @Column(name = "apellidos", length = 100)
    private String apellidos;

    @Column(name = "especialidad", length = 100)
    private String especialidad;
}
