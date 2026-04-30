<template>
  <div>

    <!-- Contenido principal con wrapper para escalado -->
    <div class="dashboard-wrapper">
      <div class="dashboard-content">
        <h1 class="text-center mb-4 text-primary fw-bold fs-3 fs-md-2">Dashboard - Estado de Casilleros</h1>

        <!-- Tarjetas de resumen -->
        <div class="row mb-5 text-center g-3">
          <div class="col-6 col-md-3">
            <div class="card text-white bg-primary shadow h-100">
              <div class="card-body py-4">
                <h2 class="display-6 fw-bold mb-1">{{ TOTAL_CASILLEROS }}</h2>
                <p class="mb-0 fs-11">Total de Casilleros</p>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-white bg-success shadow h-100">
              <div class="card-body py-4">
                <h2 class="display-6 fw-bold mb-1">{{ ocupados }}</h2>
                <p class="mb-0 fs-6">Ocupados</p>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-white bg-primary shadow h-100">
              <div class="card-body py-4">
                <h2 class="display-6 fw-bold mb-1">{{ alDia }}</h2>
                <p class="mb-0 fs-6">Al día</p>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-white bg-danger shadow h-100">
              <div class="card-body py-4">
                <h2 class="display-6 fw-bold mb-1">{{ adeudos }}</h2>
                <p class="mb-0 fs-6">Adeudo</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficos superiores (más anchos y altos) -->
        <div class="row mb-5 g-4">
          <div class="col-12 col-lg-6">
            <div class="card shadow h-100">
              <div class="card-header bg-dark text-white">
                <h4 class="mb-0">Disponibilidad General</h4>
              </div>
              <div class="card-body p-2 p-md-4">
                <v-chart 
                  v-if="hasData" 
                  class="chart w-100 h-100" 
                  :option="doughnutOption" 
                  autoresize 
                  :key="chartKey + '-doughnut'"
                ></v-chart>
                <div v-else class="text-center text-muted">Cargando...</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="card shadow h-100">
              <div class="card-header bg-dark text-white">
                <h4 class="mb-0">Estado de Pago y Uso</h4>
              </div>
              <div class="card-body p-2 p-md-4">
                <v-chart 
                  v-if="hasData" 
                  class="chart w-100 h-100" 
                  :option="barOption" 
                  autoresize 
                  :key="chartKey + '-bar'"
                ></v-chart>
                <div v-else class="text-center text-muted">Cargando...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- MAPA DEL PASILLO (más ancho) -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow">
              <div class="card-header bg-dark text-white d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h4 class="mb-0">Mapa del Pasillo de Casilleros</h4>
                <div class="legend d-flex flex-wrap gap-3 justify-content-center">
                  <span class="legend-item small"><i class="dot available"></i> Disponible</span>
                  <span class="legend-item small"><i class="dot paid"></i> Al día</span>
                  <span class="legend-item small"><i class="dot debt"></i> Adeudo</span>
                </div>
              </div>
              <div class="card-body p-2 p-md-4">
                <div class="map-container overflow-auto border rounded">
                  <v-chart
                    v-if="hasData"
                    class="hallway-chart w-100"
                    :option="hallwayOption"
                    autoresize
                    @click="handleCasilleroClick"
                    :key="chartKey + '-hallway'"
                  ></v-chart>
                  <div v-else class="text-center text-muted py-5">
                    <p class="mb-0">Cargando mapa...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón volver -->
        <div class="text-center mt-5 mb-4">
          <button @click="goBack" class="btn btn-secondary px-5 py-2">
            <i class="bi bi-arrow-left me-2"></i> Volver a la Lista
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDICIÓN / NUEVO -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              {{ form.id ? 'Editar' : 'Asignar Nuevo' }} Casillero #{{ form.numero_casillero }}
              <span v-if="form.alumno"> - {{ form.alumno }}</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAssignment">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Alumno *</label>
                  <input v-model="form.alumno" class="form-control" required />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label fw-bold">Cuatrimestre</label>
                  <select v-model.number="form.cuatrimestre" class="form-select" required>
                    <option v-for="n in 11" :value="n" :key="n">
                      {{ n === 6 || n === 11 ? `${n} - Estadia` : n }}
                    </option>
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label fw-bold">Grupo</label>
                  <select v-model="form.grupo" class="form-select" required>
                    <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Tutor</label>
                  <select v-model="form.tutor" class="form-select" required>
                    <option value="">Seleccione un tutor</option>
                    <option>Aparicio Maldonado Jenny</option>
                    <option>Arroyo López Carlos</option>
                    <option>Blas Sánchez Luis Ángel</option>
                    <option>Carbajal Fosado Arely</option>
                    <option>Carrillo Ramírez Juan de Dios</option>
                    <option>Flores Valderrabano Fermín</option>
                    <option>Galindo Mentle Margarita</option>
                    <option>Gómez Paniagua Jorge Armando</option>
                    <option>Licona González Marlon</option>
                    <option>López Pacheco Karla Paola</option>
                    <option>Martínez Martínez Aristides</option>
                    <option>Melo Ortega Óscar</option>
                    <option>Morato González Mariela</option>
                    <option>Pérez Olivares Raúl Arturo</option>
                    <option>Quiroz Rodríguez Adolfo</option>
                    <option>Saavedra Arellano Dennis Abril</option>
                    <option>Valdez Aparicio María Magdalena</option>
                    <option>Vargas Ferrer Juan</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Celular *</label>
                  <input v-model="form.celular" class="form-control" :class="{ 'is-invalid': celularExistente }" required />
                  <div v-if="celularExistente" class="text-danger mt-1 small">
                    <i class="bi bi-exclamation-triangle me-1"></i> Este celular ya está registrado
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Matrícula *</label>
                  <input v-model="form.matricula" class="form-control" :class="{ 'is-invalid': matriculaExistente }" required />
                  <div v-if="matriculaExistente" class="text-danger mt-1 small">
                    <i class="bi bi-exclamation-triangle me-1"></i> Esta matrícula ya está registrada
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Número de Casillero</label>
                  <input v-model.number="form.numero_casillero" type="number" class="form-control" required readonly />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Periodo *</label>
                  <select v-model="form.periodo" class="form-select" required>
                    <option v-for="p in periodosDisponibles" :value="p.value" :key="p.value">{{ p.label }}</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Fecha Préstamo *</label>
                  <input v-model="form.fecha_prestamo" type="date" class="form-control" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">En Uso</label>
                  <select v-model="form.en_uso" class="form-select">
                    <option value="">No</option>
                    <option value="Si">Sí</option>
                  </select>
                </div>

                <div class="col-12 mt-3">
                  <label class="form-label fw-bold">Notas / Observaciones</label>
                  <textarea v-model="form.notas" class="form-control" rows="3" placeholder="Daños, comentarios, etc."></textarea>
                </div>
              </div>

              <!-- Fotos -->
              <div class="row mt-4">
                <div class="col-12 col-md-6">
                  <label class="form-label">Foto Credencial</label>
                  <input type="file" @change="onFileChange($event, 'foto_credencial')" class="form-control" accept="image/*" />
                  <div class="mt-2 text-center">
                    <img v-if="previewCredencial" :src="previewCredencial" class="img-thumbnail rounded" style="max-height: 200px;" />
                   <img v-else-if="form.foto_credencial && typeof form.foto_credencial === 'string'" :src="obtenerUrlImagen(form.foto_credencial)" class="img-thumbnail rounded" style="max-height: 200px;" />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Foto Casillero</label>
                  <input type="file" @change="onFileChange($event, 'foto_casillero')" class="form-control" accept="image/*" />
                  <div class="mt-2 text-center">
                    <img v-if="previewCasillero" :src="previewCasillero" class="img-thumbnail rounded" style="max-height: 200px;" />
                    <img v-else-if="form.foto_casillero && typeof form.foto_casillero === 'string'" :src="obtenerUrlImagen(form.foto_casillero)" class="img-thumbnail rounded" style="max-height: 200px;" />
                  </div>
                </div>
              </div>

              <div class="modal-footer mt-4 d-flex flex-column flex-md-row justify-content-end gap-2">
                <button type="button" class="btn btn-danger" @click="deleteAssignment" v-if="form.id">
                  <i class="bi bi-trash me-2"></i>Eliminar
                </button>
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="hasValidationError">
                  <i class="bi bi-save me-2"></i>{{ form.id ? 'Actualizar' : 'Asignar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { SVGRenderer } from 'echarts/renderers'
import { PieChart, BarChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'

const router = useRouter()
const UPLOAD_URL = 'https://back-end-casilleros.onrender.com/uploads/'
const API_URL = 'https://back-end-casilleros.onrender.com/assignments'

const TOTAL_CASILLEROS = 170
const CASILLEROS_POR_PARED = 85

const assignments = ref([])
const hasData = ref(false)

// Key para forzar re-render de gráficos
const chartKey = ref(0)

// Modal edición/nuevo
const showModal = ref(false)
const form = ref({})
const previewCredencial = ref(null)
const previewCasillero = ref(null)

const currentYear = new Date().getFullYear()
const todayDate = new Date().toISOString().split('T')[0]

const periodosDisponibles = [
  { label: `Enero - Abril ${currentYear}`, value: `Enero - Abril ${currentYear}` },
  { label: `Mayo - Agosto ${currentYear}`, value: `Mayo - Agosto ${currentYear}` },
  { label: `Septiembre - Diciembre ${currentYear}`, value: `Septiembre - Diciembre ${currentYear}` }
]

const ocupados = computed(() => assignments.value.filter(a => a.en_uso === 'Si').length)
const disponibles = computed(() => TOTAL_CASILLEROS - ocupados.value)
const alDia = computed(() => assignments.value.filter(a => isAlDia(a)).length)
const adeudos = computed(() => ocupados.value - alDia.value)

function isAlDia(item) {
  if (!item.fecha_prestamo || !item.periodo) return false
  const fecha = new Date(item.fecha_prestamo)
  const month = fecha.getMonth() + 1
  if (item.periodo.includes('Enero - Abril')) return month >= 1 && month <= 4
  if (item.periodo.includes('Mayo - Agosto')) return month >= 5 && month <= 8
  if (item.periodo.includes('Septiembre - Diciembre')) return month >= 9 && month <= 12
  return false
}

// --- NUEVA FUNCIÓN PARA PROCESAR IMÁGENES ---
const obtenerUrlImagen = (rutaFoto) => {
  if (!rutaFoto) return '';
  if (rutaFoto.startsWith('http://') || rutaFoto.startsWith('https://')) {
    return rutaFoto;
  }
  return UPLOAD_URL + rutaFoto;
};
// --------------------------------------------

// Validaciones
const matriculaExistente = computed(() => {
  if (!form.value.matricula) return false
  return assignments.value.some(a => a.matricula === form.value.matricula && a.id !== form.value.id)
})

const celularExistente = computed(() => {
  if (!form.value.celular) return false
  return assignments.value.some(a => a.celular === form.value.celular && a.id !== form.value.id)
})

const casilleroOcupado = computed(() => {
  if (!form.value.numero_casillero) return false
  return assignments.value.some(a => a.numero_casillero === form.value.numero_casillero && a.id !== form.value.id)
})

const hasValidationError = computed(() => matriculaExistente.value || celularExistente.value || casilleroOcupado.value)

const doughnutOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { orient: 'horizontal', bottom: 10 },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '50%'],
    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
    data: [
      { value: ocupados.value, name: 'Ocupados', itemStyle: { color: '#dc3545' } },
      { value: disponibles.value, name: 'Disponibles', itemStyle: { color: '#28a745' } }
    ]
  }]
}))

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '5%', right: '5%', bottom: '10%', top: '10%' },
  xAxis: { type: 'category', data: ['Al día', 'Adeudo', 'Disponibles'] },
  yAxis: { type: 'value', name: 'Casilleros' },
  series: [{
    type: 'bar',
    barWidth: '60%',
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      color: params => ['#0d6efd', '#dc3545', '#28a745'][params.dataIndex]
    },
    data: [alDia.value, adeudos.value, disponibles.value],
    label: { show: true, position: 'top', fontSize: 16, fontWeight: 'bold' }
  }]
}))

