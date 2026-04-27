<template>
  <div>
    <!-- Cabecera: Título izquierda, Reloj centro, Botón derecha -->
    <div class="container-fluid px-3 px-md-4 px-lg-5 py-3 bg-light border-bottom">
      <div class="row align-items-center">
        <!-- Izquierda: Título -->
        <div class="col-12 col-md-4 text-start text-md-start mb-3 mb-md-0">
          <h1 class="fs-2 fw-bold text-primary mb-0">
            <i class="bi bi-calendar3 me-2"></i> Horarios de Aulas
          </h1>
        </div>

        <!-- Centro: Reloj y fecha -->
        <div class="col-12 col-md-4 text-center">
          <div class="fs-3 fw-bold text-dark mb-1">{{ horaActual }}</div>
          <div class="fs-5 text-muted">{{ fechaActual }}</div>
        </div>

        <!-- Derecha: Botón -->
        <div class="col-12 col-md-4 d-flex justify-content-center justify-content-md-end gap-2 flex-wrap">
          
          <button 
            class="btn btn-primary px-4 py-2 shadow-sm"
            @click="showFullSchedule = true"
          >
            <i class="bi bi-table me-2"></i>
            <span class="d-none d-sm-inline">Ver Horario Completo y Administrar</span>
            <span class="d-inline d-sm-none">Horario Completo</span>
          </button>

          <router-link 
            :to="{ path: '/reporte-horarios', query: { dia: diaSeleccionado } }" 
            class="btn btn-secondary px-4 py-2 shadow-sm text-decoration-none"
          >
            <i class="bi bi-file-earmark-pdf-fill me-2"></i> Generar Reporte
          </router-link>

        </div>

      </div>
    </div>

    <!-- Tarjetas de laboratorios -->
    <div class="container-fluid px-3 px-md-4 px-lg-5 py-4">
      <div class="row g-3 g-md-4">
        <div v-for="lab in laboratorios" :key="lab.nombre" class="col-12 col-md-6 col-lg-6">
          <div class="card shadow-sm h-100 border-0" :style="{ borderLeft: `6px solid ${lab.color}` }">
            <div class="card-header bg-white d-flex align-items-center px-3 py-2">
              <i :class="lab.icon" class="me-3 text-primary" style="font-size: 2.2rem;"></i>
              <h5 class="mb-0 fw-bold">{{ lab.nombre }}</h5>
            </div>

            <div class="card-body py-3">
              <!-- Clase actual -->
              <div v-if="claseActual(lab.nombre)">
                <div class="row g-3 align-items-center text-center text-md-start">
                  <div class="col-12 col-md-4 d-flex flex-column align-items-center">
                    <img 
                      :src="fotoDocente(claseActual(lab.nombre).docente) || '/logos/default-docente.png'"
                      @error="$event.target.src = '/logos/default-docente.png'"
                      class="rounded-circle shadow mb-2"
                      style="width: 100px; height: 100px; object-fit: cover; border: 3px solid white;"
                      alt="Foto docente"
                    />
                    <div class="fw-bold text-dark fs-6 text-center">
                      {{ claseActual(lab.nombre).docente }}
                    </div>
                  </div>

                  <div class="col-12 col-md-4 text-center">
                    <h6 class="fw-bold text-primary mb-1">{{ claseActual(lab.nombre).materia }}</h6>
                    <p class="mb-1 text-dark small">Grupo: {{ claseActual(lab.nombre).grupo }}</p>
                    <span class="badge bg-primary px-3 py-1 small">
                      {{ claseActual(lab.nombre).horaInicio }} - {{ claseActual(lab.nombre).horaFin }}
                    </span>
                  </div>

                  <div class="col-12 col-md-4 d-flex justify-content-center">
                    <circular-progress 
                      :progress="progresoClase(lab.nombre)" 
                      :color="lab.color"
                      :size="120"
                      :logo-carrera="logoCarrera(claseActual(lab.nombre)?.grupo || '')"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-4">
                <img 
                  src="/logos/Logo_nuevo.png" 
                  alt="Logo" 
                  class="mx-auto d-block mb-2" 
                  style="width: 120px; height: auto;"
                />
                <p class="text-muted fw-bold small mb-0">Sin clase en este momento</p>
              </div>

              <!-- Próximas clases: scroll manual, hasta 10 -->
              <div class="mt-3 pt-3 border-top">
                <h6 class="text-muted text-center mb-2 small">Próximas clases hoy</h6>
                <div v-if="proximasClases(lab.nombre).length > 0" class="proximas-scroll">
                  <div class="d-flex gap-3">
                    <div 
                      v-for="c in proximasClases(lab.nombre)" 
                      :key="c.horaInicio" 
                      class="proxima-item flex-shrink-0 p-3 rounded bg-light text-center"
                    >
                      <img 
                        :src="fotoDocente(c.docente) || '/logos/default-docente.png'"
                        @error="$event.target.src = '/logos/default-docente.png'"
                        class="rounded-circle mb-2"
                        style="width: 40px; height: 40px; object-fit: cover;"
                        alt="Docente"
                      />
                      <div class="small">
                        <div class="fw-bold">{{ c.horaInicio }} - {{ c.horaFin }}</div>
                        <div class="text-muted">
                          {{ c.materia }}<br>
                          ({{ c.grupo }})<br>
                          <span class="text-secondary">{{ c.docente }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted small py-2">
                  No hay más clases hoy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL HORARIO COMPLETO (con iconos en cada lab) -->
    <div v-if="showFullSchedule" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog modal-xl modal-dialog-scrollable modal-fullscreen-md-down">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Horario Completo y Administración</h5>
            <button type="button" class="btn-close btn-close-white" @click="showFullSchedule = false"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Selector de día -->
            <div class="card mb-4 border-0 shadow-sm">
              <div class="card-body">
                <label class="form-label fw-bold">Seleccionar día</label>
                <select v-model="diaSeleccionado" class="form-select form-select-lg">
                  <option v-for="dia in dias" :value="dia">{{ dia }}</option>
                </select>
              </div>
            </div>

            <!-- Botón agregar clase -->
            <div class="mb-4 border-bottom pb-2">
              <h5 class="mb-0 fw-bold text-secondary">Clases Programadas</h5>
            </div>

            <!-- Formulario colapsable -->
<transition name="fade">
              <div v-if="showForm" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75); z-index: 1060;">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                  <div class="modal-content shadow-lg border-0">
                    <div class="modal-header bg-primary text-white">
                      <h5 class="modal-title fw-bold">
                        <i class="bi" :class="editMode ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
                        {{ editMode ? 'Editar Clase' : 'Agregar Nueva Clase' }}
                      </h5>
                      <button type="button" class="btn-close btn-close-white" @click="cerrarFormulario"></button>
                    </div>
                    <div class="modal-body p-4">
                      <form @submit.prevent="saveClase">
                        <div class="row g-3">
                          
                          <div class="col-12 col-md-4">
                            <label class="form-label fw-bold">Día</label>
                            <select v-model="form.dia" class="form-select" required>
                              <option v-for="dia in dias" :value="dia">{{ dia }}</option>
                            </select>
                          </div>
                          <div class="col-12 col-md-4">
                            <label class="form-label fw-bold">Laboratorio</label>
                            <select v-model="form.laboratorio" class="form-select" required>
                              <option v-for="lab in laboratorios" :value="lab.nombre">{{ lab.nombre }}</option>
                            </select>
                          </div>
                          <div class="col-12 col-md-4">
                            <label class="form-label fw-bold">Materia</label>
                            <input v-model="form.materia" class="form-control" required />
                          </div>
                          
                          <div class="col-12 col-md-3">
                            <label class="form-label fw-bold">Grupo</label>
                            <input v-model="form.grupo" class="form-control" required placeholder="Ej: 2A MP" />
                          </div>
                          <div class="col-12 col-md-3">
                            <label class="form-label fw-bold">Docente</label>
                            <select v-model="form.docente" class="form-select" required>
                              <option value="" disabled selected>Selecciona un docente...</option>
                              <option v-for="doc in listaMaestrosDirectorio" :key="doc" :value="doc">{{ doc }}</option>
                            </select>
                          </div>
                          <div class="col-6 col-md-3">
                            <label class="form-label fw-bold">Inicio</label>
                            <input v-model="form.horaInicio" type="time" class="form-control" required />
                          </div>
                          <div class="col-6 col-md-3">
                            <label class="form-label fw-bold">Fin</label>
                            <input v-model="form.horaFin" type="time" class="form-control" required />
                          </div>
                          
                          <div class="col-12 text-end mt-4 pt-3 border-top">
                            <button type="button" class="btn btn-secondary me-2 px-4" @click="cerrarFormulario">Cancelar</button>
                            <button type="submit" class="btn btn-success px-4 fw-bold">
                              <i class="bi" :class="editMode ? 'bi-check-circle' : 'bi-save'"></i>
                              {{ editMode ? 'Actualizar' : 'Guardar' }}
                            </button>
                          </div>
                          
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Tabla de clases por laboratorio (con iconos) -->
            <div class="mt-4">
              <div v-for="lab in laboratorios" :key="lab.nombre" class="mb-5 bg-white p-3 rounded shadow-sm border">
                <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div class="d-flex align-items-center">
                    <i :class="lab.icon" class="me-3 text-primary" style="font-size: 2rem;"></i>
                    <h5 class="mb-0 fw-bold" :style="{ color: lab.color }">{{ lab.nombre }}</h5>
                  </div>
                  
                  <button 
                    class="btn btn-success btn-sm rounded-circle shadow-sm d-flex justify-content-center align-items-center" 
                    @click="abrirFormularioNuevo(lab.nombre)" 
                    style="width: 35px; height: 35px;"
                    title="Agregar clase a este espacio"
                  >
                    <i class="bi bi-plus fs-5"></i>
                  </button>
                </div>

                <div class="table-responsive">
                  <table class="table table-striped table-hover align-middle table-sm">
                    <thead class="table-light">
                      <tr>
                        <th>Hora</th>
                        <th>Materia</th>
                        <th>Grupo</th>
                        <th>Docente</th>
                        <th class="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="clase in clasesDelDiaFiltro(lab.nombre)" :key="clase.id">
                        <td class="fw-bold small">{{ clase.horaInicio }} - {{ clase.horaFin }}</td>
                        <td class="small">
                          <div class="d-flex align-items-center gap-2">
                            <img :src="logoCarrera(clase.grupo)" style="width: 30px; height: 30px; object-fit: contain; background: white; padding: 3px; border-radius: 6px;" />
                            {{ clase.materia }}
                          </div>
                        </td>
                        <td class="small">{{ clase.grupo }}</td>
                        <td class="small">{{ clase.docente }}</td>
                        <td class="text-center">
                          <button class="btn btn-warning btn-sm me-1" @click="editClase(clase)">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-danger btn-sm" @click="deleteClase(clase.id)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="clasesDelDiaFiltro(lab.nombre).length === 0">
                        <td colspan="5" class="text-center text-muted py-4 small">No hay clases programadas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="clasesDelDia.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-calendar-x fs-1 d-block mb-3"></i>
                No hay clases programadas para {{ diaSeleccionado }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showFullSchedule = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>



<div id="zona-impresion" class="d-none">
      <div class="text-center mb-4">
        <h2>Academia de Mantenimiento Industrial</h2>
        <h3>Horario Escolar - {{ diaSeleccionado }}</h3>
      </div>
      <table class="table table-bordered border-dark text-center" style="width: 100%; border-collapse: collapse;">
        <thead class="table-light border-dark">
          <tr>
            <th style="width: 15%;">HORA</th>
            <th v-for="lab in laboratorios" :key="lab.nombre">{{ lab.nombre }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hora in [7,8,9,10,11,12,13,14,15,16,17]" :key="hora">
            <td class="fw-bold align-middle">{{ String(hora).padStart(2, '0') }}:00 a {{ String(hora+1).padStart(2, '0') }}:00</td>
            <td v-for="lab in laboratorios" :key="lab.nombre" class="align-middle p-2">
              <div v-for="c in clasesPorHora(lab.nombre, String(hora).padStart(2, '0') + ':00')" :key="c.id" class="small">
                <strong>{{ c.grupo }}</strong><br>
                {{ c.docente }}<br>
                <span class="text-uppercase">{{ c.materia }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>









</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import CircularProgress from '../components/CircularProgress.vue'

const API_URL = 'https://back-end-casilleros.onrender.com/horarios'

const horarios = ref([])
const horaActual = ref('')
const fechaActual = ref('')
const diaActual = ref('')
let timer = null

const laboratorios = ref([
  { 
    nombre: 'AU 106 Docencia III', 
    color: '#1565C0', 
    logo: '/logos/automatizacion.png', 
    icon: 'bi bi-easel2-fill'  // Caballete con pizarra (clásico de aula)
  },
  { 
    nombre: 'AU 107 Docencia III', 
    color: '#7B1FA2', 
    logo: '/logos/ciencias.png', 
    icon: 'bi bi-book-fill'  // Libro abierto (lectura/estudio)
  },
  { 
    nombre: 'AU 108 Docencia III', 
    color: '#F57C00', 
    logo: '/logos/electrica.png', 
    icon: 'bi bi-pencil-fill'  // Lápiz (escribir/notas)
  },
  { 
    nombre: 'AU 109 Docencia III', 
    color: '#00695C', 
    logo: '/logos/electronica.png', 
    icon: 'bi bi-projector-fill'  // Proyector (clases modernas)
  },
  { 
    nombre: 'AU 110 Docencia III', 
    color: '#690035ff', 
    logo: '/logos/reloj.png', 
    icon: 'bi bi-journal-text'  // Cuaderno de notas/clase
  },
  { 
    nombre: 'AU 111 Docencia III', 
    color: '#576463ff', 
    logo: '/logos/computadora.png', 
    icon: 'bi bi-pc-display-horizontal'  // Computadoras (sala con PCs)
  },
  { 
    nombre: 'AU 406 Docencia IV', 
    color: '#395a0fff', 
    logo: '/logos/electronica.png', 
    icon: 'bi bi-backpack-fill'  // Mochila escolar
  },
  { 
    nombre: 'AU 407 Docencia IV', 
    color: '#395a0fff', 
    logo: '/logos/electronica.png', 
    icon: 'bi bi-laptop-fill'  // Laptop (trabajo individual)
  },
  { 
    nombre: 'AU 408 Docencia IV', 
    color: '#395a0fff', 
    logo: '/logos/electronica.png', 
    icon: 'bi bi-people-fill'  // Grupo de estudiantes
  },
])

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const showFullSchedule = ref(false)
const diaSeleccionado = ref('Lunes')
const showForm = ref(false)
const editMode = ref(false)
const editId = ref(null)

const form = ref({
  dia: 'Lunes',
  laboratorio: laboratorios.value[0].nombre,
  materia: '',
  grupo: '',
  docente: '',
  horaInicio: '',
  horaFin: ''
})

// --- ESCÁNER DE IMÁGENES DE DOCENTES ---
// Vite lee automáticamente todos los archivos png, jpg y jpeg de esta carpeta
const imagenesDocentes = import.meta.glob('/public/maestros_manto/*.{png,jpg,jpeg}');

const listaMaestrosDirectorio = computed(() => {
  const nombres = [];
  for (const path in imagenesDocentes) {
    // 1. Extrae el nombre del archivo (ej. "Blas_Sanchez_Luis_Angel.png" -> "Blas_Sanchez_Luis_Angel")
    let nombreArchivo = path.split('/').pop().replace(/\.[^/.]+$/, "");
    
    // 2. Reemplaza los guiones bajos por espacios (ej. "Blas Sanchez Luis Angel")
    let nombreLimpio = nombreArchivo.replace(/_/g, ' ');
    
    nombres.push(nombreLimpio);
  }
  return nombres.sort(); // Los ordena alfabéticamente
});

function detectarCarrera(grupo) {
  if (!grupo) return 'MI'
  const upper = grupo.toUpperCase()
  if (upper.includes('MP')) return 'MP'
  if (upper.includes('MS')) return 'MS'
  if (upper.includes('IMI')) return 'IMI'
  if (upper.includes('MEC')) return 'MEC'
  if (upper.includes('SA')) return 'SA'
  return 'MI'
}

function logoCarrera(grupo) {
  const carrera = detectarCarrera(grupo)
  switch (carrera) {
    case 'MP': return '/logos/logo-petroleo.png'
    case 'MS': return '/logos/logo-soldadura.png'
    case 'MEC': return '/logos/logo_meca.png'
    case 'SA': return '/logos/logo_sa.png'
    case 'IMI':
    case 'MI':
    default: return '/logos/logo-mantenimiento.png'
  }
}

async function loadHorarios() {
  try {
    const res = await axios.get(API_URL)
    horarios.value = res.data
  } catch (err) {
    console.error('Error cargando horarios:', err)
  }
}

function updateTime() {
  const now = new Date()
  horaActual.value = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  fechaActual.value = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  diaActual.value = now.toLocaleDateString('es-MX', { weekday: 'long' })
}

onMounted(() => {
  loadHorarios()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => clearInterval(timer))

function claseActual(labNombre) {
  const hoy = diaActual.value.charAt(0).toUpperCase() + diaActual.value.slice(1)
  const ahora = new Date()
  const horaStr = ahora.toTimeString().slice(0, 5)

  return horarios.value.find(c => 
    c.dia === hoy &&
    c.laboratorio === labNombre &&
    horaStr >= c.horaInicio && 
    horaStr < c.horaFin
  ) || null
}

function progresoClase(labNombre) {
  const clase = claseActual(labNombre)
  if (!clase) return 0
  const [hi, mi] = clase.horaInicio.split(':').map(Number)
  const [hf, mf] = clase.horaFin.split(':').map(Number)
  const now = new Date()
  const actualMin = now.getHours() * 60 + now.getMinutes()
  const inicioMin = hi * 60 + mi
  const finMin = hf * 60 + mf
  return Math.max(0, Math.min(1, (actualMin - inicioMin) / (finMin - inicioMin)))
}

function proximasClases(labNombre) {
  const hoy = diaActual.value.charAt(0).toUpperCase() + diaActual.value.slice(1)
  const horaActualStr = new Date().toTimeString().slice(0, 5)

  return horarios.value
    .filter(c => c.dia === hoy && c.laboratorio === labNombre && c.horaInicio > horaActualStr)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    .slice(0, 10)  // Hasta 10 clases
}

function fotoDocente(nombreDocente) {
  if (!nombreDocente) return null
  const nombreArchivo = nombreDocente
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_') + '.png'
  return `/maestros_manto/${nombreArchivo}`
}

const clasesDelDia = computed(() => 
  horarios.value
    .filter(c => c.dia === diaSeleccionado.value)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
)

const clasesDelDiaFiltro = computed(() => {
  return (labNombre) => clasesDelDia.value.filter(c => c.laboratorio === labNombre)
})

// --- FUNCIONES DE APOYO PARA HORAS ---
// Convierte "12:30" a minutos (750) para poder calcular matemáticamente
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Verifica si dos rangos de tiempo se cruzan
function hayChoque(inicio1, fin1, inicio2, fin2) {
  return inicio1 < fin2 && fin1 > inicio2;
}

// --- FUNCIÓN INTELIGENTE PARA SUGERIR HORARIOS ---
function sugerirHorario(dia, laboratorio, docente, minutosDuracion) {
  const inicioJornada = 7 * 60; // 07:00
  const finJornada = 18 * 60; // 18:00
  
  // Clases de ese día para ese laboratorio Y ese docente
  const ocupados = horarios.value.filter(c => c.dia === dia && (c.laboratorio === laboratorio || c.docente === docente));
  
  // Buscar un hueco libre
  for (let t = inicioJornada; t <= finJornada - minutosDuracion; t += 30) {
    const posibleFin = t + minutosDuracion;
    const choca = ocupados.some(c => hayChoque(t, posibleFin, timeToMinutes(c.horaInicio), timeToMinutes(c.horaFin)));
    
    if (!choca) {
      const hInicio = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
      const hFin = String(Math.floor(posibleFin / 60)).padStart(2, '0') + ':' + String(posibleFin % 60).padStart(2, '0');
      return `${hInicio} a ${hFin}`;
    }
  }
  return "No hay bloques disponibles este día.";
}

// --- NUEVA FUNCIÓN SAVE CLASE CON VALIDACIÓN ---
async function saveClase() {
  const inicioNuevo = timeToMinutes(form.value.horaInicio);
  const finNuevo = timeToMinutes(form.value.horaFin);
  const duracion = finNuevo - inicioNuevo;

  if (inicioNuevo >= finNuevo) {
    return alert("La hora de inicio debe ser menor a la hora de fin.");
  }

  // Filtrar clases del mismo día (excluyendo la clase actual si estamos editando)
  const clasesDelDiaEvaluar = horarios.value.filter(c => 
    c.dia === form.value.dia && c.id !== editId.value
  );

  // 1. Validar Choque de Laboratorio / Aula
  const choqueLugar = clasesDelDiaEvaluar.find(c => 
    c.laboratorio === form.value.laboratorio && 
    hayChoque(inicioNuevo, finNuevo, timeToMinutes(c.horaInicio), timeToMinutes(c.horaFin))
  );

  if (choqueLugar) {
    const sugerencia = sugerirHorario(form.value.dia, form.value.laboratorio, form.value.docente, duracion);
    return alert(`🚨 ERROR DE ESPACIO:\nEl ${form.value.laboratorio} ya está ocupado por el grupo ${choqueLugar.grupo} (${choqueLugar.materia}) de ${choqueLugar.horaInicio} a ${choqueLugar.horaFin}.\n\n💡 Sugerencia disponible: ${sugerencia}`);
  }

  // 2. Validar Choque de Docente
  const choqueDocente = clasesDelDiaEvaluar.find(c => 
    c.docente === form.value.docente && 
    hayChoque(inicioNuevo, finNuevo, timeToMinutes(c.horaInicio), timeToMinutes(c.horaFin))
  );

  if (choqueDocente) {
    const sugerencia = sugerirHorario(form.value.dia, form.value.laboratorio, form.value.docente, duracion);
    return alert(`🚨 ERROR DE DOCENTE:\nEl maestro ${form.value.docente} ya imparte clases en ${choqueDocente.laboratorio} de ${choqueDocente.horaInicio} a ${choqueDocente.horaFin} en este mismo día.\n¡Un maestro no puede estar en dos lugares a la vez!\n\n💡 Sugerencia disponible: ${sugerencia}`);
  }

  // Si pasa las validaciones, guardamos
  try {
    if (editMode.value) {
      await axios.put(`${API_URL}/${editId.value}`, form.value);
    } else {
      await axios.post(API_URL, form.value);
    }
    await loadHorarios();
    cancelEdit();
    showForm.value = false;
  } catch (err) {
    console.error('Error completo:', err.response);
    alert('Error al guardar: ' + (err.response?.data?.error || err.response?.data || err.message || 'Desconocido'));
  }
}

function editClase(clase) {
  form.value = { ...clase }
  editMode.value = true
  editId.value = clase.id
  showForm.value = true
}

async function deleteClase(id) {
  if (confirm('¿Eliminar esta clase?')) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      await loadHorarios()
    } catch (err) {
      alert('Error al eliminar')
    }
  }
}

function cancelEdit() {
  editMode.value = false
  editId.value = null
  form.value = {
    dia: 'Lunes',
    laboratorio: laboratorios.value[0].nombre,
    materia: '',
    grupo: '',
    docente: '',
    horaInicio: '',
    horaFin: ''
  }
}


function abrirFormularioNuevo(nombreLaboratorio = null) {
  cancelEdit(); // Resetea el formulario por si había algo escrito
  
  // Si le dimos clic al botón de un laboratorio específico, lo pre-selecciona
  if (nombreLaboratorio) {
    form.value.laboratorio = nombreLaboratorio;
  }
  
  showForm.value = true; // Abre el modal
}

function cerrarFormulario() {
  showForm.value = false;
  cancelEdit(); // Resetea todo a blanco
}


// Función de ayuda para la tabla de impresión
const clasesPorHora = (labNombre, horaInicioFija) => {
  return clasesDelDia.value.filter(c => 
    c.laboratorio === labNombre && 
    c.horaInicio <= horaInicioFija && 
    c.horaFin > horaInicioFija
  );
};

// Función que dispara el PDF
const imprimirHorario = () => {
  window.print();
};










</script>

<style scoped>
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}

.card:hover { 
  transform: translateY(-3px); 
  transition: all 0.3s ease; 
}

/* Próximas clases: scroll manual */
.proximas-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}

.proxima-item {
  min-width: 220px;
  text-align: center;
}

/* Responsividad móvil */
@media (max-width: 767px) {
  .fs-2 { font-size: 1.8rem !important; }
  .fs-3 { font-size: 2rem !important; }
  .fs-5 { font-size: 1rem !important; }
  .btn { font-size: 0.9rem; padding: 0.5rem 1rem; }
  .table-sm { font-size: 0.8rem; }
  .table-sm th, .table-sm td { padding: 0.5rem; }
  .proxima-item { min-width: 180px; }
}

/* CSS PARA GENERAR EL PDF */
@media print {
  /* Ocultar toda la app normal */
  body * {
    visibility: hidden;
  }
  
  /* Solo mostrar la zona de impresión */
  #zona-impresion, #zona-impresion * {
    visibility: visible;
  }
  
  #zona-impresion {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    display: block !important;
  }

  /* Estilos de tabla para PDF */
  .table-bordered th, .table-bordered td {
    border: 2px solid black !important;
    font-size: 10px;
    padding: 8px;
  }
}

</style>
