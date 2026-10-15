package pe.gym.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_acceso.entity.MetodoAcceso;
import pe.gym.backend.modulo_acceso.repository.MetodoAccesoRepository;
import pe.gym.backend.modulo_entrenamiento.entity.Ejercicio;
import pe.gym.backend.modulo_entrenamiento.entity.Entrenador;
import pe.gym.backend.modulo_entrenamiento.entity.Rutina;
import pe.gym.backend.modulo_entrenamiento.entity.RutinaEjercicio;
import pe.gym.backend.modulo_entrenamiento.repository.EjercicioRepository;
import pe.gym.backend.modulo_entrenamiento.repository.EntrenadorRepository;
import pe.gym.backend.modulo_entrenamiento.repository.RutinaEjercicioRepository;
import pe.gym.backend.modulo_entrenamiento.repository.RutinaRepository;
import pe.gym.backend.modulo_finanzas.entity.*;
import pe.gym.backend.modulo_finanzas.repository.*;
import pe.gym.backend.modulo_seguridad.entity.Rol;
import pe.gym.backend.modulo_seguridad.entity.Usuario;
import pe.gym.backend.modulo_seguridad.repository.RolRepository;
import pe.gym.backend.modulo_seguridad.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final SocioRepository socioRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final PlanMembresiaRepository planRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final MembresiaRepository membresiaRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final MetodoAccesoRepository metodoAccesoRepository;
    private final EjercicioRepository ejercicioRepository;
    private final PagoRepository pagoRepository;
    private final PasswordEncoder passwordEncoder;
    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;

    public DataInitializer(RolRepository rolRepository, UsuarioRepository usuarioRepository,
                           SocioRepository socioRepository, EntrenadorRepository entrenadorRepository,
                           PlanMembresiaRepository planRepository, DisciplinaRepository disciplinaRepository, MembresiaRepository membresiaRepository,
                           MetodoPagoRepository metodoPagoRepository, MetodoAccesoRepository metodoAccesoRepository,
                           EjercicioRepository ejercicioRepository, PagoRepository pagoRepository,
                           PasswordEncoder passwordEncoder,
                           RutinaRepository rutinaRepository,
                           RutinaEjercicioRepository rutinaEjercicioRepository) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.socioRepository = socioRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.planRepository = planRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.membresiaRepository = membresiaRepository;
        this.metodoPagoRepository = metodoPagoRepository;
        this.metodoAccesoRepository = metodoAccesoRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.pagoRepository = pagoRepository;
        this.passwordEncoder = passwordEncoder;
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        sembrarRoles();
        sembrarDisciplinas();
        sembrarPlanes();
        sembrarMetodosPago();
        sembrarMetodosAcceso();
        sembrarEjercicios();
        sembrarUsuariosYPerfiles();
        sembrarPagos();
        sembrarYLimpiarRutinasSemanal();
    }

    private void sembrarRoles() {
        if (rolRepository.count() == 0) {
            for (String nombre : List.of("GERENTE", "ADMIN", "RECEPCIONISTA", "ENTRENADOR", "SOCIO")) {
                Rol rol = new Rol();
                rol.setNombreRol(nombre);
                rolRepository.save(rol);
            }
        }
    }

    private void sembrarDisciplinas() {
        asegurarDisciplina("Maquinas", "sala de musculación y cardio", "#f97316");
        asegurarDisciplina("Danza", "zumba, salsa, ritmos urbanos", "#ec4899");
        asegurarDisciplina("Clases con Mentor", "entrenamiento personal / small group", "#22c55e");
        asegurarDisciplina("Full Access", "todo incluido, plan premium", "#eab308");
    }

    private void asegurarDisciplina(String nombre, String descripcion, String color) {
        boolean existe = disciplinaRepository.findAll().stream()
                .anyMatch(d -> d.getNombre().equalsIgnoreCase(nombre));
        if (!existe) {
            crearDisciplina(nombre, descripcion, color);
        }
    }

    private void crearDisciplina(String nombre, String descripcion, String color) {
        Disciplina d = new Disciplina();
        d.setNombre(nombre);
        d.setDescripcion(descripcion);
        d.setColor(color);
        disciplinaRepository.save(d);
    }

    private void sembrarPlanes() {
        Disciplina maquinas = disciplinaRepository.findAll().stream().filter(d -> d.getNombre().equals("Maquinas")).findFirst().orElse(null);
        Disciplina full = disciplinaRepository.findAll().stream().filter(d -> d.getNombre().equals("Full Access")).findFirst().orElse(null);

        List<PlanMembresia> existentes = planRepository.findAll();
        if (existentes.isEmpty()) {
            List<String[]> planesDeseados = List.of(
                    new String[]{"Plan Básico Mensual", "30", "80.00", "basico", "Esencial", "#2563eb", "Acceso flexible mensual a sala de pesas y cardio", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\"]"},
                    new String[]{"Plan Dorado Mensual", "30", "120.00", "dorado", "Recomendado", "#eab308", "Plan completo con asesoramiento y rutinas", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\"]"},
                    new String[]{"Plan Diamante Mensual", "30", "180.00", "diamante", "VIP Todo Incluido", "#a855f7", "Acceso ilimitado total con entrenador personal", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\",\"Acceso a talleres de bailes\",\"Entrenador que te acompaña en toda la sesión de entrenamiento\"]"},
                    new String[]{"Plan Básico Trimestral", "90", "210.00", "basico", "Esencial", "#2563eb", "Ahorro trimestral para tu constancia", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\"]"},
                    new String[]{"Plan Dorado Trimestral", "90", "320.00", "dorado", "Recomendado", "#eab308", "3 meses de progreso guiado con evaluación", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\"]"},
                    new String[]{"Plan Diamante Trimestral", "90", "480.00", "diamante", "VIP Todo Incluido", "#a855f7", "Entrenamiento VIP trimestral con todo incluido", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\",\"Acceso a talleres de bailes\",\"Entrenador que te acompaña en toda la sesión de entrenamiento\"]"},
                    new String[]{"Plan Básico Anual", "360", "720.00", "basico", "Esencial", "#2563eb", "360 días de acceso total al mejor costo diario", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\"]"},
                    new String[]{"Plan Dorado Anual", "360", "1100.00", "dorado", "Recomendado", "#eab308", "Máxima economía con rutinas y evaluaciones todo el año", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\"]"},
                    new String[]{"Plan Diamante Anual", "360", "1650.00", "diamante", "VIP Todo Incluido", "#a855f7", "Experiencia élite todo el año con entrenador personal y talleres", "[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\",\"Acceso a talleres de bailes\",\"Entrenador que te acompaña en toda la sesión de entrenamiento\"]"}
            );

            for (String[] datos : planesDeseados) {
                PlanMembresia plan = new PlanMembresia();
                plan.setNombrePlan(datos[0]);
                plan.setDuracionDias(Integer.parseInt(datos[1]));
                plan.setTarifa(new BigDecimal(datos[2]));
                plan.setDisciplina(datos[3].equals("diamante") ? full : maquinas);
                plan.setBadge(datos[4]);
                plan.setColor(datos[5]);
                plan.setDescripcion(datos[6]);
                plan.setBeneficios(datos[7]);
                plan.setEstado(true);
                planRepository.save(plan);
            }
        } else {
            // Enriquecer planes existentes en la BD si aún no tienen beneficios o metadata configurada
            for (PlanMembresia plan : existentes) {
                boolean actualizado = false;
                String nombre = plan.getNombrePlan() != null ? plan.getNombrePlan().toLowerCase() : "";
                if (plan.getBeneficios() == null || plan.getBeneficios().isBlank()) {
                    if (nombre.contains("diamante")) {
                        plan.setBeneficios("[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\",\"Acceso a talleres de bailes\",\"Entrenador que te acompaña en toda la sesión de entrenamiento\"]");
                        if (plan.getBadge() == null) plan.setBadge("VIP Todo Incluido");
                        if (plan.getColor() == null) plan.setColor("#a855f7");
                        if (plan.getDescripcion() == null) plan.setDescripcion("Acceso ilimitado total con entrenador personal");
                    } else if (nombre.contains("dorado")) {
                        plan.setBeneficios("[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\",\"Evaluación física inicial y mensual\",\"Rutina digital o física personalizada\"]");
                        if (plan.getBadge() == null) plan.setBadge("Recomendado");
                        if (plan.getColor() == null) plan.setColor("#eab308");
                        if (plan.getDescripcion() == null) plan.setDescripcion("Plan completo con asesoramiento y rutinas");
                    } else {
                        plan.setBeneficios("[\"Acceso ilimitado a máquinas\",\"Acceso a vestidores y duchas\"]");
                        if (plan.getBadge() == null) plan.setBadge("Esencial");
                        if (plan.getColor() == null) plan.setColor("#2563eb");
                        if (plan.getDescripcion() == null) plan.setDescripcion("Acceso flexible a máquinas y vestidores");
                    }
                    actualizado = true;
                }
                if (actualizado) {
                    planRepository.save(plan);
                }
            }
        }
    }

    private void sembrarMetodosPago() {
        if (metodoPagoRepository.count() == 0) {
            for (String m : List.of("EFECTIVO", "TARJETA", "TRANSFERENCIA")) {
                MetodoPago mp = new MetodoPago();
                mp.setNombreMetodo(m);
                metodoPagoRepository.save(mp);
            }
        }
    }

    private void sembrarMetodosAcceso() {
        if (metodoAccesoRepository.count() == 0) {
            for (String m : List.of("QR", "DNI", "BIOMETRICO")) {
                MetodoAcceso ma = new MetodoAcceso();
                ma.setNombreMetodo(m);
                metodoAccesoRepository.save(ma);
            }
        }
    }

    private void sembrarEjercicios() {
        String[][] datos = {
            {"Sentadilla", "Flexión profunda de rodillas con barra para cuádriceps y glúteos", "Piernas"},
            {"Press de Banca", "Empuje horizontal con barra para pectoral mayor y tríceps", "Pecho"},
            {"Peso Muerto", "Levantamiento desde el suelo enfocado en cadena posterior y espalda baja", "Espalda"},
            {"Dominadas", "Tracción en barra fija para dorsal ancho y bíceps", "Espalda"},
            {"Press Militar", "Empuje vertical con barra o mancuernas para deltoides", "Hombros"},
            {"Curl de Bíceps", "Flexión de codos con barra o mancuernas para bíceps braquial", "Brazos"},
            {"Extensión de Tríceps", "Extensión de codo en polea alta con cuerda", "Brazos"},
            {"Elevaciones Laterales", "Abducción de hombros con mancuernas para deltoides lateral", "Hombros"},
            {"Prensa de Piernas", "Empuje de carga inclinada en máquina para cuádriceps y glúteos", "Piernas"},
            {"Remo con Barra", "Tracción inclinada hacia el abdomen para espalda media y dorsales", "Espalda"},
            {"Aperturas con Mancuernas", "Apertura en banco plano para estiramiento y trabajo de pecho", "Pecho"},
            {"Plancha Abdominal", "Isometría en posición prona para estabilidad del core y abdomen", "Abdomen"}
        };
        for (String[] d : datos) {
            boolean existe = ejercicioRepository.findAll().stream()
                    .anyMatch(e -> e.getNombreEjercicio().equalsIgnoreCase(d[0]));
            if (!existe) {
                Ejercicio e = new Ejercicio();
                e.setNombreEjercicio(d[0]);
                e.setDescripcion(d[1]);
                e.setGrupoMuscular(d[2]);
                ejercicioRepository.save(e);
            }
        }
    }

    private void sembrarUsuariosYPerfiles() {
        String pass = passwordEncoder.encode("123456");

        // Asegurar que cada usuario clave exista
        Usuario uSocio = asegurarUsuario("SOCIO", "socio@gym.com", pass);
        Usuario uEnt = asegurarUsuario("ENTRENADOR", "entrenador@gym.com", pass);
        asegurarUsuario("GERENTE", "gerente@gym.com", pass);
        asegurarUsuario("RECEPCIONISTA", "recepcion@gym.com", pass);
        asegurarUsuario("ADMIN", "admin@gym.com", pass);

        if (socioRepository.findByUsuarioId(uSocio.getId()).isEmpty()) {
            Socio s = new Socio();
            s.setUsuario(uSocio);
            s.setDni("72345678");
            s.setNombres("Carlos");
            s.setApellidos("Rodriguez");
            s.setTelefono("987654321");
            s.setFechaNacimiento(LocalDate.of(1998, 5, 14));
            socioRepository.save(s);
        }

        if (entrenadorRepository.findByUsuarioId(uEnt.getId()).isEmpty()) {
            Entrenador e = new Entrenador();
            e.setUsuario(uEnt);
            e.setDni("71234567");
            e.setNombres("Miguel");
            e.setApellidos("Torres");
            e.setEspecialidad("Hipertrofia y fuerza");
            entrenadorRepository.save(e);
        }

        if (membresiaRepository.count() == 0) {
            socioRepository.findAll().stream().findFirst().ifPresent(soc -> {
                planRepository.findByEstado(true).stream()
                        .filter(plan -> plan.getNombrePlan().equalsIgnoreCase("Plan Básico Mensual"))
                        .findFirst().ifPresent(plan -> {
                    Membresia m = new Membresia();
                    m.setSocio(soc);
                    m.setPlanMembresia(plan);
                    m.setFechaInicio(LocalDate.now());
                    m.setFechaVencimiento(LocalDate.now().plusDays(plan.getDuracionDias()));
                    m.setEstado("ACTIVA");
                    membresiaRepository.save(m);
                });
            });
        }
    }

    private Usuario asegurarUsuario(String rolNombre, String correo, String pass) {
        return usuarioRepository.findByCorreo(correo).orElseGet(() -> crearUsuario(rolNombre, correo, pass));
    }

    private void sembrarPagos() {
        if (pagoRepository.count() > 0) return;
        List<Membresia> membresias = membresiaRepository.findAll();
        List<MetodoPago> metodos = metodoPagoRepository.findAll();
        if (membresias.isEmpty() || metodos.isEmpty()) return;

        Membresia m = membresias.get(0);
        MetodoPago mp = metodos.get(0);
        
        // Gracias a @Transactional, el proxy de PlanMembresia puede inicializarse aquí
        BigDecimal tarifa = m.getPlanMembresia().getTarifa();
        
        for (int i = 5; i >= 0; i--) {
            Pago p = new Pago();
            p.setMembresia(m);
            p.setMetodoPago(mp);
            p.setFechaPago(LocalDate.now().minusMonths(i).withDayOfMonth(1));
            p.setMonto(tarifa);
            pagoRepository.save(p);
        }
    }

    private Usuario crearUsuario(String rolNombre, String correo, String pass) {
        Rol rol = rolRepository.findByNombreRol(rolNombre).orElseThrow();
        Usuario u = new Usuario();
        u.setRol(rol);
        u.setCorreo(correo);
        u.setContrasena(pass);
        u.setEstado(true);
        return usuarioRepository.save(u);
    }

    private void sembrarYLimpiarRutinasSemanal() {
        // 1. Limpiar y normalizar los días de semana en registros de rutina existentes
        List<RutinaEjercicio> todos = rutinaEjercicioRepository.findAll();
        for (RutinaEjercicio re : todos) {
            String normalizado = pe.gym.backend.modulo_entrenamiento.service.EntrenamientoService.normalizarDiaSemana(re.getDiaSemana());
            if (!normalizado.equals(re.getDiaSemana())) {
                re.setDiaSemana(normalizado);
                rutinaEjercicioRepository.save(re);
            }
        }

        // 2. Si no hay rutinas activas creadas, sembramos una integral de Lunes a Sábado
        if (rutinaRepository.count() == 0) {
            Socio socio = socioRepository.findAll().stream().findFirst().orElse(null);
            Entrenador entrenador = entrenadorRepository.findAll().stream().findFirst().orElse(null);
            List<Ejercicio> ejs = ejercicioRepository.findAll();

            if (socio != null && entrenador != null && !ejs.isEmpty()) {
                Rutina r = new Rutina();
                r.setSocio(socio);
                r.setEntrenador(entrenador);
                r.setNombreRutina("Rutina Semanal de Fuerza y Resistencia (Lunes a Sábado)");
                r.setFechaAsignacion(LocalDate.now());
                r.setEstado("ACTIVA");
                rutinaRepository.save(r);

                String[] dias = {"Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"};
                for (int i = 0; i < Math.min(ejs.size(), 12); i++) {
                    Ejercicio ej = ejs.get(i);
                    RutinaEjercicio re = new RutinaEjercicio();
                    re.setRutina(r);
                    re.setEjercicio(ej);
                    re.setSeries(4);
                    re.setRepeticiones(12);
                    re.setCompletado(false);
                    re.setDiaSemana(dias[i % dias.length]);
                    rutinaEjercicioRepository.save(re);
                }
            }
        }
    }
}
