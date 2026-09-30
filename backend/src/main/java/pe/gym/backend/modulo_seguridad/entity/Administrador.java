package pe.gym.backend.modulo_seguridad.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Administrador")
@Data
@NoArgsConstructor
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_administrador")
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

    @Column(name = "cargo", length = 50)
    private String cargo;
}
