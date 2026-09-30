package pe.gym.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.gym.backend.modulo_acceso.entity.MetodoAcceso;
import pe.gym.backend.modulo_acceso.repository.MetodoAccesoRepository;
import pe.gym.backend.modulo_entrenamiento.entity.Ejercicio;
import pe.gym.backend.modulo_entrenamiento.entity.Entrenador;
import pe.gym.backend.modulo_entrenamiento.repository.EjercicioRepository;
import pe.gym.backend.modulo_entrenamiento.repository.EntrenadorRepository;
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

    public DataInitializer(RolRepository rolRepository, UsuarioRepository usuarioRepository,
                           SocioRepository socioRepository, EntrenadorRepository entrenadorRepository,
                           PlanMembresiaRepository planRepository, DisciplinaRepository disciplinaRepository, MembresiaRepository membresiaRepository,
                           MetodoPagoRepository metodoPagoRepository, MetodoAccesoRepository metodoAccesoRepository,
                           EjercicioRepository ejercicioRepository, PagoRepository pagoRepository,
                           PasswordEncoder passwordEncoder) {
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
        if (disciplinaRepository.count() == 0) {
            crearDisciplina("Maquinas", "sala de musculación y cardio", "#f97316");
            crearDisciplina("Danza", "zumba, salsa, ritmos urbanos", "#ec4899");
            crearDisciplina("Clases con Mentor", "entrenamiento personal / small group", "#22c55e");
            crearDisciplina("Full Access", "todo incluido, plan premium", "#eab308");
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
        if (planRepository.count() == 0) {
            Disciplina maquinas = disciplinaRepository.findAll().stream().filter(d -> d.getNombre().equals("Maquinas")).findFirst().orElse(null);
            Disciplina danza = disciplinaRepository.findAll().stream().filter(d -> d.getNombre().equals("Danza")).findFirst().orElse(null);
            Disciplina mentor = disciplinaRepository.findAll().stream().filter(d -> d.getNombre().equals("Clases con Mentor")).findFirst().orElse(null);
            Disciplina full = disciplinaRepository.findAll().stream().filter(d -> d.getNombre().equals("Full Access")).findFirst().orElse(null);

            crearPlan("Mensual", 30, "80.00", maquinas);
            crearPlan("Trimestral", 90, "210.00", maquinas);
            crearPlan("Anual", 360, "720.00", maquinas);
            
            crearPlan("Pack Danza 8 clases", 30, "60.00", danza);
            crearPlan("Pack Danza 12 clases", 30, "80.00", danza);
            
            crearPlan("Mentor 4 sesiones", 30, "120.00", mentor);
            crearPlan("Mentor 8 sesiones", 60, "220.00", mentor);
            
            crearPlan("Full Access Mensual", 30, "120.00", full);
            crearPlan("Full Access Trimestral", 90, "320.00", full);
        }
    }

    private void crearPlan(String nombre, int dias, String tarifa, Disciplina disciplina) {
        PlanMembresia p = new PlanMembresia();
        p.setNombrePlan(nombre);
        p.setDuracionDias(dias);
        p.setTarifa(new BigDecimal(tarifa));
        p.setEstado(true);
        p.setDisciplina(disciplina);
        planRepository.save(p);
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
        if (ejercicioRepository.count() == 0) {
            String[][] datos = {
                {"Sentadilla", "Flexion de rodillas con carga", "Piernas"},
                {"Press de Banca", "Empuje horizontal de pecho", "Pecho"},
                {"Peso Muerto", "Levantamiento desde el suelo", "Espalda"},
                {"Dominadas", "Traccion en barra fija", "Espalda"},
                {"Press Militar", "Empuje vertical de hombros", "Hombros"}
            };
            for (String[] d : datos) {
                Ejercicio e = new Ejercicio();
                e.setNombreEjercicio(d[0]);
                e.setDescripcion(d[1]);
                e.setGrupoMuscular(d[2]);
                ejercicioRepository.save(e);
            }
        }
    }

    private void sembrarUsuariosYPerfiles() {
        if (usuarioRepository.count() > 0) return;

        String pass = passwordEncoder.encode("123456");

        Usuario uSocio = crearUsuario("SOCIO", "socio@gym.com", pass);
        Usuario uEnt = crearUsuario("ENTRENADOR", "entrenador@gym.com", pass);
        crearUsuario("GERENTE", "gerente@gym.com", pass);
        crearUsuario("RECEPCIONISTA", "recepcion@gym.com", pass);
        crearUsuario("ADMIN", "admin@gym.com", pass);

        Socio s = new Socio();
        s.setUsuario(uSocio);
        s.setDni("72345678");
        s.setNombres("Carlos");
        s.setApellidos("Rodriguez");
        s.setTelefono("987654321");
        s.setFechaNacimiento(LocalDate.of(1998, 5, 14));
        socioRepository.save(s);

        Entrenador e = new Entrenador();
        e.setUsuario(uEnt);
        e.setDni("71234567");
        e.setNombres("Miguel");
        e.setApellidos("Torres");
        e.setEspecialidad("Hipertrofia y fuerza");
        entrenadorRepository.save(e);

        if (membresiaRepository.count() == 0) {
            PlanMembresia plan = planRepository.findAll().get(0);
            Membresia m = new Membresia();
            m.setSocio(s);
            m.setPlanMembresia(plan);
            m.setFechaInicio(LocalDate.now());
            m.setFechaVencimiento(LocalDate.now().plusDays(plan.getDuracionDias()));
            m.setEstado("ACTIVA");
            membresiaRepository.save(m);
        }
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
}
