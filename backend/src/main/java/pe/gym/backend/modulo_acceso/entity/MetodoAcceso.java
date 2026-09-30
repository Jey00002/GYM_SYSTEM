package pe.gym.backend.modulo_acceso.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Metodo_Acceso")
@Data
@NoArgsConstructor
public class MetodoAcceso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metodo_acceso")
    private Long id;

    @Column(name = "nombre_metodo", length = 50)
    private String nombreMetodo;
}
