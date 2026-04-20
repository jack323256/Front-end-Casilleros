<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid px-3 px-md-4 px-lg-5 py-3 bg-white border-bottom shadow-sm">
      <div class="row align-items-center">
        <div class="col-12 col-md-4 text-start mb-3 mb-md-0">
          <h1 class="fs-2 fw-bold text-primary mb-0">
            <i class="bi bi-camera-fill me-2"></i> Mantenimientos Realizados
          </h1>
        </div>

        <div class="col-12 col-md-4 text-center d-none d-md-block">
          <div class="fs-4 fw-bold text-dark mb-0">{{ horaActual }}</div>
          <div class="fs-6 text-muted">{{ fechaActual }}</div>
        </div>

        <div class="col-12 col-md-4 text-end">
          <button class="btn btn-primary px-4 py-2 shadow-sm fw-bold" @click="abrirModal">
            <i class="bi bi-plus-lg me-2"></i>
            <span>Nuevo Reporte</span>
          </button>
        </div>
      </div>
    </div>

    <div class="container-fluid px-3 px-md-4 px-lg-5 py-4">
      <div class="row g-3 g-md-4">
        <div v-for="ev in evidencias" :key="ev.id" class="col-12 col-md-6 col-lg-4">
          <div class="card shadow-sm h-100 border-0 overflow-hidden" style="border-left: 6px solid #1565C0 !important;">
            <div class="card-header bg-white d-flex justify-content-between align-items-center px-3 py-3">
              <h5 class="mb-0 fw-bold text-dark">{{ ev.titulo }}</h5>
              <span class="badge bg-primary rounded-pill">{{ ev.laboratorio }}</span>
            </div>

            <div class="card-body d-flex flex-column">
              <div class="row g-2 p-2 bg-light rounded border mb-3">
                <div class="col-4">
                  <p class="text-center fw-bold text-muted mb-1" style="font-size: 0.65rem;">ACTUAL</p>
                  <div class="ratio ratio-1x1 shadow-sm rounded overflow-hidden bg-secondary">
                    <img :src="getFullUrl(ev.fotos.actual)" class="object-fit-cover cursor-zoom hover-scale" alt="Estado Actual" @click="abrirVisor(ev, 'actual')">
                  </div>
                </div>

                <div class="col-4">
                  <p class="text-center fw-bold text-muted mb-1" style="font-size: 0.65rem;">PROCESO</p>
                  <div class="ratio ratio-1x1 shadow-sm rounded overflow-hidden bg-secondary">
                    <img :src="getFullUrl(ev.fotos.proceso)" class="object-fit-cover cursor-zoom hover-scale" alt="Proceso" @click="abrirVisor(ev, 'proceso')">
                  </div>
                </div>

                <div class="col-4">
                  <p class="text-center fw-bold text-muted mb-1" style="font-size: 0.65rem;">COMPLETADO</p>
                  <div class="ratio ratio-1x1 shadow-sm rounded overflow-hidden bg-secondary">
                    <img :src="getFullUrl(ev.fotos.completado)" class="object-fit-cover cursor-zoom hover-scale" alt="Finalizado" @click="abrirVisor(ev, 'completado')">
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-2 mb-3">
                <div class="small text-muted fw-bold">
                  <i class="bi bi-person-fill me-1 text-primary"></i> Realizado por: <span class="fw-normal">{{ ev.especialista }}</span>
                </div>
                <div class="small text-muted">
                  <i class="bi bi-calendar-event me-1"></i> {{ ev.fecha }}
                </div>
              </div>

              <div v-if="ev.notas" class="mt-auto mb-3 p-2 bg-light border rounded small text-secondary">
                <i class="bi bi-journal-text me-1"></i> <strong>Notas:</strong> {{ ev.notas }}
              </div>

              <div class="d-flex justify-content-end gap-2 border-top pt-3 mt-auto">
                <button class="btn btn-outline-warning btn-sm px-3" @click="prepararEdicion(ev)">
                  <i class="bi bi-pencil me-1"></i> Editar
                </button>
                <button class="btn btn-outline-danger btn-sm px-3" @click="eliminarEvidencia(ev.id)">
                  <i class="bi bi-trash me-1"></i> Borrar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="evidencias.length === 0" class="col-12 text-center py-5">
          <img src="/logos/Logo_nuevo.png" style="width: 150px; opacity: 0.5;" class="mb-3">
          <p class="text-muted fw-bold">No hay evidencias registradas en el sistema.</p>
        </div>
      </div>
    </div>

    <div v-if="modal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i class="bi me-2" :class="editMode ? 'bi-pencil-square' : 'bi-file-earmark-plus'"></i> 
              {{ editMode ? 'Editar Reporte' : 'Registrar Mantenimiento' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="modal = false"></button>
          </div>
          
          <div class="modal-body p-4">
            <form @submit.prevent="guardar">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Título de la Actividad</label>
                  <input v-model="form.titulo" class="form-control form-control-lg" required>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Laboratorio</label>
                  <select v-model="form.laboratorio" class="form-select" required>
                    <option value="" disabled>Seleccione Laboratorio...</option>
                    <option v-for="lab in labs" :key="lab">{{ lab }}</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Especialista Técnico</label>
                  <input v-model="form.especialista" class="form-control" required>
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold">Área</label>
                  <input v-model="form.area" class="form-control">
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold">Notas de Mantenimiento (Opcional)</label>
                  <textarea v-model="form.notas" class="form-control" rows="2" placeholder="Agrega detalles, refacciones usadas o pendientes..."></textarea>
                </div>

                <div class="col-12 mt-4">
                  <h6 class="fw-bold border-bottom pb-2 mb-3">Captura de Evidencias (Tocar para cambiar)</h6>
                  <div class="row g-3 text-center">
                    <div v-for="tipo in ['actual', 'proceso', 'completado']" :key="tipo" class="col-4">
                      <label class="w-100 cursor-pointer">
                        <span class="d-block mb-2 fw-bold text-primary small" style="text-transform: uppercase;">{{ tipo }}</span>
                        <div class="ratio ratio-1x1 border border-2 border-dashed rounded d-flex align-items-center justify-content-center bg-light shadow-sm preview-hover">
                          <img v-if="previews[tipo]" :src="previews[tipo]" class="img-fluid object-fit-cover rounded">
                          <div v-else class="text-muted d-flex flex-column align-items-center">
                            <i class="bi bi-camera fs-2"></i>
                            <span style="font-size: 0.6rem;">CAPTURAR</span>
                          </div>
                        </div>
                        <input type="file" @change="onFile($event, tipo)" capture="camera" accept="image/*" class="d-none">
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary px-4" @click="modal = false">Cancelar</button>
            <button type="button" class="btn btn-success px-4 fw-bold shadow-sm" @click="guardar" :disabled="loading">
              <i class="bi bi-cloud-arrow-up-fill me-2"></i>
              {{ loading ? 'Enviando...' : (editMode ? 'Actualizar Reporte' : 'Guardar Reporte') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="visor.show" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); z-index: 1060;" @click.self="visor.show = false">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content bg-transparent border-0">
            <div class="modal-header border-0 pb-0 justify-content-end">
              <button type="button" class="btn-close btn-close-white" style="filter: invert(1);" @click="visor.show = false"></button>
            </div>
            <div class="modal-body text-center pt-0">
              <img :src="visor.imgUrl" class="img-fluid rounded shadow-lg mb-4" style="max-height: 70vh; object-fit: contain;">
              
              <div v-if="visor.notas" class="bg-white text-dark p-3 rounded text-start shadow mx-auto" style="max-width: 800px;">
                <h6 class="text-primary fw-bold mb-2"><i class="bi bi-info-circle me-1"></i> Detalles del Mantenimiento</h6>
                <p class="mb-0 small">{{ visor.notas }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 2000;">
      <transition name="toast-slide">
        <div v-if="notificacion.show" class="toast show align-items-center text-white border-0 shadow-lg" :class="notificacion.color" role="alert">
          <div class="d-flex">
            <div class="toast-body fw-bold">
              <i :class="notificacion.icono" class="me-2 fs-5 align-middle"></i>
              {{ notificacion.mensaje }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="notificacion.show = false"></button>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const apiUrl = 'http://localhost:5000';
const evidencias = ref([]);
const modal = ref(false);
const loading = ref(false);
const horaActual = ref('');
const fechaActual = ref('');
let timer = null;

const editMode = ref(false);
const currentId = ref(null);

// Estado para el visor de imágenes
const visor = ref({ show: false, imgUrl: '', notas: '' });

// Estado para las notificaciones (Toasts)
const notificacion = ref({ show: false, mensaje: '', color: 'bg-success', icono: 'bi-check-circle-fill' });

const previews = ref({ actual: null, proceso: null, completado: null });
const labs = [
  "Laboratorio de Automatización", 
  "Laboratorio de Ciencias Básicas", 
  "Laboratorio de Eléctrica", 
  "Laboratorio de Electrónica"
];

const form = ref({
  titulo: '',
  laboratorio: '',
  especialista: 'Carlos Iván Crespo Alvarado',
  area: 'Mantenimiento Industrial',
  notas: '',
  fotos: { actual: null, proceso: null, completado: null }
});

const updateTime = () => {
  const now = new Date();
  horaActual.value = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  fechaActual.value = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
};

// Función para mostrar alertas elegantes
const mostrarNotificacion = (mensaje, tipo = 'success') => {
  notificacion.value = {
    show: true,
    mensaje,
    color: tipo === 'success' ? 'bg-success' : (tipo === 'danger' ? 'bg-danger' : 'bg-warning'),
    icono: tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
  };
  setTimeout(() => { notificacion.value.show = false; }, 4000);
};

// Función para abrir la imagen en grande
const abrirVisor = (ev, tipo) => {
  if (!ev.fotos[tipo]) return;
  visor.value = {
    show: true,
    imgUrl: getFullUrl(ev.fotos[tipo]),
    notas: ev.notas
  };
};

const abrirModal = () => {
  editMode.value = false;
  currentId.value = null;
  form.value.titulo = '';
  form.value.laboratorio = '';
  form.value.especialista = 'Carlos Iván Crespo Alvarado';
  form.value.area = 'Mantenimiento Industrial';
  form.value.notas = '';
  form.value.fotos = { actual: null, proceso: null, completado: null };
  previews.value = { actual: null, proceso: null, completado: null };
  modal.value = true;
};

const onFile = (event, tipo) => {
  const file = event.target.files[0];
  if (file) {
    form.value.fotos[tipo] = file;
    previews.value[tipo] = URL.createObjectURL(file);
  }
};

const getFullUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/150?text=Sin+Foto';
  return path.startsWith('blob:') ? path : `${apiUrl}/uploads/${path}`;
};

const obtenerEvidencias = async () => {
  try {
    const res = await axios.get(`${apiUrl}/manto/evidencias`);
    evidencias.value = res.data;
  } catch (err) { console.error(err); }
};

const prepararEdicion = (ev) => {
  editMode.value = true;
  currentId.value = ev.id;
  
  form.value.titulo = ev.titulo;
  form.value.laboratorio = ev.laboratorio;
  form.value.especialista = ev.especialista;
  form.value.area = ev.area;
  form.value.notas = ev.notas || '';
  
  previews.value.actual = ev.fotos.actual ? getFullUrl(ev.fotos.actual) : null;
  previews.value.proceso = ev.fotos.proceso ? getFullUrl(ev.fotos.proceso) : null;
  previews.value.completado = ev.fotos.completado ? getFullUrl(ev.fotos.completado) : null;
  
  form.value.fotos = { actual: null, proceso: null, completado: null };
  modal.value = true;
};

const guardar = async () => {
  if (!form.value.titulo || !form.value.laboratorio) {
    mostrarNotificacion("Faltan campos obligatorios", "warning");
    return;
  }
  loading.value = true;
  
  const fd = new FormData();
  fd.append('titulo', form.value.titulo);
  fd.append('laboratorio', form.value.laboratorio);
  fd.append('especialista', form.value.especialista);
  fd.append('area', form.value.area);
  fd.append('notas', form.value.notas);
  
  if (form.value.fotos.actual) fd.append('actual', form.value.fotos.actual);
  if (form.value.fotos.proceso) fd.append('proceso', form.value.fotos.proceso);
  if (form.value.fotos.completado) fd.append('completado', form.value.fotos.completado);

  try {
    if (editMode.value) {
      await axios.put(`${apiUrl}/manto/evidencias/${currentId.value}`, fd);
      mostrarNotificacion("Reporte actualizado correctamente");
    } else {
      await axios.post(`${apiUrl}/manto/evidencias`, fd);
      mostrarNotificacion("Reporte guardado correctamente");
    }
    modal.value = false;
    obtenerEvidencias();
  } catch (err) {
    mostrarNotificacion("Error al procesar la solicitud", "danger");
  } finally {
    loading.value = false;
  }
};

const eliminarEvidencia = async (id) => {
  if (!confirm("¿Eliminar este reporte permanentemente?")) return;
  try {
    await axios.delete(`${apiUrl}/manto/evidencias/${id}`);
    obtenerEvidencias();
    mostrarNotificacion("Reporte eliminado", "success");
  } catch (err) { 
    mostrarNotificacion("Error al eliminar", "danger"); 
  }
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  obtenerEvidencias();
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }

/* Efecto al pasar el mouse por las imágenes en las tarjetas */
.cursor-zoom { cursor: zoom-in; }
.hover-scale { transition: transform 0.3s ease; }
.hover-scale:hover { transform: scale(1.05); }

.card { transition: transform 0.2s ease; }
.card:hover { transform: translateY(-3px); }
.border-dashed { border-style: dashed !important; }
.preview-hover:hover { background-color: #e9ecef !important; border-color: #0d6efd !important; }
.object-fit-cover { object-fit: cover; width: 100%; height: 100%; }

/* Animaciones */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateX(100%); }
.toast-slide-leave-to { opacity: 0; transform: translateY(100%); }

@media (max-width: 576px) {
  .modal-dialog { margin: 0.5rem; }
  .fs-2 { font-size: 1.5rem !important; }
}
</style>