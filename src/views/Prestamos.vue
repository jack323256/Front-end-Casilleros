<template>
  <div>
    <!-- Cabecera -->
    <div class="container-fluid px-3 px-md-4 px-lg-5 py-3 bg-light border-bottom">
      <div class="row align-items-center">
        <div class="col-12 col-md-4 text-start mb-3 mb-md-0">
          <h1 class="fs-2 fw-bold text-primary mb-0">
            <i class="bi bi-box-arrow-up me-2"></i> Préstamos en Clases Activas
          </h1>
        </div>
        <div class="col-12 col-md-4 text-center">
          <div class="fs-3 fw-bold text-dark mb-1">{{ horaActual }}</div>
          <div class="fs-5 text-muted">{{ fechaActual }}</div>
        </div>
        <div class="col-12 col-md-4 text-end">
          <button class="btn btn-primary px-4 py-2 shadow-sm" disabled>
            <i class="bi bi-journal-text me-2"></i>
            <span class="d-none d-sm-inline">Historial Completo</span>
            <span class="d-inline d-sm-none">Historial</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Laboratorios -->
    <div class="container-fluid px-3 px-md-4 px-lg-5 py-4">
      <div class="row g-4">
        <div v-for="lab in laboratorios" :key="lab.nombre" class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm h-100 border-0" :style="{ borderLeft: `6px solid ${lab.color}` }">
            <div class="card-header bg-white d-flex align-items-center px-3 py-2">
              <i :class="lab.icon" class="me-3 text-primary" style="font-size: 2.2rem;"></i>
              <h5 class="mb-0 fw-bold">{{ lab.nombre }}</h5>
            </div>

            <div class="card-body py-3">
              <!-- Clase activa registrada en sistema de préstamos -->
              <div v-if="claseActual(lab.nombre)">
                <div class="text-center mb-3">
                  <img src="/logos/Imagen3.png" class="rounded-circle shadow" style="width: 80px; height: 80px; object-fit: cover;" alt="Docente" />
                  <div class="fw-bold mt-2">{{ claseActual(lab.nombre).docente }}</div>
                  <h6 class="text-primary">{{ claseActual(lab.nombre).materia }}</h6>
                  <p class="small">Grupo: {{ claseActual(lab.nombre).grupo }}</p>
                </div>

                <div class="text-center mb-3">
                  <span class="badge bg-primary px-3 py-2">
                    {{ formatearHora(claseActual(lab.nombre).fecha_inicio) }} - {{ formatearHora(claseActual(lab.nombre).fecha_fin) }}
                  </span>
                </div>

                <div class="mt-3" v-if="tarjetasDelLab(lab.nombre).length > 0">
                  <h6 class="text-muted text-center mb-3">Tarjetas Activas</h6>
                  <div v-for="t in tarjetasDelLab(lab.nombre)" :key="t.id" class="border rounded p-3 mb-3 bg-light shadow-sm">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <strong class="fs-5">{{ t.responsable_actual }}</strong>
                        <p class="small mb-1 text-muted">Ubicación: {{ t.ubicacion_trabajo || 'No especificada' }}</p>
                        <small class="text-muted">{{ materialesTarjeta[t.id]?.length || 0 }} artículo(s)</small>
                      </div>
                      <button class="btn btn-outline-primary btn-sm" @click="abrirDetallesTarjeta(t)">
                        <i class="bi bi-eye"></i> Ver
                      </button>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-3">
                  <button class="btn btn-primary" @click="abrirModalNuevaTarjeta(lab, claseActual(lab.nombre).id, true)">
                    <i class="bi bi-plus-circle me-2"></i> Nueva Tarjeta de Clase
                  </button>
                </div>
              </div>

              <!-- Sin clase activa registrada -->
              <div v-else class="text-center py-4">
                <!-- Clase según horario general -->
                <div v-if="claseActualHorario(lab.nombre)" class="row g-3 align-items-center text-center text-md-start">
                  <div class="col-12 col-md-4 d-flex flex-column align-items-center">
                    <img 
                      :src="fotoDocente(claseActualHorario(lab.nombre).docente) || '/logos/default-docente.png'"
                      @error="$event.target.src = '/logos/default-docente.png'"
                      class="rounded-circle shadow mb-2"
                      style="width: 100px; height: 100px; object-fit: cover; border: 3px solid white;"
                      alt="Docente"
                    />
                    <div class="fw-bold text-dark fs-6 text-center">
                      {{ claseActualHorario(lab.nombre).docente }}
                    </div>
                  </div>

                  <div class="col-12 col-md-4 text-center">
                    <h6 class="fw-bold text-primary mb-1">{{ claseActualHorario(lab.nombre).materia }}</h6>
                    <p class="mb-1 text-dark small">Grupo: {{ claseActualHorario(lab.nombre).grupo }}</p>
                    <span class="badge bg-primary px-3 py-1 small">
                      {{ claseActualHorario(lab.nombre).horaInicio }} - {{ claseActualHorario(lab.nombre).horaFin }}
                    </span>
                    <div class="text-muted small mt-2">Clase en curso (horario general)</div>
                  </div>

                  <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
                    <img 
                      :src="logoCarrera(claseActualHorario(lab.nombre)?.grupo || '')"
                      class="img-fluid"
                      style="max-width: 80px; max-height: 80px;"
                      alt="Carrera"
                    />
                  </div>
                </div>

                <!-- Sin clase -->
                <div v-else>
                  <i class="bi bi-moon-stars fs-1 text-muted mb-3"></i>
                  <p class="text-muted fw-bold">Sin clase en este momento</p>
                </div>

                <!-- Tarjetas remediales -->
                <div class="mt-3" v-if="tarjetasRemediales[lab.nombre]?.length > 0">
                  <h6 class="text-muted text-center mb-3">Tarjetas Remediales Activas</h6>
                  <div v-for="t in tarjetasRemediales[lab.nombre]" :key="t.id" class="border rounded p-3 mb-3 bg-warning-subtle shadow-sm">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <strong class="fs-5">{{ t.responsable_actual }}</strong>
                        <p class="small mb-1 text-muted">Ubicación: {{ t.ubicacion_trabajo || 'No especificada' }}</p>
                        <small class="text-muted">{{ materialesTarjeta[t.id]?.length || 0 }} artículo(s)</small>
                      </div>
                      <button class="btn btn-outline-primary btn-sm" @click="abrirDetallesTarjeta(t)">
                        <i class="bi bi-eye"></i> Ver
                      </button>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-3">
                  <button class="btn btn-success" @click="abrirModalNuevaTarjeta(lab, null, false)">
                    <i class="bi bi-plus-circle me-2"></i> Nueva Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Tarjeta -->
    <div class="modal fade" id="modalNuevaTarjeta" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header text-white" :class="esClaseActiva ? 'bg-primary' : 'bg-success'">
            <h5 class="modal-title">
              <i class="bi bi-card-list me-2"></i>
              Nueva Tarjeta {{ esClaseActiva ? 'de Clase' : 'Remedial' }} - {{ labSeleccionado?.nombre }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <label class="form-label fw-bold">Responsable (Alumno)</label>
                <input v-model="formTarjeta.responsable" type="text" class="form-control" placeholder="Nombre completo" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Matrícula / Referencia (opcional)</label>
                <input v-model="formTarjeta.referencia" type="text" class="form-control" placeholder="Ej: 20211001" />
              </div>
            </div>

            <label class="form-label fw-bold">Buscar Material</label>
            <input v-model="busquedaMaterial" @input="filtrarMaterial" type="text" class="form-control mb-3" placeholder="Nombre, código o descripción..." />

            <div class="row mb-4">
              <div class="col-12">
                <h6 class="fw-bold">Materiales seleccionados ({{ materialesSeleccionados.length }})</h6>
                <div v-if="materialesSeleccionados.length === 0" class="text-muted small">Ningún material seleccionado</div>
                <div class="row row-cols-1 row-cols-md-3 g-3">
                  <div v-for="item in materialesSeleccionados" :key="item.id" class="col">
                    <div class="card shadow-sm">
                      <img :src="'http://127.0.0.1:5000' + item.imagen_url" class="card-img-top" style="height: 100px; object-fit: contain;" alt="Material" />
                      <div class="card-body p-2">
                        <p class="small mb-0"><strong>{{ item.nombre }}</strong></p>
                        <small class="text-muted">{{ item.codigo }}</small>
                      </div>
                      <div class="card-footer p-2">
                        <button class="btn btn-outline-danger btn-sm w-100" @click="toggleSeleccion(item)">
                          <i class="bi bi-trash"></i> Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3" style="max-height: 500px; overflow-y: auto;">
              <div v-for="item in inventarioFiltrado" :key="item.id" class="col">
                <div class="card h-100 shadow-sm" 
                     :class="{ 'border-primary border-3': materialesSeleccionados.some(m => m.id === item.id) }"
                     @click="toggleSeleccion(item)"
                     style="cursor: pointer;">
                  <img :src="'http://127.0.0.1:5000' + item.imagen_url" class="card-img-top" style="height: 150px; object-fit: contain; background: #f8f9fa;" alt="Material" />
                  <div class="card-body p-3">
                    <h6 class="small mb-1">{{ item.nombre }}</h6>
                    <p class="text-muted small mb-1">{{ item.codigo }}</p>
                    <p class="small mb-2">{{ item.descripcion || 'Sin descripción' }}</p>
                    <span class="badge" :class="item.cantidad_disponible > 0 ? 'bg-success' : 'bg-danger'">
                      Disponible: {{ item.cantidad_disponible }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-end mt-4">
              <button class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
              <button class="btn btn-primary" @click="crearTarjeta" :disabled="materialesSeleccionados.length === 0 || !formTarjeta.responsable">
                <i class="bi bi-check-circle me-1"></i> Crear Tarjeta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalles de Tarjeta -->
    <div class="modal fade" id="modalDetalles" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">
              <i class="bi bi-card-list me-2"></i> 
              Tarjeta #{{ tarjetaSeleccionada?.id ?? 'Cargando...' }} 
              <span v-if="tarjetaSeleccionada">- {{ tarjetaSeleccionada.responsable_actual }}</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body" v-if="tarjetaSeleccionada">
            <!-- Editar responsable -->
            <div class="row mb-4">
              <div class="col-md-8">
                <label class="form-label fw-bold">Responsable</label>
                <div class="input-group">
                  <input v-model="tarjetaSeleccionada.responsable_actual" type="text" class="form-control" />
                  <button class="btn btn-outline-primary" @click="actualizarResponsable">
                    <i class="bi bi-save"></i> Guardar
                  </button>
                </div>
              </div>
              <div class="col-md-4 d-flex align-items-end text-muted small">
                Ubicación: <strong class="ms-2">{{ tarjetaSeleccionada.ubicacion_trabajo || 'General' }}</strong>
              </div>
            </div>

            <hr>

            <!-- Agregar material adicional -->
            <div class="card mb-4 border-primary">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">Agregar material adicional</h6>
              </div>
              <div class="card-body">
                <input v-model="busquedaAgregar" @input="filtrarAgregar" type="text" class="form-control mb-3" placeholder="Buscar por nombre, código..." />

                <div class="row row-cols-1 row-cols-md-3 g-3" style="max-height: 400px; overflow-y: auto;">
                  <div v-for="item in inventarioFiltradoAgregar" :key="item.id" class="col">
                    <div class="card h-100 shadow-sm border" 
                         :class="{ 'border-success border-3': materialAAgregar === item.id }"
                         @click="materialAAgregar = item.id"
                         style="cursor: pointer;">
                      <img :src="'http://127.0.0.1:5000' + item.imagen_url" class="card-img-top" style="height: 120px; object-fit: contain;" alt="Material" />
                      <div class="card-body p-2">
                        <h6 class="small mb-1">{{ item.nombre }}</h6>
                        <p class="text-muted small mb-1">Código: {{ item.codigo }}</p>
                        <span class="badge" :class="item.cantidad_disponible > 0 ? 'bg-success' : 'bg-danger'">
                          Disp: {{ item.cantidad_disponible }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-end mt-3">
                  <button class="btn btn-success" @click="agregarMaterialATarjeta" :disabled="!materialAAgregar">
                    <i class="bi bi-plus-circle"></i> Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- Materiales prestados -->
            <h6 class="fw-bold mb-3">Materiales prestados ({{ materialesTarjeta[tarjetaSeleccionada.id]?.length || 0 }})</h6>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="mat in materialesTarjeta[tarjetaSeleccionada.id] || []" :key="mat.id" class="col">
                <div class="card shadow-sm h-100">
                  <div class="row g-0">
                    <div class="col-4">
                      <img 
                        :src="'http://127.0.0.1:5000' + (mat.imagen_url || '/uploads/default.png')" 
                        class="img-fluid rounded-start" 
                        style="height: 100%; width: 100%; object-fit: cover;" 
                        alt="Material"
                        @error="$event.target.src = '/logos/default-material.png'"
                      />
                    </div>
                    <div class="col-8">
                      <div class="card-body p-3">
                        <h6 class="mb-1">{{ mat.nombre || 'Sin nombre' }}</h6>
                        <p class="small text-muted mb-1">Código: {{ mat.codigo || 'N/A' }}</p>
                        <p class="small mb-1">Cantidad: <strong>{{ mat.cantidad }}</strong></p>
                        <p class="small mb-2">Salida: <span class="badge bg-info">{{ mat.estado_salida }}</span></p>

                        <div class="mb-2">
                          <label class="small fw-bold">Estado entrada:</label>
                          <select v-model="mat.estado_entrada" class="form-select form-select-sm">
                            <option value="">Pendiente</option>
                            <option value="bueno">Bueno</option>
                            <option value="regular">Regular</option>
                            <option value="malo">Malo</option>
                          </select>
                        </div>

                        <span :class="mat.devuelto ? 'badge bg-success' : 'badge bg-warning'">
                          {{ mat.devuelto ? 'Devuelto' : 'Pendiente' }}
                        </span>

                        <button class="btn btn-success btn-sm mt-2 w-100" 
                                @click="devolverMaterial(mat.id)" 
                                :disabled="mat.devuelto || !mat.estado_entrada">
                          Devolver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-end mt-4">
              <button class="btn btn-success btn-lg" 
                      @click="devolverTodo(tarjetaSeleccionada.id)" 
                      :disabled="pendientesDevolucion(tarjetaSeleccionada.id) > 0">
                <i class="bi bi-box-arrow-in-right me-2"></i> Devolver Todo y Cerrar
              </button>
            </div>
          </div>

          <div v-else class="modal-body text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3">Cargando detalles de la tarjeta...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import { Modal } from 'bootstrap'

const horaActual = ref('')
const fechaActual = ref('')
const diaActual = ref('')
let timer = null
let intervalDatos = null
let intervalHorarios = null

const sesionesActivas = ref([])
const tarjetasActivas = ref({})
const tarjetasRemediales = ref({})
const materialesTarjeta = ref({})
const inventario = ref([])
const inventarioFiltrado = ref([])
const busquedaMaterial = ref('')
const materialesSeleccionados = ref([])
const horarios = ref([])

const modalNuevaTarjeta = ref(null)
const modalDetalles = ref(null)
const labSeleccionado = ref(null)
const sesionIdActual = ref(null)
const esClaseActiva = ref(false)
const formTarjeta = ref({ responsable: '', referencia: '' })
const tarjetaSeleccionada = ref(null)
const busquedaAgregar = ref('')
const inventarioFiltradoAgregar = ref([])
const materialAAgregar = ref(null)

const laboratorios = ref([
  { nombre: 'Lab de Automatización - Pesado I', color: '#1565C0', icon: 'bi bi-robot' },
  { nombre: 'Lab de Ciencias Básicas - Pesado I', color: '#7B1FA2', icon: 'bi bi-flask' },
  { nombre: 'Lab Eléctrica - Pesado I', color: '#F57C00', icon: 'bi bi-lightning-charge-fill' },
  { nombre: 'Lab Electrónica - Pesado I', color: '#00695C', icon: 'bi bi-motherboard-fill' },
  { nombre: 'Lab Metrología - Pesado II', color: '#690035ff', icon: 'bi bi-stopwatch' },
  { nombre: 'Cómputo III - Docencia II', color: '#576463ff', icon: 'bi bi-pc-display' },
  { nombre: 'Lab Manufactura - Pesado II', color: '#395a0fff', icon: 'bi bi-tools' },
])

async function cargarHorarios() {
  try {
    const res = await axios.get('/horarios')
    horarios.value = res.data || []
  } catch (err) {
    console.warn('Horarios no disponibles (backend caído o error):', err.message)
  }
}

function claseActualHorario(labNombre) {
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
    default: return '/logos/logo-mantenimiento.png'
  }
}

function fotoDocente(nombreDocente) {
  if (!nombreDocente) return '/logos/default-docente.png'
  const nombreArchivo = nombreDocente
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_') + '.png'
  return `/maestros_manto/${nombreArchivo}`
}

function claseActual(labNombre) {
  return sesionesActivas.value.find(s => s.laboratorio === labNombre && s.estatus === 'activa')
}

function tarjetasDelLab(labNombre) {
  return tarjetasActivas.value[labNombre] || []
}

function formatearHora(iso) {
  return iso ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '--:--'
}

async function cargarDatos() {
  try {
    const resSesiones = await axios.get('http://127.0.0.1:5000/manto/sesiones')
    sesionesActivas.value = resSesiones.data || []

    tarjetasActivas.value = {}
    tarjetasRemediales.value = {}

    const resTarjetas = await axios.get('http://127.0.0.1:5000/manto/tarjetas')
    for (const t of resTarjetas.data || []) {
      await cargarMateriales(t.id)
      const lab = t.ubicacion_trabajo || 'General'
      if (t.sesion_id) {
        const sesion = sesionesActivas.value.find(s => s.id === t.sesion_id)
        if (sesion) {
          if (!tarjetasActivas.value[sesion.laboratorio]) tarjetasActivas.value[sesion.laboratorio] = []
          tarjetasActivas.value[sesion.laboratorio].push(t)
        }
      } else {
        if (!tarjetasRemediales.value[lab]) tarjetasRemediales.value[lab] = []
        tarjetasRemediales.value[lab].push(t)
      }
    }
  } catch (err) {
    console.warn('Error cargando datos de préstamos:', err.message)
  }
}

async function cargarMateriales(tarjetaId) {
  try {
    const res = await axios.get(`http://127.0.0.1:5000/manto/tarjeta-material/tarjeta/${tarjetaId}`)
    materialesTarjeta.value[tarjetaId] = res.data || []
  } catch (err) {
    materialesTarjeta.value[tarjetaId] = []
  }
}

async function cargarInventario() {
  try {
    const res = await axios.get('http://127.0.0.1:5000/manto/inventario')
    inventario.value = res.data.filter(i => i.activo && i.cantidad_disponible > 0) || []
    inventarioFiltrado.value = inventario.value
    inventarioFiltradoAgregar.value = inventario.value
  } catch (err) {
    console.warn('Inventario no disponible')
    inventario.value = []
  }
}

function filtrarMaterial() {
  const q = busquedaMaterial.value.toLowerCase()
  if (!q) {
    inventarioFiltrado.value = inventario.value
    return
  }
  inventarioFiltrado.value = inventario.value.filter(i =>
    i.nombre.toLowerCase().includes(q) ||
    i.codigo.toLowerCase().includes(q) ||
    (i.descripcion && i.descripcion.toLowerCase().includes(q))
  )
}

function toggleSeleccion(item) {
  const index = materialesSeleccionados.value.findIndex(m => m.id === item.id)
  if (index === -1) materialesSeleccionados.value.push(item)
  else materialesSeleccionados.value.splice(index, 1)
}

function filtrarAgregar() {
  const q = busquedaAgregar.value.toLowerCase()
  if (!q) {
    inventarioFiltradoAgregar.value = inventario.value
    return
  }
  inventarioFiltradoAgregar.value = inventario.value.filter(i =>
    i.nombre.toLowerCase().includes(q) ||
    i.codigo.toLowerCase().includes(q) ||
    (i.descripcion && i.descripcion.toLowerCase().includes(q))
  )
}

function abrirModalNuevaTarjeta(lab, sesionId, claseActiva) {
  labSeleccionado.value = lab
  sesionIdActual.value = sesionId
  esClaseActiva.value = claseActiva
  formTarjeta.value = { responsable: '', referencia: '' }
  materialesSeleccionados.value = []
  busquedaMaterial.value = ''
  cargarInventario().then(() => {
    if (modalNuevaTarjeta.value) modalNuevaTarjeta.value.show()
  })
}

async function crearTarjeta() {
  if (!formTarjeta.value.responsable || materialesSeleccionados.value.length === 0) {
    alert('Completa el responsable y selecciona al menos un material')
    return
  }

  try {
    const payload = {
      sesion_id: sesionIdActual.value,
      responsable_actual: formTarjeta.value.responsable,
      ubicacion_trabajo: labSeleccionado.value.nombre
    }
    const res = await axios.post('http://127.0.0.1:5000/manto/tarjetas', payload)
    const tarjetaId = res.data.id

    for (const item of materialesSeleccionados.value) {
      await axios.post(`http://127.0.0.1:5000/manto/tarjeta-material/${tarjetaId}`, {
        inventario_id: item.id,
        cantidad: 1,
        estado_salida: 'bueno'
      })
    }

    alert('Tarjeta creada correctamente')
    modalNuevaTarjeta.value.hide()
    await cargarDatos()
  } catch (err) {
    alert('Error al crear tarjeta: ' + (err.response?.data?.error || err.message))
  }
}

async function actualizarResponsable() {
  if (!tarjetaSeleccionada.value) return
  try {
    await axios.put(`http://127.0.0.1:5000/manto/tarjetas/${tarjetaSeleccionada.value.id}`, {
      responsable_actual: tarjetaSeleccionada.value.responsable_actual
    })
    alert('Responsable actualizado')
    await cargarDatos()
  } catch (err) {
    alert('Error al actualizar responsable')
  }
}

async function agregarMaterialATarjeta() {
  if (!materialAAgregar.value || !tarjetaSeleccionada.value) return
  const item = inventario.value.find(i => i.id === materialAAgregar.value)
  if (!item || item.cantidad_disponible <= 0) {
    alert('Material no disponible')
    return
  }

  try {
    await axios.post(`http://127.0.0.1:5000/manto/tarjeta-material/${tarjetaSeleccionada.value.id}`, {
      inventario_id: item.id,
      cantidad: 1,
      estado_salida: 'bueno'
    })
    alert('Material agregado')
    materialAAgregar.value = null
    busquedaAgregar.value = ''
    await cargarMateriales(tarjetaSeleccionada.value.id)
    await cargarInventario()
  } catch (err) {
    alert('Error al agregar material')
  }
}

function abrirDetallesTarjeta(tarjeta) {
  tarjetaSeleccionada.value = tarjeta
  cargarMateriales(tarjeta.id).then(() => {
    cargarInventario().then(() => {
      inventarioFiltradoAgregar.value = inventario.value
      if (modalDetalles.value) modalDetalles.value.show()
    })
  })
}

async function devolverMaterial(materialId) {
  const mats = materialesTarjeta.value[tarjetaSeleccionada.value?.id] || []
  const mat = mats.find(m => m.id === materialId)
  if (!mat?.estado_entrada) {
    alert('Selecciona el estado de entrada')
    return
  }

  try {
    await axios.put(`http://127.0.0.1:5000/manto/tarjeta-material/${materialId}/devolver`, {
      estado_entrada: mat.estado_entrada
    })
    alert('Material devuelto')
    await cargarMateriales(tarjetaSeleccionada.value.id)
  } catch (err) {
    alert('Error al devolver')
  }
}

async function devolverTodo(tarjetaId) {
  if (!confirm('¿Devolver todos los materiales y cerrar la tarjeta?')) return
  try {
    await axios.put(`http://127.0.0.1:5000/manto/tarjetas/${tarjetaId}/cerrar`)
    alert('Tarjeta cerrada')
    modalDetalles.value.hide()
    await cargarDatos()
  } catch (err) {
    alert('Error al cerrar')
  }
}

function pendientesDevolucion(tarjetaId) {
  const mats = materialesTarjeta.value[tarjetaId] || []
  return mats.filter(m => !m.devuelto).length
}

function updateTime() {
  const now = new Date()
  horaActual.value = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  fechaActual.value = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  diaActual.value = now.toLocaleDateString('es-MX', { weekday: 'long' })
}

onMounted(async () => {
  await nextTick()

  const elNueva = document.getElementById('modalNuevaTarjeta')
  const elDetalles = document.getElementById('modalDetalles')

  if (elNueva) modalNuevaTarjeta.value = new Modal(elNueva)
  if (elDetalles) modalDetalles.value = new Modal(elDetalles)

  await cargarHorarios()
  await cargarDatos()

  intervalDatos = setInterval(cargarDatos, 30000)
  intervalHorarios = setInterval(cargarHorarios, 60000)

  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (modalNuevaTarjeta.value) {
    modalNuevaTarjeta.value.dispose()
    modalNuevaTarjeta.value = null
  }
  if (modalDetalles.value) {
    modalDetalles.value.dispose()
    modalDetalles.value = null
  }
  clearInterval(intervalDatos)
  clearInterval(intervalHorarios)
  clearInterval(timer)
})
</script>

<style scoped>
.card:hover {
  transform: translateY(-3px);
  transition: all 0.3s ease;
}
.bg-warning-subtle {
  background-color: #fff3cd !important;
}
</style>