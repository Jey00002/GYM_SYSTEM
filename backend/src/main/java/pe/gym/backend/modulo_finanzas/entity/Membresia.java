package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "Membresia")
@Data
@NoArgsConstructor
public class Membresia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_membresia")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_socio", nullable = false)
    private Socio socio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan", nullable = false)
    private PlanMembresia planMembresia;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;
}
