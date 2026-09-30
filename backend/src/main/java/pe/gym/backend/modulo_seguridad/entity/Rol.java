package pe.gym.backend.modulo_seguridad.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Rol")
@Data
@NoArgsConstructor
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long id;

    @Column(name = "nombre_rol", length = 50, nullable = false, unique = true)
    private String nombreRol;
}
