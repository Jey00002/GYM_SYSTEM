package pe.gym.backend.modulo_seguridad.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Usuario")
@Data
@NoArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @Column(name = "correo", length = 100, nullable = false, unique = true)
    private String correo;

    @Column(name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    @Column(name = "estado", nullable = false)
    private Boolean estado;
}
