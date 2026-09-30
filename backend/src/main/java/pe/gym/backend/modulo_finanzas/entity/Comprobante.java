package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "Comprobante")
@Data
@NoArgsConstructor
public class Comprobante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comprobante")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pago", nullable = false)
    private Pago pago;

    @Column(name = "numero_serie", length = 50)
    private String numeroSerie;

    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;

    @Column(name = "archivo_url", length = 255)
    private String archivoUrl;
}
