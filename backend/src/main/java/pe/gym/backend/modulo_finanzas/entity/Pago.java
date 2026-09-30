package pe.gym.backend.modulo_finanzas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "Pago")
@Data
@NoArgsConstructor
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_membresia", nullable = false)
    private Membresia membresia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Column(name = "monto", precision = 10, scale = 2, nullable = false)
    private BigDecimal monto;

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

}
