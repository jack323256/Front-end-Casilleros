<template>
  <div class="reporte-bg min-vh-100 pb-4">
    <!-- BARRA DE CONTROL SUPERIOR (RESPONSIVA Y NO IMPRIMIBLE) -->
    <div class="container-fluid py-2 bg-white shadow-sm mb-3 no-print border-bottom">
      <div class="row g-2 align-items-center px-lg-4">
        <div class="col-6 col-md-2">
          <button class="btn btn-sm btn-outline-secondary fw-bold w-100" @click="$router.back()">
            <i class="bi bi-arrow-left me-1"></i> Volver
          </button>
        </div>

        <div class="col-12 col-md-4 order-3 order-md-2">
          <div class="btn-group w-100 shadow-sm overflow-auto">
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'individual' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'individual'">Individual</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'grupo' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'grupo'">Grupo</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'maestro' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'maestro'">Maestro</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'matriz' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'matriz'">Matriz General</button>
          </div>
        </div>

        <div class="col-12 col-md-3 order-4 order-md-3">
          <template v-if="vistaActiva === 'individual'">
            <select v-model="espacioSeleccionado" class="form-select form-select-sm border-primary fw-bold">
              <optgroup label="Laboratorios"><option v-for="lab in laboratoriosList" :key="lab" :value="lab">{{ lab }}</option></optgroup>
              <optgroup label="Aulas"><option v-for="aula in aulasList" :key="aula" :value="aula">{{ aula }}</option></optgroup>
            </select>
          </template>
          <template v-else-if="vistaActiva === 'grupo'">
            <select v-model="grupoSeleccionado" class="form-select form-select-sm border-warning fw-bold">
              <option v-for="grupo in gruposList" :key="grupo" :value="grupo">{{ grupo }}</option>
            </select>
          </template>
          <template v-else-if="vistaActiva === 'maestro'">
            <select v-model="maestroSeleccionado" class="form-select form-select-sm border-info fw-bold">
              <option v-for="m in maestrosList" :key="m" :value="m">{{ m }}</option>
            </select>
          </template>
          <template v-else>
            <select v-model="diaMatriz" class="form-select form-select-sm border-success fw-bold">
              <option v-for="dia in diasList" :key="dia" :value="dia">{{ dia }}</option>
            </select>
          </template>
        </div>

        <div class="col-6 col-md-3 text-end order-2 order-md-4">
          <div class="d-flex gap-1 justify-content-end">
             <button v-if="vistaActiva !== 'matriz'" class="btn btn-sm btn-danger px-3 shadow-sm" title="Imprimir PDF" @click="imprimirPDF"><i class="bi bi-printer-fill"></i></button>
             
             <!-- DESPLEGABLE DE DESCARGA -->
             <div v-if="vistaActiva !== 'matriz'" class="btn-group shadow-sm">
                <button type="button" class="btn btn-sm btn-warning dropdown-toggle fw-bold text-dark px-3" data-bs-toggle="dropdown">
                  <i class="bi bi-image-fill me-1"></i> JPG
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0">
                  <li><a class="dropdown-item py-2" href="#" @click.prevent="descargarImagen('carta')"><i class="bi bi-file-earmark-pdf me-2 text-danger"></i>Tamaño Carta</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item py-2" href="#" @click.prevent="descargarImagen('redes')"><i class="bi bi-instagram me-2 text-primary"></i>Formato Redes (Vista Previa)</a></li>
                </ul>
             </div>

             <button v-else class="btn btn-sm btn-success w-100 shadow-sm" @click="exportarExcel"><i class="bi bi-file-earmark-excel-fill"></i> Excel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTENEDOR CON SCROLL RESPONSIVO -->
    <div class="reporte-scroll-container">
        
        <!-- VISTA DE REPORTE INDIVIDUAL / GRUPO / MAESTRO -->
        <div v-if="vistaActiva !== 'matriz'" class="hoja-horizontal shadow" id="hoja-reporte">
          <div class="industrial-bg-pattern"></div>
          <div class="watermark-gears"></div>
          <div class="technical-silhouettes">
            <i v-for="(icono, index) in siluetasAleatorias" 
               :key="index"
               :class="['bi', icono.clase, 'silhouette']"
               :style="{
                 top: icono.top + '%',
                 left: icono.left + '%',
                 transform: `rotate(${icono.rotacion}deg)`,
                 fontSize: icono.size + 'rem',
                 opacity: icono.opacidad
               }">
            </i>
          </div>

          <header class="d-flex justify-content-between align-items-center w-100 mb-2 header-industrial">
            <div class="d-flex flex-column align-items-start">
              <div class="barra-verde-industrial shadow-sm">
                <h2 class="fw-bold fst-italic m-0 text-white" style="font-size: 1.2rem;">
                  <i class="bi bi-gear-fill me-2"></i>Academia de Mantenimiento Industrial
                </h2>
              </div>
              <h1 class="texto-dorado-industrial fw-bold fst-italic mt-1" style="margin-left: 1.5rem; font-size: 1.8rem;">
                {{ vistaActiva === 'individual' ? espacioSeleccionado : vistaActiva === 'grupo' ? 'Grupo: ' + grupoSeleccionado : 'Docente: ' + maestroSeleccionado }}
                <span v-if="vistaActiva === 'maestro'" class="badge bg-dark ms-3 fs-6">Carga: {{ horasTotalesMaestro }} hrs/sem</span>
              </h1>
            </div>
            <img src="/logos/logo-mantenimiento.png" alt="Logo" class="logo-top-large" @error="fallbackLogo">
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
                      <td colspan="5" class="bg-receso text-dark fw-bold" style="letter-spacing: 15px;">RECESO</td>
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
                          <div v-if="vistaActiva !== 'grupo'" class="texto-grupo-color" :style="{ color: getColorForGrupo(row.celdas[dia].clase.grupo) }">
                            {{ row.celdas[dia].clase.grupo }}
                          </div>
                          <div v-if="vistaActiva !== 'individual'" class="fw-bold text-primary" style="font-size: 0.65rem;">
                            {{ row.celdas[dia].clase.laboratorio }}
                          </div>
                          <div v-if="vistaActiva !== 'maestro'" class="text-dark fs-docente lh-1 mt-1">
                            {{ row.celdas[dia].clase.docente }}
                          </div>
                          <div class="fw-bold text-dark fs-materia text-uppercase lh-1 mt-1">{{ row.celdas[dia].clase.materia }}</div>
                        </div>

                      </td>
                    </template>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <footer class="footer-industrial mt-1 pt-1">
            <div class="footer-line"></div>
            <div class="d-flex justify-content-between align-items-end w-100">
               <h3 class="fw-bold fst-italic texto-verde-oscuro m-0" style="font-size: 1.1rem;">{{ cuatrimestreAutomatico }}</h3>
               <img src="/logos/somos_mantenimeinto.png" alt="UTXJ" class="logo-bottom-large" @error="fallbackLogo">
            </div>
          </footer>
        </div>

        <!-- VISTA DE MATRIZ GENERAL -->
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
                            <th colspan="3" class="bg-secondary text-white py-1">DOCENCIA IV</th>
                        </tr>
                        <tr class="bg-light">
                            <th v-for="lab in laboratoriosList" :key="lab" class="th-matriz">{{ lab.split(' - ')[0] }}</th>
                            <th v-for="aula in aulasList" :key="aula" class="th-matriz">{{ aula.split(' ')[1] }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="bloque in bloquesHorarios" :key="bloque.inicio">
                            <td class="fw-bold bg-light small">{{ bloque.inicio }} - {{ bloque.fin }}</td>
                            <td v-for="espacio in [...laboratoriosList, ...aulasList]" :key="espacio" 
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
    </div>

    <!-- MODAL VISTA PREVIA REDES SOCIALES -->
    <div v-if="previewRedesVisible" class="modal fade show d-block no-print" style="background: rgba(0,0,0,0.9); z-index: 10000;">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content bg-dark border-0">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title text-white fw-bold">Vista Previa Redes Sociales (2040x1913)</h5>
                    <button type="button" class="btn-close btn-close-white" @click="previewRedesVisible = false"></button>
                </div>
                <div class="modal-body text-center p-4">
                    <img :src="imgPreviewSrc" class="img-fluid shadow-lg border border-secondary" style="max-height: 70vh;">
                </div>
                <div class="modal-footer border-0 justify-content-center pb-4">
                    <button class="btn btn-lg btn-warning fw-bold px-5 py-3 shadow" @click="confirmarDescargaRedes">
                      <i class="bi bi-download me-2"></i> CONFIRMAR Y DESCARGAR JPG
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL DE DETALLES -->
    <div v-if="modalVisible" class="modal fade show d-block no-print" tabindex="-1" style="background: rgba(0,0,0,0.6);" @click.self="modalVisible = false">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow-lg border-0 overflow-hidden">
                <div class="modal-header bg-primary text-white border-0">
                    <h5 class="modal-title fw-bold">Detalles de la Clase</h5>
                    <button type="button" class="btn-close btn-close-white" @click="modalVisible = false"></button>
                </div>
                <div class="modal-body p-4 text-center bg-white" v-if="claseSeleccionada">
                    <h4 class="fw-bold text-primary text-uppercase mb-1">{{ claseSeleccionada.materia }}</h4>
                    <div class="fw-bold fs-5 mb-3" :style="{ color: getColorForGrupo(claseSeleccionada.grupo) }">Grupo: {{ claseSeleccionada.grupo }}</div>
                    
                    <div class="card bg-light border-0 text-start p-3 mb-0 shadow-sm">
                        <div class="d-flex align-items-center justify-content-center mb-3 pb-3 border-bottom text-center flex-column">
                            <img :src="fotoDocente(claseSeleccionada.docente)" 
                                 @error="$event.target.src = '/logos/default-docente.png'"
                                 class="rounded-circle shadow bg-white mb-2" 
                                 style="width: 120px; height: 120px; object-fit: cover; border: 4px solid white; display: block; margin: 0 auto;">
                            <div>
                                <div class="text-muted small fw-bold text-uppercase mb-1">Docente Asignado</div>
                                <div class="fw-bold text-dark fs-5 lh-1">{{ claseSeleccionada.docente }}</div>
                            </div>
                        </div>
                        <div class="ps-3">
                            <p class="mb-2"><i class="bi bi-clock-fill text-warning me-2 fs-5 align-middle"></i> <strong>Horario:</strong> {{ claseSeleccionada.horaInicio }} a {{ claseSeleccionada.horaFin }}</p>
                            <p class="mb-0"><i class="bi bi-door-open-fill text-success me-2 fs-5 align-middle"></i> <strong>Lugar:</strong> {{ claseSeleccionada.laboratorio }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const API_URL = 'https://back-end-casilleros.onrender.com/horarios'; 
const horarios = ref([]);
const vistaActiva = ref('individual');
const diaMatriz = ref('Lunes');
const grupoSeleccionado = ref('');
const maestroSeleccionado = ref('');
const espacioSeleccionado = ref('Lab de Automatización - Pesado I');
const modalVisible = ref(false);
const claseSeleccionada = ref(null);
const previewRedesVisible = ref(false);
const imgPreviewSrc = ref('');

const laboratoriosList = ['Lab de Automatización - Pesado I', 'Lab Eléctrica - Pesado I', 'Lab Electrónica - Pesado I', 'Lab de Ciencias Básicas - Pesado I', 'Lab Manufactura - Pesado II', 'Lab Metrología - Pesado II', 'Cómputo III - Docencia II'];
const aulasList = ['AU 106 Docencia III', 'AU 107 Docencia III', 'AU 108 Docencia III', 'AU 109 Docencia III', 'AU 110 Docencia III', 'AU 111 Docencia III', 'AU 406 Docencia IV', 'AU 407 Docencia IV', 'AU 408 Docencia IV', 'AU Virtual'];
const diasList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const bloquesHorarios = [
  { inicio: '07:00', fin: '08:00', tipo: 'clase' }, { inicio: '08:00', fin: '09:00', tipo: 'clase' },
  { inicio: '09:00', fin: '10:00', tipo: 'clase' }, { inicio: '10:00', fin: '11:00', tipo: 'clase' },
  { inicio: '11:00', fin: '12:00', tipo: 'clase' }, { inicio: '12:00', fin: '12:30', tipo: 'receso' },
  { inicio: '12:30', fin: '13:30', tipo: 'clase' }, { inicio: '13:30', fin: '14:30', tipo: 'clase' },
  { inicio: '14:30', fin: '15:30', tipo: 'clase' }, { inicio: '15:30', fin: '16:30', tipo: 'clase' },
  { inicio: '16:30', fin: '17:30', tipo: 'clase' }, { inicio: '17:30', fin: '18:30', tipo: 'clase' },
  { inicio: '18:30', fin: '19:30', tipo: 'clase' }, { inicio: '19:30', fin: '20:30', tipo: 'clase' }
];

const catalogoIconos = ['bi-wrench', 'bi-gear-fill', 'bi-cpu', 'bi-droplet-fill', 'bi-robot', 'bi-lightning-fill', 'bi-pip-fill', 'bi-tools', 'bi-pc-display', 'bi-moisture', 'bi-connector-fill', 'bi-shield-shaded'];
const siluetasAleatorias = ref([]);

const generarSiluetas = () => {
  const filas = 4; const columnas = 5; const nuevas = [];
  const pasoX = 100 / columnas; const pasoY = 100 / filas;
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (Math.random() > 0.3) {
        const jX = (Math.random() - 0.5) * (pasoX * 0.8);
        const jY = (Math.random() - 0.5) * (pasoY * 0.8);
        nuevas.push({
          clase: catalogoIconos[Math.floor(Math.random() * catalogoIconos.length)],
          top: (f * pasoY) + (pasoY / 2) + jY,
          left: (c * pasoX) + (pasoX / 2) + jX,
          rotacion: Math.random() * 360,
          size: 3 + Math.random() * 3,
          opacidad: 0.04 + Math.random() * 0.03
        });
      }
    }
  }
  siluetasAleatorias.value = nuevas;
};

