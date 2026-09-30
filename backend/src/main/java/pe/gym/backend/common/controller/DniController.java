package pe.gym.backend.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/dni")
public class DniController {

    private final RestTemplate restTemplate = new RestTemplate();
    // Tu token real de APIsPERU
    private static final String TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImJsb3BlemphY29iQGdtYWlsLmNvbSJ9.Gw7Yyxo26wDbIHjxs4E2aBD-u3f0RUpla0gE7mgloL0";

    @GetMapping("/{dni}")
    public ResponseEntity<Map> buscarDni(@PathVariable String dni) {
        try {
            String url = "https://dniruc.apisperu.com/api/v1/dni/" + dni + "?token=" + TOKEN;
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("success") && Boolean.TRUE.equals(response.get("success"))) {
                return ResponseEntity.ok(response);
            }
            throw new RuntimeException("DNI no encontrado");
        } catch (Exception e) {
            throw new RuntimeException("Error al consultar el DNI: " + e.getMessage());
        }
    }
}
