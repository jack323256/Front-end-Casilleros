<!-- src/views/Bitacora.vue -->
<template>
  <div class="">
    <!-- Título principal con icono correctamente -->
    <h1 class="text-center mb-5 text-primary fw-bold fs-3 d-flex align-items-center justify-content-center gap-3 flex-wrap">
      <i class="bi bi-journal-text fs-1"></i>
      <span>Bitácora de Cambios</span>
    </h1>

    <div class="card shadow">
      <div class="card-body">
        <!-- Búsqueda -->
        <div class="mb-4">
          <input 
            v-model="search" 
            type="text" 
            class="form-control" 
            placeholder="Buscar por alumno, matrícula, casillero, tutor o acción..." 
          />
        </div>

        <!-- Tabla principal -->
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>Fecha y Hora</th>
                <th>Operación</th>
                <th>Casillero</th>
                <th>Alumno</th>
                <th>Matrícula</th>
                <th>Tutor</th>
                <th>Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginatedLogs" :key="log.id_bitacora" class="cursor-pointer" @click="openAlumnoModal(log)">
                <td class="small">{{ formatDate(log.fecha_hora) }}</td>
                <td>
                  <span class="badge fs-6" :class="getOperationClass(log.operacion)">
                    {{ getOperationText(log.operacion) }}
                  </span>
                </td>
                <td><strong>#{{ getCasillero(log) }}</strong></td>
                <td class="fw-bold text-primary">{{ getAlumnoDisplay(log) }}</td>
                <td>{{ getMatriculaDisplay(log) }}</td>
                <td>{{ getTutorDisplay(log) }}</td>
                <td class="small">{{ log.usuario || 'Sistema' }}</td>
              </tr>
              <tr v-if="filteredLogs.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                  No hay registros en la bitácora
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">Anterior</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- MODAL DE DETALLE POR ALUMNO -->
    <div v-if="showAlumnoModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-person-badge me-2"></i>
              Historial de {{ selectedAlumno }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showAlumnoModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- Tarjeta del alumno -->
            <div class="card mb-4 border-0 shadow-sm">
              <div class="card-body text-center">
                <img 
                  v-if="currentFotoCredencial" 
                  :src="currentFotoCredencial" 
                  class="rounded shadow" 
                  style="width: 180px; height: 220px; object-fit: cover;"
                />
                <div v-else class="bg-light rounded d-inline-block p-5 mb-3">
                  <i class="bi bi-person-circle fs-1 text-muted"></i>
                </div>
                <h4 class="mt-3">{{ selectedAlumno || 'Sin nombre' }}</h4>
                <p class="text-muted">Matrícula: <strong>{{ selectedMatricula || '—' }}</strong></p>
                <div class="row text-start mt-4">
                  <div class="col-md-6">
                    <p><strong>Casillero:</strong> #{{ selectedCasillero || '—' }}</p>
                    <p><strong>Cuatrimestre:</strong> {{ selectedCuatrimestre || '—' }}</p>
                    <p><strong>Grupo:</strong> {{ selectedGrupo || '—' }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Tutor:</strong> {{ selectedTutor || '—' }}</p>
                    <p><strong>Celular:</strong> {{ selectedCelular || '—' }}</p>
                    <p><strong>En uso:</strong> <span class="badge" :class="selectedEnUso === 'Si' ? 'bg-primary' : 'bg-warning'">{{ selectedEnUso || 'No' }}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Historial de cambios del alumno -->
            <h5 class="mb-3"><i class="bi bi-clock-history me-2"></i>Historial de movimientos</h5>
            <div class="table-responsive">
              <table class="table table-sm table-striped">
                <thead class="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Operación</th>
                    <th>Detalles</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="hist in alumnoHistory" :key="hist.id_bitacora">
                    <td class="small">{{ formatDate(hist.fecha_hora) }}</td>
                    <td>
                      <span class="badge" :class="getOperationClass(hist.operacion)">
                        {{ getOperationText(hist.operacion) }}
                      </span>
                    </td>
                    <td>
                      <small>
                        <span v-if="hist.operacion === 'INSERT'">Creación del registro</span>
                        <span v-if="hist.operacion === 'DELETE'">Eliminación del registro</span>
                        <span v-if="hist.operacion === 'UPDATE'">
                          Cambio en: <strong>{{ getChangedField(hist) }}</strong>
                          <br>
                          {{ getBeforeAfter(hist) }}
                        </span>
                      </small>
                    </td>
                    <td class="small">{{ hist.usuario || 'Sistema' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAlumnoModal = false">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const API_URL = '/bitacora'
const UPLOAD_URL = '/uploads/'

const logs = ref([])
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Modal de detalle
const showAlumnoModal = ref(false)
const selectedAlumno = ref('')
const selectedMatricula = ref('')
const selectedCasillero = ref('')
const selectedTutor = ref('')
const selectedCuatrimestre = ref('')
const selectedGrupo = ref('')
const selectedCelular = ref('')
const selectedEnUso = ref('')
const currentFotoCredencial = ref('')
const alumnoHistory = ref([])

async function loadLogs() {
  try {
    const res = await axios.get(API_URL)
    logs.value = res.data || []
  } catch (err) {
    toast.error('Error al cargar la bitácora')
    console.error(err)
  }
}

const filteredLogs = computed(() => {
  if (!search.value.trim()) return logs.value
  const s = search.value.toLowerCase()
  return logs.value.filter(log => {
    const alumno = (log.alumno_nuevo || log.alumno_antiguo || '').toLowerCase()
    const matricula = (log.matricula_nueva || log.matricula_antigua || '').toLowerCase()
    const casillero = (log.numero_casillero_nuevo || log.numero_casillero_antiguo || '').toString()
    const tutor = (log.tutor_nuevo || log.tutor_antiguo || '').toLowerCase()
    const operacion = getOperationText(log.operacion || '').toLowerCase()
    return alumno.includes(s) || matricula.includes(s) || casillero.includes(s) || tutor.includes(s) || operacion.includes(s)
  })
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage))
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredLogs.value.slice(start, start + itemsPerPage)
})

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getOperationText(op) {
  if (!op) return 'Desconocida'
  const trimmed = op.trim().toUpperCase()
  if (trimmed === 'INSERT') return 'Creación'
  if (trimmed === 'UPDATE') return 'Actualización'
  if (trimmed === 'DELETE') return 'Eliminación'
  return trimmed
}

function getOperationClass(op) {
  if (!op) return 'bg-secondary'
  const trimmed = op.trim().toUpperCase()
  if (trimmed === 'INSERT') return 'bg-success'
  if (trimmed === 'UPDATE') return 'bg-info'
  if (trimmed === 'DELETE') return 'bg-danger'
  return 'bg-secondary'
}

function getCasillero(log) {
  return log.numero_casillero_nuevo ?? log.numero_casillero_antiguo ?? '—'
}

function getAlumnoDisplay(log) {
  const nuevo = log.alumno_nuevo || log.alumno_antiguo || '—'
  return nuevo
}

function getMatriculaDisplay(log) {
  return log.matricula_nueva ?? log.matricula_antigua ?? '—'
}

function getTutorDisplay(log) {
  const antiguo = log.tutor_antiguo
  const nuevo = log.tutor_nuevo
  if (antiguo !== nuevo && (antiguo || nuevo)) {
    return `${antiguo || '—'} → ${nuevo || '—'}`
  }
  return nuevo || antiguo || '—'
}

function getChangeSummary(log) {
  const op = getOperationText(log.operacion)
  if (op === 'Creación') return 'Registro creado'
  if (op === 'Eliminación') return 'Registro eliminado'
  return 'Datos modificados'
}

function getChangedField(log) {
  if (log.tutor_antiguo !== log.tutor_nuevo) return 'Tutor'
  if (log.alumno_antiguo !== log.alumno_nuevo) return 'Alumno'
  if (log.matricula_antigua !== log.matricula_nueva) return 'Matrícula'
  if (log.cuatrimestre_antiguo !== log.cuatrimestre_nuevo) return 'Cuatrimestre'
  if (log.grupo_antiguo !== log.grupo_nuevo) return 'Grupo'
  if (log.celular_antiguo !== log.celular_nuevo) return 'Celular'
  if (log.fecha_prestamo_antigua !== log.fecha_prestamo_nueva) return 'Fecha préstamo'
  if (log.en_uso_antiguo !== log.en_uso_nuevo) return 'En uso'
  return 'Otros'
}

function getBeforeAfter(log) {
  if (log.tutor_antiguo !== log.tutor_nuevo) return `${log.tutor_antiguo || '—'} → ${log.tutor_nuevo || '—'}`
  if (log.alumno_antiguo !== log.alumno_nuevo) return `${log.alumno_antiguo || '—'} → ${log.alumno_nuevo || '—'}`
  if (log.matricula_antigua !== log.matricula_nueva) return `${log.matricula_antigua || '—'} → ${log.matricula_nueva || '—'}`
  return ''
}

// Abrir modal con historial del alumno
function openAlumnoModal(log) {
  const matricula = log.matricula_nueva || log.matricula_antigua
  if (!matricula) return

  // Buscar todos los logs del mismo alumno (por matrícula)
  alumnoHistory.value = logs.value
    .filter(l => (l.matricula_nueva || l.matricula_antigua) === matricula)
    .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))

  // Datos actuales (del registro más reciente)
  const latest = alumnoHistory.value[0] || log
  selectedAlumno.value = latest.alumno_nuevo || latest.alumno_antiguo || '—'
  selectedMatricula.value = matricula
  selectedCasillero.value = getCasillero(latest)
  selectedTutor.value = latest.tutor_nuevo || latest.tutor_antiguo || '—'
  selectedCuatrimestre.value = latest.cuatrimestre_nuevo || latest.cuatrimestre_antiguo || '—'
  selectedGrupo.value = latest.grupo_nuevo || latest.grupo_antiguo || '—'
  selectedCelular.value = latest.celular_nuevo || latest.celular_antiguo || '—'
  selectedEnUso.value = latest.en_uso_nuevo || latest.en_uso_antiguo || 'No'

  // Foto (si existe en algún registro)
  currentFotoCredencial.value = latest.foto_credencial_nueva || latest.foto_credencial_antigua
    ? UPLOAD_URL + (latest.foto_credencial_nueva || latest.foto_credencial_antigua)
    : null

  showAlumnoModal.value = true
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  background-color: #f8f9fa;
}
</style>