const hallwayOption = computed(() => {
  const data = []
  const occupiedMap = new Map(
    assignments.value
      .filter(a => a.en_uso === 'Si')
      .map(a => [a.numero_casillero, a])
  )

let lockerNum = 1
const maxCols = Math.ceil(CASILLEROS_POR_PARED / 5)  // ← Cambio aquí: 5 en lugar de 4
const columnLabels = Array.from({ length: maxCols }, (_, i) => String.fromCharCode(65 + i))

  // Pared superior
  for (let col = 0; col < maxCols; col++) {
    for (let row = 0; row < 5; row++) {
      if (lockerNum > CASILLEROS_POR_PARED) break
      const item = occupiedMap.get(lockerNum)
      const status = item ? (isAlDia(item) ? 1 : 2) : 0
      const position = `${columnLabels[col]}${row + 1}`

      const tooltipInfo = item
        ? `
          <div style="text-align:center; max-width:260px; padding:8px;">
           ${item.foto_credencial ? `<img src="${obtenerUrlImagen(item.foto_credencial)}" style="width:130px; height:170px; object-fit:cover; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">` : ''}
            <div style="margin-top:10px;">
              <strong style="font-size:1.1em;">${item.alumno}</strong><br>
              Matrícula: ${item.matricula}<br>
              Posición: ${position}<br>
              Estado: ${isAlDia(item) ? 'Al día' : 'Adeudo'}<br>
              ${item.notas ? '<em style="font-size:0.9em;">' + item.notas + '</em>' : ''}
            </div>
          </div>
        `
        : `<strong>Disponible</strong><br>Posición: ${position}<br>#${lockerNum}`

      data.push({ value: [col, row + 1, status, lockerNum, tooltipInfo, item] })

      lockerNum++
    }
  }

  // Pared inferior
  lockerNum = CASILLEROS_POR_PARED + 1
  for (let col = 0; col < maxCols; col++) {
    for (let row = 0; row < 5; row++) {
      if (lockerNum > TOTAL_CASILLEROS) break
      const item = occupiedMap.get(lockerNum)
      const status = item ? (isAlDia(item) ? 1 : 2) : 0
      const position = `${columnLabels[col]}${row + 5}`

      const tooltipInfo = item
        ? `
          <div style="text-align:center; max-width:260px; padding:8px;">
            ${item.foto_credencial ? `<img src="${UPLOAD_URL + item.foto_credencial}" style="width:130px; height:170px; object-fit:cover; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">` : ''}
            <div style="margin-top:10px;">
              <strong style="font-size:1.1em;">${item.alumno}</strong><br>
              Matrícula: ${item.matricula}<br>
              Posición: ${position}<br>
              Estado: ${isAlDia(item) ? 'Al día' : 'Adeudo'}<br>
              ${item.notas ? '<em style="font-size:0.9em;">' + item.notas + '</em>' : ''}
            </div>
          </div>
        `
        : `<strong>Disponible</strong><br>Posición: ${position}<br>#${lockerNum}`

      data.push({ value: [col, row + 7, status, lockerNum, tooltipInfo, item] })

      lockerNum++
    }
  }

  // Tamaño dinámico según pantalla
  const isMobile = window.innerWidth < 768
  const isTablet = window.innerWidth < 992
  const symbolSize = isMobile ? [60, 45] : isTablet ? [75, 55] : [100, 75]

  return {
    tooltip: {
      trigger: 'item',
      formatter: p => p.data.value[4],
      backgroundColor: 'rgba(0,0,0,0.9)',
      textStyle: { color: '#fff' },
      padding: 12
    },
    grid: { top: 60, bottom: 60, left: 80, right: 80 },
    xAxis: {
      type: 'value',
      min: -1,
      max: maxCols + 1,
      axisLabel: { show: true, formatter: v => columnLabels[v] || '', fontSize: isMobile ? 14 : 20, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 11,
      inverse: true,
      axisLabel: { show: true, formatter: v => (v >= 1 && v <= 8) ? v : '', fontSize: isMobile ? 12 : 18, fontWeight: 'bold' }
    },
    series: [{
      type: 'scatter',
      symbol: 'roundRect',
      symbolSize: symbolSize,
      itemStyle: {
        color: p => {
          const s = p.data.value[2]
          if (s === 0) return '#28a745'
          if (s === 1) return '#0d6efd'
          return '#dc3545'
        },
        borderColor: '#fff',
        borderWidth: 3,
        borderRadius: 15,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      label: {
        show: true,
        position: 'inside',
        formatter: p => p.data.value[3],
        color: '#fff',
        fontSize: isMobile ? 10 : 16,
        fontWeight: 'bold'
      },
      data
    }]
  }
})

function handleCasilleroClick(params) {
  if (!params.data) return

  const lockerNum = params.data.value[3]
  const item = params.data.value[5]

  if (item) {
      form.value = {
        ...item,
        notas: item.notas || ''
      }
      // USAR LA NUEVA FUNCIÓN AQUÍ:
      previewCredencial.value = item.foto_credencial ? obtenerUrlImagen(item.foto_credencial) : null
      previewCasillero.value = item.foto_casillero ? obtenerUrlImagen(item.foto_casillero) : null
    } else {
    form.value = {
      id: null,
      alumno: '',
      cuatrimestre: 4,
      grupo: 'A',
      tutor: '',
      celular: '',
      matricula: '',
      numero_casillero: lockerNum,
      periodo: periodosDisponibles[2].value,
      en_uso: 'Si',
      fecha_prestamo: todayDate,
      foto_credencial: null,
      foto_casillero: null,
      notas: ''
    }
    previewCredencial.value = null
    previewCasillero.value = null
  }
  showModal.value = true
}

function onFileChange(e, field) {
  const file = e.target.files[0]
  if (file) {
    form.value[field] = file
    const reader = new FileReader()
    reader.onload = ev => {
      if (field === 'foto_credencial') previewCredencial.value = ev.target.result
      else previewCasillero.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function saveAssignment() {
  if (hasValidationError.value) {
    toast.error('Corrige los datos duplicados antes de guardar')
    return
  }

  const formData = new FormData()
  Object.keys(form.value).forEach(key => {
    if (form.value[key] !== null && form.value[key] !== undefined && form.value[key] !== '') {
      formData.append(key, form.value[key])
    }
  })

  try {
    if (form.value.id) {
      await axios.put(`${API_URL}/${form.value.id}`, formData)
      toast.success('Actualizado correctamente')
    } else {
      await axios.post(API_URL, formData)
      toast.success('Asignado correctamente')
    }
    await loadData()
    chartKey.value++
    closeModal()
  } catch (err) {
    console.error('Error al guardar:', err.response || err)
    toast.error('Error al guardar. Revisa los datos o conexión.')
  }
}

async function deleteAssignment() {
  if (!confirm('¿Seguro que quieres eliminar esta asignación?')) return
  try {
    await axios.delete(`${API_URL}/${form.value.id}`)
    toast.success('Eliminado')
    await loadData()
    chartKey.value++
    closeModal()
  } catch (err) {
    toast.error('Error al eliminar')
  }
}

function closeModal() {
  showModal.value = false
  form.value = {}
  previewCredencial.value = null
  previewCasillero.value = null
}

async function loadData() {
  hasData.value = false
  try {
    const res = await axios.get(API_URL)
    assignments.value = res.data || []
    hasData.value = true
  } catch (err) {
    toast.error('Error al cargar datos del dashboard')
    hasData.value = false
  }
}

function goBack() {
  router.push('/')
}

function closeNavbar() {
  const navbarCollapse = document.getElementById('navbarNav')
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false })
    bsCollapse.hide()
  }
}

onMounted(() => loadData())

use([
  CanvasRenderer,
  SVGRenderer,
  PieChart,
  BarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])
</script>

<style scoped>
/* Wrapper para centrar y escalado */
.dashboard-wrapper {
  max-width: 2000px;
  margin: 1;
}

/* Contenido escalado en desktop */
.dashboard-content {
  padding: 5px 5px; /* Márgenes laterales mínimos */
}

/* Escalado suave en desktop grande (zoom ~75%) */
@media (min-width: 1500px) {
  .dashboard-content {
    transform: scale(0.70);
    transform-origin: top center;
  }
}

/* Laptop normal: escala un poco menos */
@media (min-width: 1000px) and (max-width: 1500px) {
  .dashboard-content {
    transform: scale(0.75);
    transform-origin: top center;
  }
}

/* Móvil: sin escalado */
@media (max-width: 991px) {
  .dashboard-content {
    transform: none;
    padding: 20px;
  }
}

/* Navbar siempre normal */
.navbar.fixed-top {
  transform: none !important;
}

/* Gráficos usan más espacio */
.chart {
  height: 400px !important;
  width: 100% !important;
}

.hallway-chart {
  height: 950px !important;
  width: 3400px !important; /* Más ancho para aprovechar el espacio escalado */
}

.map-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Responsividad del mapa */
@media (max-width: 1200px) {
  .hallway-chart { width: 2800px !important; }
}
@media (max-width: 992px) {
  .hallway-chart { width: 2200px !important; height: 1000px !important; }
}
@media (max-width: 768px) {
  .hallway-chart { width: 1400px !important; height: 650px !important; }
  .chart { height: 300px !important; }
}

.legend { 
  font-size: 0.95rem; 
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}
.dot.available { background-color: #28a745; }
.dot.paid { background-color: #0d6efd; }
.dot.debt { background-color: #dc3545; }
</style>
