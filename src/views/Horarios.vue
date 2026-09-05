<template>
  <div>
    <div class="container-fluid px-3 px-md-4 px-lg-5 py-3 bg-light border-bottom">
      <div class="row align-items-center">
        <div class="col-12 col-md-4 text-start text-md-start mb-3 mb-md-0">
          <h1 class="fs-2 fw-bold text-primary mb-0">
            <i class="bi bi-calendar3 me-2"></i> Horarios de Laboratorios
          </h1>
        </div>

        <div class="col-12 col-md-4 text-center mb-3 mb-md-0">
          <div class="fs-3 fw-bold text-dark mb-1">{{ horaActual }}</div>
          <div class="fs-5 text-muted">{{ fechaActual }}</div>
        </div>

        <div class="col-12 col-md-4 d-flex justify-content-center justify-content-md-end gap-2 flex-wrap">
          <button class="btn btn-primary px-4 py-2 shadow-sm" @click="showFullSchedule = true">
            <i class="bi bi-table me-2"></i>
            <span class="d-none d-sm-inline">Ver Horario Completo y Administrar</span>
            <span class="d-inline d-sm-none">Horario Completo</span>
          </button>

          <router-link :to="{ path: '/reporte-horarios', query: { dia: diaSeleccionado } }" class="btn btn-secondary px-4 py-2 shadow-sm text-decoration-none">
            <i class="bi bi-file-earmark-pdf-fill me-2"></i> Generar Reporte
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="alert alert-info text-center mx-3 mx-md-5 mt-3 border-0 shadow-sm">
      <div class="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
      <span class="fw-bold">Sincronizando con el servidor...</span>
    </div>
    <div v-if="errorConexion" class="alert alert-danger d-flex justify-content-between align-items-center mx-3 mx-md-5 mt-3 border-0 shadow-sm">
      <span><i class="bi bi-exclamation-triangle-fill me-2"></i> Problema de conexión.</span>
      <button class="btn btn-sm btn-danger fw-bold" @click="loadHorarios()">Reintentar</button>
    </div>

    <div class="container-fluid px-3 px-md-4 px-lg-5 py-4">
      
      <!-- BÚSQUEDA INTELIGENTE -->
      <div class="row mb-4">
        <div class="col-12 col-md-8 col-lg-6 mx-auto">
          <div class="input-group input-group-lg shadow-sm">
            <span class="input-group-text bg-white text-primary border-end-0">
              <i class="bi bi-search"></i>
            </span>
            <input 
              v-model="busquedaPrincipal" 
              type="text" 
              class="form-control border-start-0 ps-0" 
              placeholder="Buscar espacio, docente, grupo o materia en curso..."
            >
          </div>
        </div>
      </div>

      <div class="row g-3 g-md-4">
        <div v-for="lab in laboratoriosFiltrados" :key="lab.nombre" class="col-12 col-md-6 col-lg-6">
          <div class="card shadow-sm h-100 border-0" :style="{ borderLeft: `6px solid ${lab.color}` }">
            <div class="card-header bg-white d-flex align-items-center px-3 py-2">
              <i :class="lab.icon" class="me-3 text-primary" style="font-size: 2.2rem;"></i>
              <h5 class="mb-0 fw-bold">{{ lab.nombre }}</h5>
            </div>

            <div class="card-body py-3">
              <div v-if="claseActual(lab.nombre)">
                <div class="row g-3 align-items-center text-center text-md-start">
                  <div class="col-12 col-md-4 d-flex flex-column align-items-center">
                    <img :src="fotoDocente(claseActual(lab.nombre).docente) || '/logos/default-docente.png'" @error="$event.target.src = '/logos/default-docente.png'" class="rounded-circle shadow mb-2" style="width: 100px; height: 100px; object-fit: cover; border: 3px solid white;" alt="Foto docente" />
                    <div class="fw-bold text-dark fs-6 text-center">{{ claseActual(lab.nombre).docente }}</div>
                  </div>
                  <div class="col-12 col-md-4 text-center">
                    <h6 class="fw-bold text-primary mb-1">{{ claseActual(lab.nombre).materia }}</h6>
                    <p class="mb-1 text-dark small">Grupo: {{ claseActual(lab.nombre).grupo }}</p>
                    <span class="badge bg-primary px-3 py-1 small">{{ claseActual(lab.nombre).horaInicio }} - {{ claseActual(lab.nombre).horaFin }}</span>
                  </div>
                  <div class="col-12 col-md-4 d-flex justify-content-center">
                    <circular-progress :progress="progresoClase(lab.nombre)" :color="lab.color" :size="120" :logo-carrera="logoCarrera(claseActual(lab.nombre)?.grupo || '')" />
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <img src="/logos/Logo_nuevo.png" alt="Logo" class="mx-auto d-block mb-2" style="width: 120px; height: auto;" />
                <p class="text-muted fw-bold small mb-0">Sin clase en este momento</p>
              </div>

              <div class="mt-3 pt-3 border-top">
                <h6 class="text-muted text-center mb-2 small">Próximas clases hoy</h6>
                <div v-if="proximasClases(lab.nombre).length > 0" class="proximas-scroll">
                  <div class="d-flex gap-3">
                    <div v-for="c in proximasClases(lab.nombre)" :key="c.horaInicio" class="proxima-item flex-shrink-0 p-3 rounded bg-light text-center">
                      <img :src="fotoDocente(c.docente) || '/logos/default-docente.png'" @error="$event.target.src = '/logos/default-docente.png'" class="rounded-circle mb-2" style="width: 40px; height: 40px; object-fit: cover;" alt="Docente" />
                      <div class="small">
                        <div class="fw-bold">{{ c.horaInicio }} - {{ c.horaFin }}</div>
                        <div class="text-muted">{{ c.materia }}<br>({{ c.grupo }})<br><span class="text-secondary">{{ c.docente }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted small py-2">No hay más clases hoy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL UNIVERSAL -->
    <div v-if="showFullSchedule" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog modal-xl modal-dialog-scrollable modal-fullscreen-md-down">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Centro de Control de Espacios</h5>
            <button type="button" class="btn-close btn-close-white" @click="showFullSchedule = false"></button>
          </div>
          
          <div class="modal-body p-4">
            <ul class="nav nav-tabs mb-4">
              <li class="nav-item">
                <a class="nav-link fw-bold" :class="{ active: tabActiva === 'dia' }" href="#" @click.prevent="tabActiva = 'dia'">
                  <i class="bi bi-building me-2"></i>Vista por Laboratorio
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link fw-bold" :class="{ active: tabActiva === 'grupo' }" href="#" @click.prevent="tabActiva = 'grupo'">
                  <i class="bi bi-people-fill me-2"></i>Gestión de Grupos y Horas Libres
                </a>
              </li>
            </ul>

            <div v-if="tabActiva === 'dia'">
              <div class="card mb-4 border-0 shadow-sm">
                <div class="card-body">
                  <label class="form-label fw-bold">Seleccionar día</label>
                  <select v-model="diaSeleccionado" class="form-select form-select-lg">
                    <option v-for="dia in dias" :key="dia" :value="dia">{{ dia }}</option>
                  </select>
                </div>
              </div>

              <div class="mt-4">
                <div v-for="lab in laboratorios" :key="lab.nombre" class="mb-5 bg-white p-3 rounded shadow-sm border">
                  <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <div class="d-flex align-items-center">
                      <i :class="lab.icon" class="me-3 text-primary" style="font-size: 2rem;"></i>
                      <h5 class="mb-0 fw-bold" :style="{ color: lab.color }">{{ lab.nombre }}</h5>
                    </div>
                    <button class="btn btn-success btn-sm rounded-circle shadow-sm d-flex justify-content-center align-items-center" @click="abrirFormularioNuevo(lab.nombre)" style="width: 35px; height: 35px;" title="Agregar clase">
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
                          <td class="text-center text-nowrap">
                            <button class="btn btn-warning btn-sm me-1" @click="editClase(clase)"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-danger btn-sm" @click="deleteClase(clase.id)"><i class="bi bi-trash"></i></button>
                          </td>
                        </tr>
                        <tr v-if="clasesDelDiaFiltro(lab.nombre).length === 0">
                          <td colspan="5" class="text-center text-muted py-4 small">No hay clases programadas</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="tabActiva === 'grupo'">
              <div class="card mb-4 border-0 shadow-sm bg-light">
                <div class="card-body d-flex gap-3 align-items-end flex-wrap">
                  <div class="flex-grow-1">
                    <label class="form-label fw-bold">Buscar Grupo (Se mostrarán clases de Aulas y Laboratorios)</label>
                    <input v-model="grupoSeleccionado" list="lista-grupos" class="form-control form-control-lg" placeholder="Ej: 4B MI" />
                    <datalist id="lista-grupos">
                      <option v-for="g in gruposExistentes" :key="g" :value="g"></option>
                    </datalist>
                  </div>
                  <button class="btn btn-primary btn-lg" @click="abrirFormularioNuevo()" :disabled="!grupoSeleccionado">
                    <i class="bi bi-plus-circle me-2"></i>Agregar Clase
                  </button>
                </div>
              </div>

              <div v-if="grupoSeleccionado" class="mb-4">
                <h6 class="fw-bold text-success mb-3"><i class="bi bi-clock-history me-2"></i>Horas Disponibles (Para Regularizaciones)</h6>
                <div class="d-flex flex-wrap gap-2">
                  <div v-for="(huecos, dia) in horasLibresPorDia" :key="dia" class="card border-success shadow-sm" style="min-width: 180px;">
                    <div class="card-header bg-success text-white py-1 text-center fw-bold small">{{ dia }}</div>
                    <div class="card-body p-2 bg-light">
                      <div v-if="huecos.length === 0" class="small text-muted text-center">Día completo</div>
                      <span v-for="h in huecos" :key="h.inicio" class="badge bg-white text-success border border-success d-block mb-1 shadow-sm">
                        {{ h.inicio }} - {{ h.fin }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="grupoSeleccionado">
                <div class="d-flex justify-content-between align-items-center mb-3 border-top pt-3">
                  <h5 class="mb-0 fw-bold text-secondary">Horario de {{ grupoSeleccionado }}</h5>
                  <button v-if="clasesDelGrupo.length > 0" class="btn btn-outline-danger btn-sm" @click="vaciarGrupo">
                    <i class="bi bi-trash-fill me-1"></i> Eliminar Todo
                  </button>
                </div>

                <div class="table-responsive bg-white rounded shadow-sm border p-3">
                  <table class="table table-striped table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th>Día</th>
                        <th>Hora</th>
                        <th>Materia</th>
                        <th>Espacio Asignado</th>
                        <th>Docente</th>
                        <th class="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="clase in clasesDelGrupo" :key="clase.id">
                        <td class="fw-bold">{{ clase.dia }}</td>
                        <td>{{ clase.horaInicio }} - {{ clase.horaFin }}</td>
                        <td>{{ clase.materia }}</td>
                        <td><span class="badge bg-secondary text-white">{{ clase.laboratorio }}</span></td>
                        <td class="small">{{ clase.docente }}</td>
                        <td class="text-center text-nowrap">
                          <button class="btn btn-warning btn-sm me-1" @click="editClase(clase)"><i class="bi bi-pencil"></i></button>
                          <button class="btn btn-danger btn-sm" @click="deleteClase(clase.id)"><i class="bi bi-trash"></i></button>
                        </td>
                      </tr>
                      <tr v-if="clasesDelGrupo.length === 0">
                        <td colspan="6" class="text-center text-muted py-4">No hay clases registradas.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <transition name="fade">
              <div v-if="showForm" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1060;">
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
                              <option v-for="dia in dias" :key="dia" :value="dia">{{ dia }}</option>
                            </select>
                          </div>
                          
                          <div class="col-12 col-md-4">
                            <label class="form-label fw-bold">Espacio (Lab / Aula)</label>
                            <select v-model="form.laboratorio" class="form-select" required>
                              <option value="" disabled selected>Selecciona un espacio...</option>
                              <option v-for="espacio in todosLosEspacios" :key="espacio" :value="espacio">{{ espacio }}</option>
                            </select>
                          </div>

                          <div class="col-12 col-md-4">
                            <label class="form-label fw-bold">Materia</label>
                            <input v-model="form.materia" list="lista-materias" class="form-control" required placeholder="Escribe o selecciona..." />
                            <datalist id="lista-materias">
                              <option v-for="mat in materiasExistentes" :key="mat" :value="mat"></option>
                            </datalist>
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
                              <i class="bi" :class="editMode ? 'bi-check-circle' : 'bi-save'"></i> {{ editMode ? 'Actualizar' : 'Guardar' }}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
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

const cargando = ref(false)
const errorConexion = ref(false)
const busquedaPrincipal = ref('')

const tabActiva = ref('dia')
const grupoSeleccionado = ref('')

const laboratorios = ref([
  { nombre: 'Lab de Automatización - Pesado I', color: '#1565C0', logo: '/logos/automatizacion.png', icon: 'bi bi-cpu-fill' },
  { nombre: 'Lab de Ciencias Básicas - Pesado I', color: '#7B1FA2', logo: '/logos/ciencias.png', icon: 'bi bi-flask' },
  { nombre: 'Lab Eléctrica - Pesado I', color: '#F57C00', logo: '/logos/electrica.png', icon: 'bi bi-lightning-charge-fill' },
  { nombre: 'Lab Electrónica - Pesado I', color: '#00695C', logo: '/logos/electronica.png', icon: 'bi bi-motherboard-fill' },
  { nombre: 'Lab Metrología - Pesado II', color: '#690035ff', logo: '/logos/reloj.png', icon: 'bi bi-stopwatch' },
  { nombre: 'Cómputo III - Docencia II', color: '#576463ff', logo: '/logos/computadora.png', icon: 'bi bi-pc-display' },
  { nombre: 'Lab Manufactura - Pesado II', color: '#395a0fff', logo: '/logos/electronica.png', icon: 'bi bi-tools' },
])

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const diasOrden = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 }

const showFullSchedule = ref(false)
const diaSeleccionado = ref('Lunes')
const showForm = ref(false)
const editMode = ref(false)
const editId = ref(null)

const form = ref({
  dia: 'Lunes',
  laboratorio: '',
  materia: '',
  grupo: '',
  docente: '',
  horaInicio: '',
  horaFin: ''
})

const imagenesDocentes = import.meta.glob('/public/maestros_manto/*.{png,jpg,jpeg}');

const listaMaestrosDirectorio = computed(() => {
  const nombres = [];
  for (const path in imagenesDocentes) {
    let pathDecodificado = decodeURIComponent(path);
    let nombreArchivo = pathDecodificado.split('/').pop().replace(/\.[^/.]+$/, "");
    let nombreLimpio = nombreArchivo.replace(/_/g, ' ');
    nombreLimpio = nombreLimpio.normalize('NFC');
    nombres.push(nombreLimpio);
  }
  return nombres.sort(); 
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

async function loadHorarios(intentos = 3) {
  if (intentos === 3) { cargando.value = true; errorConexion.value = false; }
  try {
    const res = await axios.get(API_URL)
    horarios.value = res.data
    cargando.value = false;
    errorConexion.value = false;
  } catch (err) {
    if (intentos > 1) {
      setTimeout(() => loadHorarios(intentos - 1), 3000)
    } else {
      cargando.value = false; errorConexion.value = true;
    }
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

// --- UNIFICACIÓN DE ESPACIOS ---
const todosLosEspacios = computed(() => {
  const espaciosUnicos = new Set(horarios.value.map(c => c.laboratorio));
  laboratorios.value.forEach(l => espaciosUnicos.add(l.nombre));
  const aulasFijas = ['AU 106 Docencia III', 'AU 107 Docencia III', 'AU 108 Docencia III', 'AU 109 Docencia III', 'AU 110 Docencia III', 'AU 111 Docencia III', 'AU 406 Docencia IV', 'AU 407 Docencia IV', 'AU 408 Docencia IV', 'AU Virtual', 'Cancha Techada', 'Biblioteca'];
  aulasFijas.forEach(a => espaciosUnicos.add(a));
  return Array.from(espaciosUnicos).sort();
});

const gruposExistentes = computed(() => Array.from(new Set(horarios.value.map(c => c.grupo))).sort());
const materiasExistentes = computed(() => Array.from(new Set(horarios.value.map(c => c.materia))).sort());

const clasesDelGrupo = computed(() => {
  if (!grupoSeleccionado.value) return []
  return horarios.value.filter(c => c.grupo === grupoSeleccionado.value)
    .sort((a, b) => {
      if (diasOrden[a.dia] !== diasOrden[b.dia]) return diasOrden[a.dia] - diasOrden[b.dia];
      return a.horaInicio.localeCompare(b.horaInicio);
    });
});

// --- DETECTOR DE HUECOS LIBRES ---
function numAMinutos(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutosAStr(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

const horasLibresPorDia = computed(() => {
  if (!grupoSeleccionado.value) return {};
  const inicioJornada = 7 * 60, finJornada = 18 * 60;
  const reporte = {};

  dias.slice(0, 5).forEach(dia => { 
    const clasesDia = clasesDelGrupo.value.filter(c => c.dia === dia)
                      .sort((a, b) => numAMinutos(a.horaInicio) - numAMinutos(b.horaInicio));
    let tiempoActual = inicioJornada;
    const huecos = [];

    clasesDia.forEach(clase => {
      const inicioClase = numAMinutos(clase.horaInicio);
      const finClase = numAMinutos(clase.horaFin);
      if (inicioClase - tiempoActual >= 30) huecos.push({ inicio: minutosAStr(tiempoActual), fin: minutosAStr(inicioClase) });
      tiempoActual = Math.max(tiempoActual, finClase);
    });

    if (finJornada - tiempoActual >= 30) huecos.push({ inicio: minutosAStr(tiempoActual), fin: minutosAStr(finJornada) });
    reporte[dia] = huecos;
  });
  return reporte;
});

function claseActual(labNombre) {
  const hoy = diaActual.value.charAt(0).toUpperCase() + diaActual.value.slice(1);
  const horaStr = new Date().toTimeString().slice(0, 5);
  return horarios.value.find(c => c.dia === hoy && c.laboratorio === labNombre && horaStr >= c.horaInicio && horaStr < c.horaFin) || null;
}

// --- BUSCADOR INTELIGENTE ---
const laboratoriosFiltrados = computed(() => {
  if (!busquedaPrincipal.value) return laboratorios.value;
  const termino = busquedaPrincipal.value.toLowerCase();
  return laboratorios.value.filter(lab => {
    if (lab.nombre.toLowerCase().includes(termino)) return true;
    const actual = claseActual(lab.nombre);
    if (actual) {
      if (actual.docente.toLowerCase().includes(termino)) return true;
      if (actual.materia.toLowerCase().includes(termino)) return true;
      if (actual.grupo.toLowerCase().includes(termino)) return true;
    }
    return false;
  });
});

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
  const hoy = diaActual.value.charAt(0).toUpperCase() + diaActual.value.slice(1);
  const horaActualStr = new Date().toTimeString().slice(0, 5);
  return horarios.value.filter(c => c.dia === hoy && c.laboratorio === labNombre && c.horaInicio > horaActualStr)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)).slice(0, 10);
}

function fotoDocente(nombreDocente) {
  if (!nombreDocente) return null;
  const n = nombreDocente.trim().normalize('NFC');
  const ext = n.includes('Gallegos Amador Benito') ? '.jpg' : '.png';
  return `/maestros_manto/${encodeURIComponent(n.replace(/\s+/g, '_'))}${ext}`;
}

const clasesDelDia = computed(() => horarios.value.filter(c => c.dia === diaSeleccionado.value).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)))
const clasesDelDiaFiltro = computed(() => (labNombre) => clasesDelDia.value.filter(c => c.laboratorio === labNombre))

function hayChoque(inicio1, fin1, inicio2, fin2) { return inicio1 < fin2 && fin1 > inicio2; }

function sugerirHorario(dia, laboratorio, docente, minutosDuracion) {
  const inicioJornada = 7 * 60, finJornada = 18 * 60; 
  const ocupados = horarios.value.filter(c => c.dia === dia && (c.laboratorio === laboratorio || c.docente === docente));
  for (let t = inicioJornada; t <= finJornada - minutosDuracion; t += 30) {
    const posibleFin = t + minutosDuracion;
    if (!ocupados.some(c => hayChoque(t, posibleFin, numAMinutos(c.horaInicio), numAMinutos(c.horaFin)))) {
      return `${minutosAStr(t)} a ${minutosAStr(posibleFin)}`;
    }
  }
  return "No hay bloques disponibles este día.";
}

async function saveClase() {
  const inicioNuevo = numAMinutos(form.value.horaInicio);
  const finNuevo = numAMinutos(form.value.horaFin);
  if (inicioNuevo >= finNuevo) return alert("La hora de inicio debe ser menor a la hora de fin.");

  const clasesEvaluar = horarios.value.filter(c => c.dia === form.value.dia && c.id !== editId.value);
  const choqueLugar = clasesEvaluar.find(c => form.value.laboratorio !== 'AU Virtual' && c.laboratorio === form.value.laboratorio && hayChoque(inicioNuevo, finNuevo, numAMinutos(c.horaInicio), numAMinutos(c.horaFin)));
  
  if (choqueLugar) {
    return alert(`🚨 ERROR DE ESPACIO:\nEl ${form.value.laboratorio} ya está ocupado por el grupo ${choqueLugar.grupo} (${choqueLugar.materia}) de ${choqueLugar.horaInicio} a ${choqueLugar.horaFin}.\n💡 Sugerencia: ${sugerirHorario(form.value.dia, form.value.laboratorio, form.value.docente, finNuevo - inicioNuevo)}`);
  }

  const choqueDocente = clasesEvaluar.find(c => c.docente === form.value.docente && hayChoque(inicioNuevo, finNuevo, numAMinutos(c.horaInicio), numAMinutos(c.horaFin)) && !(c.laboratorio === 'AU Virtual' && form.value.laboratorio === 'AU Virtual'));
  
  if (choqueDocente) {
    return alert(`🚨 ERROR DE DOCENTE:\nEl maestro ${form.value.docente} ya imparte clases en ${choqueDocente.laboratorio} de ${choqueDocente.horaInicio} a ${choqueDocente.horaFin} en este mismo día.\n💡 Sugerencia: ${sugerirHorario(form.value.dia, form.value.laboratorio, form.value.docente, finNuevo - inicioNuevo)}`);
  }

  try {
    editMode.value ? await axios.put(`${API_URL}/${editId.value}`, form.value) : await axios.post(API_URL, form.value);
    await loadHorarios();
    cerrarFormulario();
  } catch (err) { alert('Error al guardar.'); }
}

function editClase(clase) { form.value = { ...clase }; editMode.value = true; editId.value = clase.id; showForm.value = true; }

async function deleteClase(id) {
  if (confirm('¿Eliminar esta clase?')) {
    try { await axios.delete(`${API_URL}/${id}`); await loadHorarios(); } catch (err) { alert('Error al eliminar'); }
  }
}

async function vaciarGrupo() {
  if (!grupoSeleccionado.value) return;
  if (confirm(`¿Estás seguro de eliminar TODAS las clases del grupo ${grupoSeleccionado.value}?`)) {
    cargando.value = true;
    try {
      await Promise.all(clasesDelGrupo.value.map(c => axios.delete(`${API_URL}/${c.id}`)));
      await loadHorarios();
      alert('Horario del grupo eliminado.');
    } catch (err) { alert('Error al vaciar grupo.'); } finally { cargando.value = false; }
  }
}

function cancelEdit() {
  editMode.value = false; editId.value = null;
  form.value = { dia: diaSeleccionado.value, laboratorio: laboratorios.value[0]?.nombre || '', materia: '', grupo: '', docente: '', horaInicio: '', horaFin: '' };
}

function abrirFormularioNuevo(nombreLaboratorio = null) {
  cancelEdit();
  if (nombreLaboratorio) form.value.laboratorio = nombreLaboratorio;
  if (tabActiva.value === 'grupo' && grupoSeleccionado.value) form.value.grupo = grupoSeleccionado.value;
  showForm.value = true;
}

function cerrarFormulario() { showForm.value = false; cancelEdit(); }

// --- FUNCIÓN PARA LA ZONA DE IMPRESIÓN ---
const clasesPorHora = (labNombre, horaInicioFija) => {
  return clasesDelDia.value.filter(c => 
    c.laboratorio === labNombre && 
    c.horaInicio <= horaInicioFija && 
    c.horaFin > horaInicioFija
  );
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.card:hover { transform: translateY(-3px); transition: all 0.3s ease; }
.proximas-scroll { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; padding-bottom: 8px; }
.proxima-item { min-width: 220px; text-align: center; }
.nav-tabs .nav-link { color: #6c757d; }
.nav-tabs .nav-link.active { color: #0d6efd; border-bottom: 3px solid #0d6efd; }
@media (max-width: 767px) { .fs-2 { font-size: 1.8rem !important; } .fs-3 { font-size: 2rem !important; } .fs-5 { font-size: 1rem !important; } .proxima-item { min-width: 180px; } }
@media print {
  body * { visibility: hidden; }
  #zona-impresion, #zona-impresion * { visibility: visible; }
  #zona-impresion { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
  .table-bordered th, .table-bordered td { border: 2px solid black !important; font-size: 10px; padding: 8px; }
}
</style>


