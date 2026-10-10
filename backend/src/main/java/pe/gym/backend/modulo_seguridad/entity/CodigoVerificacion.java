package pe.gym.backend.modulo_seguridad.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class CodigoVerificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String correo;
    private String codigo;
    private LocalDateTime fechaExpiracion;

    public CodigoVerificacion() {}

    public CodigoVerificacion(String correo, String codigo, LocalDateTime fechaExpiracion) {
        this.correo = correo;
        this.codigo = codigo;
        this.fechaExpiracion = fechaExpiracion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(LocalDateTime fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }
}
