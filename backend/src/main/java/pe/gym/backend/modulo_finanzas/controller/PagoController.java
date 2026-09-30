package pe.gym.backend.modulo_finanzas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gym.backend.modulo_finanzas.service.PagoService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    // Simula crear una orden en la pasarela (Culqi/Google Pay)
    @PostMapping("/crear-orden")
    public ResponseEntity<Map<String, String>> crearOrden(@RequestBody Map<String, Object> body) {
        Long idPlan = Long.valueOf(body.get("idPlan").toString());
        // En producción aquí se llama a la API de Culqi/Google Pay
        // Para el demo, generamos un token único que simula la respuesta de la pasarela
        String transactionId = "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return ResponseEntity.ok(Map.of(
            "transactionId", transactionId,
            "monto", body.getOrDefault("monto", "0").toString(),
            "estado", "PENDIENTE"
        ));
    }

    // Confirma el pago SOLO si el transactionId es válido y nuevo
    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarPago(@RequestBody Map<String, Object> body) {
        try {
            Long idSocio = Long.valueOf(body.get("idSocio").toString());
            Long idPlan = Long.valueOf(body.get("idPlan").toString());
            Long idMetodo = Long.valueOf(body.get("idMetodoPago").toString());
            String transactionId = body.get("transactionId").toString();
            
            pagoService.registrarPagoSeguro(idSocio, idPlan, idMetodo, transactionId);
            return ResponseEntity.ok(Map.of("mensaje", "Pago confirmado y membresía activada"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
