package pe.gym.backend.modulo_seguridad.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCorreoVerificacion(String destino, String codigo) {
        System.out.println("==================================================");
        System.out.println("CÓDIGO DE VERIFICACIÓN PARA " + destino + ": " + codigo);
        System.out.println("==================================================");
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destino);
            message.setSubject("Tu código de verificación - GymStar");
            message.setText("Hola,\n\nTu código de verificación es: " + codigo + "\n\nEste código expira en 10 minutos.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("No se pudo enviar el correo real (falta configurar la contraseña real en application.properties). ¡Pero el código funciona!");
        }
    }
}
