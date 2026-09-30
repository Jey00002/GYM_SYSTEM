package pe.gym.backend.modulo_acceso.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import pe.gym.backend.modulo_finanzas.entity.Socio;

@Entity
@Table(name = "Acceso")
@Data
@NoArgsConstructor
public class Acceso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acceso")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_socio", nullable = false)
    private Socio socio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_metodo_acceso", nullable = false)
    private MetodoAcceso metodoAcceso;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora_ingreso")
    private LocalTime horaIngreso;

    @Column(name = "hora_salida")
    private LocalTime horaSalida;

    @Column(name = "resultado", length = 20)
    private String resultado;
}