const gruposList = computed(() => [...new Set(horarios.value.map(h => h.grupo).filter(g => g))].sort());
const maestrosList = computed(() => [...new Set(horarios.value.map(h => h.docente).filter(d => d))].sort());

const horasTotalesMaestro = computed(() => {
  const clases = horarios.value.filter(h => h.docente === maestroSeleccionado.value);
  let totalMin = 0; const porDia = {};
  clases.forEach(c => {
    if (!c.horaInicio || !c.horaFin) return;
    let [hI, mI] = c.horaInicio.split(':').map(Number);
    let [hF, mF] = c.horaFin.split(':').map(Number);
    if (hI < 6) hI += 12; if (hF < 6) hF += 12; if (hF < hI) hF += 12;
    if (!porDia[c.dia]) porDia[c.dia] = [];
    porDia[c.dia].push({ inicio: hI * 60 + mI, fin: hF * 60 + mF });
  });
  for (const dia in porDia) {
    let intervalos = porDia[dia].sort((a, b) => a.inicio - b.inicio);
    let fusion = [];
    if (intervalos.length > 0) {
      fusion.push(intervalos[0]);
      for (let i = 1; i < intervalos.length; i++) {
        let act = intervalos[i]; let ult = fusion[fusion.length - 1];
        if (act.inicio <= ult.fin) ult.fin = Math.max(ult.fin, act.fin);
        else fusion.push(act);
      }
    }
    fusion.forEach(b => totalMin += (b.fin - b.inicio));
  }
  return (totalMin / 60).toFixed(1);
});

