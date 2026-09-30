package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Metodo_Pago")
@Data
@NoArgsConstructor
public class MetodoPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metodo_pago")
    private Long id;

    @Column(name = "nombre_metodo", length = 50)
    private String nombreMetodo;
}
