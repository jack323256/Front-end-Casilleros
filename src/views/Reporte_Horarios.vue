<template>
  <div class="reporte-bg min-vh-100 pb-4">
    
    <div class="container-fluid py-2 bg-white shadow-sm mb-3 no-print border-bottom">
      <div class="row align-items-center px-lg-4">
        <div class="col-md-2">
          <button class="btn btn-sm btn-outline-secondary fw-bold" @click="$router.back()">
            <i class="bi bi-arrow-left me-1"></i> Volver
          </button>
        </div>

        <div class="col-md-3">
          <div class="btn-group w-100 shadow-sm">
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'individual' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'individual'">Individual</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'matriz' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'matriz'">Matriz General</button>
          </div>
        </div>

        <div class="col-md-4 d-flex gap-2 justify-content-center">
          <template v-if="vistaActiva === 'individual'">
            <select v-model="espacioSeleccionado" class="form-select form-select-sm border-primary w-auto fw-bold">
              <optgroup label="Laboratorios">
                <option v-for="lab in laboratoriosList" :key="lab" :value="lab">{{ lab }}</option>
              </optgroup>
              <optgroup label="Aulas Docencia">
                <option v-for="aula in aulasList" :key="aula" :value="aula">{{ aula }}</option>
              </optgroup>
            </select>
          </template>

          <template v-else>
            <select v-model="diaMatriz" class="form-select form-select-sm border-success w-auto fw-bold">
              <option v-for="dia in diasList" :key="dia" :value="dia">{{ dia }}</option>
            </select>
          </template>
        </div>

        <div class="col-md-3 text-end">
          <button v-if="vistaActiva === 'individual'" class="btn btn-sm btn-danger shadow-sm fw-bold px-3" @click="imprimirPDF">
            <i class="bi bi-printer-fill me-1"></i> Imprimir PDF
          </button>
          <button v-else class="btn btn-sm btn-success shadow-sm fw-bold px-3" @click="exportarExcel">
            <i class="bi bi-file-earmark-excel-fill me-1"></i> Descargar Excel
          </button>
        </div>
      </div>
    </div>

    <div v-if="vistaActiva === 'individual'" class="hoja-horizontal shadow">
      <header class="d-flex justify-content-between align-items-start w-100 mb-1">
        <div class="d-flex flex-column align-items-start">
          <div class="barra-verde shadow-sm">
            <h2 class="fw-bold fst-italic m-0 text-white" style="font-size: 1.1rem;">Academia de Mantenimiento Industrial</h2>
          </div>
          <h1 class="texto-dorado fw-bold fst-italic mt-1" style="margin-left: 1.5rem; font-size: 1.6rem;">{{ espacioSeleccionado }}</h1>
        </div>
        <img src="/logos/logo-mantenimiento.png" alt="Mascota" class="logo-top" @error="fallbackLogo">
      </header>

      <div class="table-container">
        <table class="table table-bordered border-dark text-center horario-table align-middle m-0">
          <thead>
            <tr>
              <th class="header-verde" style="width: 11%;">HORARIO</th>
              <th class="header-verde" v-for="dia in diasList" :key="dia">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in matrizHorario" :key="row.bloque.inicio">
              <tr v-if="row.bloque.tipo === 'receso'" class="fila-receso">
                <td class="fw-bold bg-hora text-dark">{{ row.bloque.inicio }} a {{ row.bloque.fin }}</td>
                <td colspan="5" class="bg-receso text-dark fw-bold" style="letter-spacing: 5px;">RECESO</td>
              </tr>
              <tr v-else>
                <td class="fw-bold bg-hora text-dark">{{ row.bloque.inicio }} a {{ row.bloque.fin }}</td>
                <template v-for="dia in diasList" :key="dia">
                  <td v-if="row.celdas[dia].render" 
                      :rowspan="row.celdas[dia].rowspan"
                      class="celda-clase"
                      :class="{ 'has-class': row.celdas[dia].clase }"
                      @click="abrirDetalle(row.celdas[dia].clase)">
                    <div v-if="row.celdas[dia].clase" class="clase-info">
                      <div class="texto-grupo-color" :style="{ color: getColorForGrupo(row.celdas[dia].clase.grupo) }">
                        {{ row.celdas[dia].clase.grupo }}
                      </div>
                      <div class="text-dark fs-docente lh-1 mt-1">{{ row.celdas[dia].clase.docente }}</div>
                      <div class="fw-bold text-dark fs-materia text-uppercase lh-1 mt-1">{{ row.celdas[dia].clase.materia }}</div>
                    </div>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <footer class="d-flex justify-content-between align-items-end mt-1 pt-1 w-100">
        <h3 class="fw-bold fst-italic texto-verde-oscuro m-0 pb-1" style="font-size: 1.1rem;">HORARIO ESCOLAR ENERO-ABRIL 2026</h3>
        <img src="/logos/Logo_nuevo.png" alt="UTXJ" class="logo-bottom" @error="fallbackLogo">
      </footer>
    </div>

    <div v-else class="matriz-general-container shadow bg-white p-4 mx-auto border border-2 border-dark">
      <div class="text-center mb-4">
        <h2 class="fw-bold text-dark mb-0">MATRIZ DE ESPACIOS - {{ diaMatriz.toUpperCase() }}</h2>
        <p class="fw-bold text-primary mb-0">MANTENIMIENTO INDUSTRIAL Y PETRÓLEO</p>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered border-dark text-center align-middle matriz-table">
          <thead>
            <tr class="bg-dark text-white">
              <th rowspan="2" class="align-middle" style="width: 100px;">HORA</th>
              <th colspan="7" class="bg-primary text-white py-1">EDIFICIO PESADO 1 y 2</th>
              <th colspan="6" class="bg-info text-dark py-1">DOCENCIA III (PB)</th>
            </tr>
            <tr class="bg-light">
              <th v-for="lab in laboratoriosList" :key="lab" class="th-matriz">{{ lab.split(' - ')[0] }}</th>
              <th v-for="aula in aulasList.slice(0,6)" :key="aula" class="th-matriz">{{ aula.split(' ')[1] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bloque in bloquesHorarios" :key="bloque.inicio">
              <td class="fw-bold bg-light small">{{ bloque.inicio }} - {{ bloque.fin }}</td>
              
              <td v-for="espacio in [...laboratoriosList, ...aulasList.slice(0,6)]" :key="espacio" 
                  class="celda-matriz" :class="{'bg-receso-matriz': bloque.tipo === 'receso'}">
                <template v-if="bloque.tipo === 'receso'">RECESO</template>
                <div v-else v-for="clase in buscarClaseMatriz(diaMatriz, espacio, bloque.inicio)" :key="clase.id">
                  <div class="fw-bold" :style="{ color: getColorForGrupo(clase.grupo) }">{{ clase.grupo }}</div>
                  <div class="x-small-matriz text-dark">{{ clase.materia }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modalVisible" class="modal fade show d-block no-print" tabindex="-1" style="background: rgba(0,0,0,0.6);" @click.self="modalVisible = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 overflow-hidden">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title fw-bold"><i class="bi bi-info-circle-fill me-2"></i> Detalles de la Asignación</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalVisible = false"></button>
          </div>
          <div class="modal-body p-4 text-center bg-white">
            <h4 class="fw-bold text-primary text-uppercase mb-1">{{ claseSeleccionada.materia }}</h4>
            <div class="fw-bold fs-5 mb-4" :style="{ color: getColorForGrupo(claseSeleccionada.grupo) }">Grupo: {{ claseSeleccionada.grupo }}</div>
            <div class="card bg-light border-0 text-start p-3 mb-0 shadow-sm">
              <div class="d-flex align-items-center justify-content-center mb-3 pb-3 border-bottom text-center flex-column">
                <img :src="fotoDocente(claseSeleccionada.docente) || '/logos/default-docente.png'" @error="$event.target.src = '/logos/default-docente.png'"
                  class="rounded-circle shadow bg-white mb-2" style="width: 120px; height: 120px; object-fit: cover; border: 4px solid white;">
                <div>
                  <div class="text-muted small fw-bold text-uppercase mb-1">Docente Asignado</div>
                  <div class="fw-bold text-dark fs-5 lh-1">{{ claseSeleccionada.docente }}</div>
                </div>
              </div>
              <div class="ps-3">
                <p class="mb-2"><i class="bi bi-clock-fill text-warning me-2 fs-5 align-middle"></i> <strong>Horario:</strong> {{ claseSeleccionada.horaInicio }} a {{ claseSeleccionada.horaFin }} hrs</p>
                <p class="mb-0"><i class="bi bi-door-open-fill text-success me-2 fs-5 align-middle"></i> <strong>Lugar:</strong> {{ claseSeleccionada.laboratorio }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary w-100 fw-bold" @click="modalVisible = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import * as XLSX from 'xlsx'; // Importación de la librería

const route = useRoute();
const API_URL = 'http://localhost:5000/horarios';
const horarios = ref([]);

// CONTROL DE VISTAS
const vistaActiva = ref('individual');
const diaMatriz = ref('Lunes');

const laboratoriosList = [
  'Lab de Automatización - Pesado I', 'Lab Eléctrica - Pesado I', 'Lab Electrónica - Pesado I', 
  'Lab de Ciencias Básicas - Pesado I', 'Lab Manufactura - Pesado I', 'Lab Metrología - Pesado II', 'Cómputo III - Docencia II'
];
const aulasList = [
  'AU 106 Docencia III', 'AU 107 Docencia III', 'AU 108 Docencia III', 
  'AU 109 Docencia III', 'AU 110 Docencia III', 'AU 111 Docencia III', 
  'AU 406 Docencia IV', 'AU 407 Docencia IV', 'AU 408 Docencia IV'
];

const espacioSeleccionado = ref(laboratoriosList[0]);
const diasList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const modalVisible = ref(false);
const claseSeleccionada = ref(null);

const bloquesHorarios = [
  { inicio: '07:00', fin: '08:00', tipo: 'clase' },
  { inicio: '08:00', fin: '09:00', tipo: 'clase' },
  { inicio: '09:00', fin: '10:00', tipo: 'clase' },
  { inicio: '10:00', fin: '11:00', tipo: 'clase' },
  { inicio: '11:00', fin: '12:00', tipo: 'clase' },
  { inicio: '12:00', fin: '12:30', tipo: 'receso' },
  { inicio: '12:30', fin: '13:30', tipo: 'clase' },
  { inicio: '13:30', fin: '14:30', tipo: 'clase' },
  { inicio: '14:30', fin: '15:30', tipo: 'clase' },
  { inicio: '15:30', fin: '16:30', tipo: 'clase' },
  { inicio: '16:30', fin: '17:30', tipo: 'clase' },
  { inicio: '17:30', fin: '18:30', tipo: 'clase' },
  { inicio: '18:30', fin: '19:30', tipo: 'clase' },
  { inicio: '19:30', fin: '20:30', tipo: 'clase' }
];

// --- LOGICA DE EXCEL ---
const exportarExcel = () => {
  const encabezadoSuperior = ["HORA", "EDIFICIO PESADO 1 y 2", "", "", "", "", "", "", "DOCENCIA III (PB)"];
  const encabezadoEspacios = ["", ...laboratoriosList, ...aulasList.slice(0, 6)];

  const cuerpoMatriz = bloquesHorarios.map(b => {
    const fila = [ `${b.inicio} - ${b.fin}` ];
    const todosLosEspacios = [...laboratoriosList, ...aulasList.slice(0, 6)];
    
    todosLosEspacios.forEach(espacio => {
      if (b.tipo === 'receso') {
        fila.push("RECESO");
      } else {
        const clases = buscarClaseMatriz(diaMatriz.value, espacio, b.inicio);
        fila.push(clases.length > 0 ? `${clases[0].grupo} - ${clases[0].materia}` : "");
      }
    });
    return fila;
  });

  const ws = XLSX.utils.aoa_to_sheet([encabezadoSuperior, encabezadoEspacios, ...cuerpoMatriz]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Matriz");
  XLSX.writeFile(wb, `Matriz_Espacios_${diaMatriz.value}.xlsx`);
};

const buscarClaseMatriz = (dia, espacio, inicio) => {
  return horarios.value.filter(c => c.dia === dia && c.laboratorio === espacio && c.horaInicio <= inicio && c.horaFin > inicio);
};

// --- LOGICA EXISTENTE ---
const paletaColores = ['#1565C0', '#00695C', '#7B1FA2', '#D84315', '#C62828', '#283593', '#2E7D32', '#4E342E', '#37474F', '#AD1457', '#0277BD', '#4527A0'];

const getColorForGrupo = (grupo) => {
  if (!grupo) return '#444444';
  let hash = 0;
  for (let i = 0; i < grupo.length; i++) hash = grupo.charCodeAt(i) + ((hash << 5) - hash);
  return paletaColores[Math.abs(hash) % paletaColores.length];
};

const fotoDocente = (nombreDocente) => {
  if (!nombreDocente) return null;
  const nombreArchivo = nombreDocente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_') + '.png';
  return `/maestros_manto/${nombreArchivo}`;
};

const loadHorarios = async () => {
  try {
    const res = await axios.get(API_URL);
    horarios.value = res.data;
  } catch (err) { console.error(err); }
};

const matrizHorario = computed(() => {
  const matrix = [];
  for (let r = 0; r < bloquesHorarios.length; r++) {
    const bloque = bloquesHorarios[r];
    const row = { bloque, celdas: {} };
    if (bloque.tipo !== 'receso') {
      for (const dia of diasList) {
        const claseInicio = horarios.value.find(c => c.dia === dia && c.laboratorio === espacioSeleccionado.value && c.horaInicio === bloque.inicio);
        if (claseInicio) {
          let rowspan = 1;
          for (let nextR = r + 1; nextR < bloquesHorarios.length; nextR++) {
            if (bloquesHorarios[nextR].tipo !== 'receso' && bloquesHorarios[nextR].inicio < claseInicio.horaFin) rowspan++;
            else break;
          }
          row.celdas[dia] = { render: true, rowspan, clase: claseInicio };
        } else {
          const claseAnterior = horarios.value.find(c => c.dia === dia && c.laboratorio === espacioSeleccionado.value && c.horaInicio < bloque.inicio && c.horaFin > bloque.inicio);
          row.celdas[dia] = claseAnterior ? { render: false } : { render: true, rowspan: 1, clase: null };
        }
      }
    }
    matrix.push(row);
  }
  return matrix;
});

const abrirDetalle = (clase) => { if (clase) { claseSeleccionada.value = clase; modalVisible.value = true; } };
const imprimirPDF = () => { window.print(); };
const fallbackLogo = (e) => { e.target.src = 'https://via.placeholder.com/150?text=Logo'; };

onMounted(() => {
  if (route.query.espacio) espacioSeleccionado.value = route.query.espacio;
  loadHorarios();
});
</script>

<style scoped>
/* TU CSS ORIGINAL SE MANTIENE INTACTO */
.reporte-bg { background-color: #555; }
:root { --verde-utxj: #005b4f; --dorado-utxj: #b58c2a; }
.hoja-horizontal { background: white; width: 27.94cm; height: 21.59cm; margin: 0 auto; box-sizing: border-box; padding: 6mm 10mm; display: flex; flex-direction: column; overflow: hidden; }
.barra-verde { background-color: #005b4f; padding: 4px 20px 4px 15px; border-radius: 0 20px 20px 0; margin-left: -10mm; }
.texto-dorado { color: #b58c2a; letter-spacing: -1px; }
.logo-top { height: 55px; object-fit: contain; }
.table-container { flex-grow: 1; display: flex; flex-direction: column; margin-top: 2px; min-height: 0; }
.horario-table { height: 100%; border: 2px solid black !important; table-layout: fixed; margin-bottom: 0 !important; }
.horario-table th, .horario-table td { border: 1px solid black !important; padding: 2px !important; }
.header-verde { background-color: #005b4f !important; color: white !important; font-size: 0.75rem; text-transform: uppercase; padding: 4px !important; }
.bg-hora { background-color: #cfd8dc !important; font-size: 0.65rem; width: 85px;}
.bg-receso { background-color: #e0e0e0 !important; font-size: 0.85rem; }
.celda-clase { vertical-align: middle; overflow: hidden; transition: background-color 0.2s ease, transform 0.1s ease; }
.has-class { cursor: pointer; }
.has-class:hover { background-color: #e2e8f0 !important; box-shadow: inset 0 0 10px rgba(0,0,0,0.1); }
.clases-wrapper { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; }
.clase-info { text-align: center; line-height: 1.1; padding: 2px 0; width: 100%; }
.texto-grupo-color { font-size: 0.85rem; font-weight: 900; margin-bottom: 2px; letter-spacing: 0.5px; }
.fs-docente { font-size: 0.7rem; color: #222; margin-bottom: 2px; font-weight: 500;}
.fs-materia { font-size: 0.75rem; color: #005b4f; }
.texto-verde-oscuro { color: #005b4f; letter-spacing: -0.5px; }
.logo-bottom { height: 45px; object-fit: contain; }

/* CSS NUEVO PARA LA MATRIZ */
.matriz-general-container { width: 98%; max-width: 1500px; min-height: 85vh; border-radius: 8px; }
.matriz-table { table-layout: fixed; font-size: 0.55rem; }
.th-matriz { font-size: 0.5rem; padding: 2px !important; background: #f8f9fa; }
.celda-matriz { height: 40px; padding: 1px !important; line-height: 1.1; word-wrap: break-word; }
.x-small-matriz { font-size: 0.45rem; color: #555; }
.bg-receso-matriz { background-color: #eee !important; color: #999; font-weight: bold; font-size: 0.5rem; }

@media print {
  @page { size: letter landscape; margin: 0; }
  body, html { margin: 0 !important; padding: 0 !important; background: white !important; }
  .no-print { display: none !important; }
  .hoja-horizontal { width: 100vw !important; height: 100vh !important; margin: 0 !important; border: none !important; box-shadow: none !important; padding: 5mm 10mm !important; page-break-after: avoid; page-break-before: avoid; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>