const matrizHorario = computed(() => {
  const matrix = [];
  const skip = { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0 };
  for (let r = 0; r < bloquesHorarios.length; r++) {
    const bloque = bloquesHorarios[r]; const row = { bloque, celdas: {} };
    if (bloque.tipo !== 'receso') {
      for (const d of diasList) {
        if (skip[d] > 0) { row.celdas[d] = { render: false }; skip[d]--; continue; }
        let c = horarios.value.find(h => h.dia === d && h.horaInicio === bloque.inicio && (
          vistaActiva.value === 'individual' ? h.laboratorio === espacioSeleccionado.value :
          vistaActiva.value === 'grupo' ? h.grupo === grupoSeleccionado.value : h.docente === maestroSeleccionado.value
        ));
        if (c) {
          let rs = 1;
          for (let nR = r + 1; nR < bloquesHorarios.length; nR++) {
            if (bloquesHorarios[nR].tipo !== 'receso' && bloquesHorarios[nR].inicio < c.horaFin) rs++; else break;
          }
          row.celdas[d] = { render: true, rowspan: rs, clase: c }; skip[d] = rs - 1;
        } else row.celdas[d] = { render: true, rowspan: 1, clase: null };
      }
    }
    matrix.push(row);
  }
  if (vistaActiva.value === 'matriz') return matrix;
  let start = -1; let end = -1;
  for (let i = 0; i < matrix.length; i++) {
    let ocupada = matrix[i].bloque.tipo === 'receso' ? true : diasList.some(d => (matrix[i].celdas[d].render && matrix[i].celdas[d].clase) || !matrix[i].celdas[d].render);
    if (ocupada) { if (start === -1 && matrix[i].bloque.tipo !== 'receso') start = i; end = i; }
  }
  if (start === -1) return matrix.slice(0, 6);
  while (start < matrix.length && matrix[start].bloque.tipo === 'receso') start++;
  while (end >= 0 && matrix[end].bloque.tipo === 'receso') end--;
  return matrix.slice(start, end + 1);
});

