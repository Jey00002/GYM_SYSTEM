package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import pe.gym.backend.modulo_seguridad.entity.Usuario;

@Entity
@Table(name = "Socio")
@Data
@NoArgsConstructor
public class Socio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_socio")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "dni", length = 20, unique = true)
    private String dni;

    @Column(name = "nombres", length = 100)
    private String nombres;

    @Column(name = "apellidos", length = 100)
    private String apellidos;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
}
