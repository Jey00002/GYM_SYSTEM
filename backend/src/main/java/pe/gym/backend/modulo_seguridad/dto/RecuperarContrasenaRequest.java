package pe.gym.backend.modulo_seguridad.dto;

public class RecuperarContrasenaRequest {
    private String correo;
    private String codigo;
    private String nuevaContrasena;

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNuevaContrasena() { return nuevaContrasena; }
    public void setNuevaContrasena(String nuevaContrasena) { this.nuevaContrasena = nuevaContrasena; }
}