const cuatrimestreAutomatico = computed(() => {
  const m = new Date().getMonth(); const y = new Date().getFullYear();
  return `HORARIO ESCOLAR ${m <= 3 ? "ENERO-ABRIL" : m <= 7 ? "MAYO-AGOSTO" : "SEPTIEMBRE-DICIEMBRE"} ${y}`;
});

const getColorForGrupo = (g) => {
  const p = ['#1565C0', '#00695C', '#7B1FA2', '#D84315', '#C62828'];
  if (!g) return '#444';
  let h = 0; for (let i = 0; i < g.length; i++) h = g.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
};

const fotoDocente = (n) => {
  if (!n) return null;
  const proc = n.trim().replace(/\s+/g, '_');
  return `/maestros_manto/${proc}${n.includes('Gallegos Amador Benito') ? '.jpg' : '.png'}`;
};

const buscarClaseMatriz = (d, e, i) => horarios.value.filter(c => c.dia === d && c.laboratorio === e && c.horaInicio <= i && c.horaFin > i);

const loadHorarios = async () => { try { const res = await axios.get(API_URL); horarios.value = res.data; } catch (e) { console.error(e); } };
const abrirDetalle = (c) => { if (c) { claseSeleccionada.value = c; modalVisible.value = true; } };
const imprimirPDF = () => window.print();
const fallbackLogo = (e) => e.target.src = 'https://via.placeholder.com/150?text=Logo';

