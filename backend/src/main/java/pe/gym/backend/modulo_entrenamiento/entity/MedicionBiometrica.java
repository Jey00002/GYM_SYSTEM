package pe.gym.backend.modulo_entrenamiento.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;
import pe.gym.backend.modulo_finanzas.entity.Socio;

@Entity
@Table(name = "Medicion_Biometrica")
@Data
@NoArgsConstructor
public class MedicionBiometrica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medicion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_socio", nullable = false)
    private Socio socio;

    @Column(name = "fecha_medicion")
    private LocalDate fechaMedicion;

    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "talla", precision = 4, scale = 2)
    private BigDecimal talla;

    @Column(name = "porcentaje_grasa", precision = 5, scale = 2)
    private BigDecimal porcentajeGrasa;
}