// --- LOGICA DE DESCARGA ---
const descargarImagen = async (formato) => {
  const el = document.getElementById('hoja-reporte');
  if (!el) return;

  if (formato === 'redes') {
    const containerRedes = document.createElement('div');
    containerRedes.style.position = 'absolute';
    containerRedes.style.left = '-9999px';
    document.body.appendChild(containerRedes);

    const clon = el.cloneNode(true);
    Object.assign(clon.style, {
      width: '2040px',
      height: '1913px',
      minWidth: '2040px',
      padding: '80px 100px',
      display: 'flex',
      backgroundColor: '#ffffff',
      transform: 'none'
    });

    const titulo = clon.querySelector('.texto-dorado-industrial'); if(titulo) titulo.style.fontSize = '5.5rem';
    const academia = clon.querySelector('h2.text-white'); if(academia) academia.style.fontSize = '2.5rem';
    clon.querySelectorAll('.horario-table th').forEach(th => th.style.fontSize = '2.2rem');
    clon.querySelectorAll('.bg-hora').forEach(ch => { ch.style.fontSize = '1.8rem'; ch.style.width = '220px'; });
    clon.querySelectorAll('.texto-grupo-color').forEach(div => div.style.fontSize = '1.8rem');
    clon.querySelectorAll('.text-primary').forEach(div => div.style.fontSize = '1.4rem');
    clon.querySelectorAll('.fs-docente').forEach(div => div.style.fontSize = '1.4rem');
    
    // REDUCCIÓN DEL TAMAÑO DE LA MATERIA PARA REDES
    clon.querySelectorAll('.fs-materia').forEach(div => div.style.fontSize = '1.3rem');
    
    const receso = clon.querySelector('.bg-receso'); if(receso) { receso.style.fontSize = '2.8rem'; receso.style.letterSpacing = '50px'; }
    const cuatri = clon.querySelector('h3.texto-verde-oscuro'); if(cuatri) cuatri.style.fontSize = '2.5rem';
    const lTop = clon.querySelector('.logo-top-large'); if(lTop) lTop.style.height = '180px';
    const lBot = clon.querySelector('.logo-bottom-large'); if(lBot) lBot.style.height = '150px';

    containerRedes.appendChild(clon);

    const canvas = await html2canvas(clon, { scale: 1, useCORS: true, backgroundColor: "#ffffff" });
    imgPreviewSrc.value = canvas.toDataURL("image/jpeg", 0.95);
    previewRedesVisible.value = true;
    
    document.body.removeChild(containerRedes);

  } else {
    // CAPTURA NORMAL
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
    const link = document.createElement('a');
    link.download = `Horario_Carta_${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }
};

const confirmarDescargaRedes = () => {
  const link = document.createElement('a');
  link.download = `Horario_Redes_${Date.now()}.jpg`;
  link.href = imgPreviewSrc.value;
  link.click();
  previewRedesVisible.value = false;
};

const exportarExcel = () => {
  const header = ["HORA", ...laboratoriosList, ...aulasList];
  const rows = bloquesHorarios.map(b => {
    const r = [`${b.inicio} - ${b.fin}`];
    [...laboratoriosList, ...aulasList].forEach(e => {
      if (b.tipo === 'receso') r.push("RECESO");
      else {
        const cs = buscarClaseMatriz(diaMatriz.value, e, b.inicio);
        r.push(cs.length > 0 ? `${cs[0].grupo} - ${cs[0].materia}` : "");
      }
    });
    return r;
  });
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Matriz");
  XLSX.writeFile(wb, `Matriz_${diaMatriz.value}.xlsx`);
};

watch(vistaActiva, () => generarSiluetas());

onMounted(async () => {
  generarSiluetas();
  await loadHorarios();
  if (gruposList.value.length > 0) grupoSeleccionado.value = gruposList.value[0];
  if (maestrosList.value.length > 0) maestroSeleccionado.value = maestrosList.value[0];
});
</script>

<style scoped>
/* ESTILOS EXACTOS Y ORIGINALES */
.reporte-bg { background-color: #555; }

.reporte-scroll-container { width: 100%; overflow-x: auto; padding: 10px; -webkit-overflow-scrolling: touch; }

.hoja-horizontal { 
  background: white; width: 27.94cm; min-width: 27.94cm; height: 21.59cm; margin: 0 auto; 
  box-sizing: border-box; padding: 5mm 8mm; display: flex; 
  flex-direction: column; overflow: hidden; position: relative; z-index: 1;
}

.header-industrial { flex-shrink: 0; z-index: 10; position: relative; }
.logo-top-large { height: 90px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1)); }
.logo-bottom-large { height: 70px; }
.barra-verde-industrial {
  background: linear-gradient(135deg, #005b4f 0%, #003d35 100%);
  padding: 8px 30px 8px 20px; border-left: 5px solid #b58c2a;
  border-radius: 0 25px 25px 0; margin-left: -8mm; box-shadow: 3px 3px 6px rgba(0,0,0,0.2);
}
.texto-dorado-industrial { color: #a37a1e; text-transform: uppercase; letter-spacing: 1px; }
.table-container { flex: 1 1 auto; display: flex; flex-direction: column; margin: 4px 0; min-height: 0; position: relative; z-index: 5; }

/* TABLA ORIGINAL SIN MODIFICACIONES DE BORDES */
.horario-table { 
  height: 100%; width: 100%; border-collapse: collapse !important; 
  table-layout: fixed; border: 2px solid #000 !important;
  background-color: rgba(255, 255, 255, 0.82) !important;
  box-shadow: 0 0 15px rgba(0,0,0,0.05); backdrop-filter: blur(2px);
}
.horario-table th, .horario-table td { border: 0.75pt solid #000 !important; padding: 2px !important; vertical-align: middle; }

.header-verde { background: #004d40 !important; color: white !important; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; }
.bg-hora { background-color: #cfd8dc !important; font-size: 0.55rem; width: 75px; }
.bg-receso { 
  background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e8e8e8 10px, #e8e8e8 20px) !important; 
  color: #666 !important; font-size: 0.75rem; 
}
.celda-clase { position: relative; cursor: pointer; }
.clase-info { text-align: center; line-height: 0.95; }
.fs-docente, .fs-materia { font-size: 0.55rem; }

.industrial-bg-pattern {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: linear-gradient(rgba(0, 91, 79, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 91, 79, 0.03) 1px, transparent 1px);
  background-size: 20px 20px; z-index: 0;
}
.watermark-gears {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 500px; height: 500px; background-image: url('https://cdn-icons-png.flaticon.com/512/3524/3524659.png');
  background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.04; z-index: 0;
}
.technical-silhouettes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: hidden; }
.silhouette { position: absolute; color: #005b4f; filter: grayscale(100%); display: block !important; }

.footer-industrial { flex-shrink: 0; margin-top: auto; }
.footer-line { height: 3px; background: linear-gradient(90deg, #005b4f, #b58c2a, transparent); margin-bottom: 5px; }

/* CONFIGURACIÓN DE IMPRESIÓN CORREGIDA PARA 1 SOLA HOJA */
@media print {
  @page { size: letter landscape; margin: 0 !important; }
  
  /* Bloquear dimensiones para evitar la segunda hoja en blanco */
  html, body { 
    width: 27.94cm !important; 
    height: 21.59cm !important; 
    margin: 0 !important; 
    padding: 0 !important; 
    overflow: hidden !important; 
  }
  
  .reporte-bg { 
    padding: 0 !important; 
    min-height: 0 !important; 
    background: transparent !important; 
  }
  
  .no-print { display: none !important; }
  
  .reporte-scroll-container { 
    padding: 0 !important; 
    overflow: hidden !important; 
    width: 27.94cm !important; 
    height: 21.59cm !important; 
  }
  
  .hoja-horizontal { 
    position: relative !important; 
    margin: 0 !important; 
    left: 0 !important; 
    top: 0 !important; 
    width: 27.94cm !important; 
    height: 21.59cm !important; 
    box-shadow: none !important; 
    page-break-after: avoid !important; 
    page-break-inside: avoid !important; 
  }
  
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
