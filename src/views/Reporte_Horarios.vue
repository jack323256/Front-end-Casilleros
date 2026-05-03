<template>
  <div class="reporte-bg min-vh-100 pb-4">
    <!-- BARRA DE CONTROL SUPERIOR -->
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
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'matriz' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'matriz'">Matriz</button>
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
             <button v-if="vistaActiva !== 'matriz'" class="btn btn-sm btn-danger px-3 shadow-sm" @click="imprimirPDF"><i class="bi bi-printer-fill"></i></button>
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

    <!-- CONTENEDOR PRINCIPAL -->
    <div class="reporte-scroll-container">
        <!-- VISTA DE REPORTE INDIVIDUAL / GRUPO / MAESTRO -->
        <div v-if="vistaActiva !== 'matriz'" class="hoja-horizontal shadow" id="hoja-reporte">
          <div class="industrial-bg-pattern"></div>
          <div class="watermark-gears"></div>
          <div class="technical-silhouettes">
            <i v-for="(icono, index) in siluetasAleatorias" :key="index" :class="['bi', icono.clase, 'silhouette']"
               :style="{ top: icono.top + '%', left: icono.left + '%', transform: `rotate(${icono.rotacion}deg)`, fontSize: icono.size + 'rem', opacity: icono.opacidad }">
            </i>
          </div>

          <header class="d-flex justify-content-between align-items-center w-100 mb-2 header-industrial">
            <div class="d-flex flex-column align-items-start">
              <div class="barra-verde-industrial shadow-sm">
                <h2 class="fw-bold fst-italic m-0 text-white label-academia" style="font-size: 1.1rem;">Academia de Mantenimiento Industrial</h2>
              </div>
              <h1 class="texto-dorado-industrial fw-bold fst-italic mt-1 titulo-principal" style="margin-left: 1.5rem; font-size: 1.8rem;">
                {{ vistaActiva === 'individual' ? espacioSeleccionado : vistaActiva === 'grupo' ? 'Grupo: ' + grupoSeleccionado : 'Docente: ' + maestroSeleccionado }}
              </h1>
            </div>
            <img src="/logos/logo-mantenimiento.png" alt="Logo" class="logo-top-large" @error="fallbackLogo" style="height: 90px;">
          </header>

          <div class="table-container">
            <table class="table table-bordered border-dark text-center horario-table align-middle m-0">
              <thead>
                <tr>
                  <th class="header-verde th-horario" style="width: 11%;">HORARIO</th>
                  <th class="header-verde th-dia" v-for="dia in diasList" :key="dia">{{ dia }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in matrizHorario" :key="row.bloque.inicio">
                  <tr v-if="row.bloque.tipo === 'receso'" class="fila-receso">
                    <td class="fw-bold bg-hora text-dark celda-hora" style="font-size: 0.55rem;">{{ row.bloque.inicio }}</td>
                    <td colspan="5" class="bg-receso text-dark fw-bold etiqueta-receso" style="letter-spacing: 15px;">RECESO</td>
                  </tr>
                  <tr v-else>
                    <td class="fw-bold bg-hora text-dark celda-hora" style="font-size: 0.55rem;">{{ row.bloque.inicio }} a {{ row.bloque.fin }}</td>
                    <template v-for="dia in diasList" :key="dia">
                      <td v-if="row.celdas[dia].render" :rowspan="row.celdas[dia].rowspan" class="celda-clase" :class="{ 'has-class': row.celdas[dia].clase }" @click="abrirDetalle(row.celdas[dia].clase)">
                        <div v-if="row.celdas[dia].clase" class="clase-info">
                          <div v-if="vistaActiva !== 'grupo'" class="txt-grupo" :style="{ color: getColorForGrupo(row.celdas[dia].clase.grupo), fontSize: '0.7rem', fontWeight: '900' }">{{ row.celdas[dia].clase.grupo }}</div>
                          <div v-if="vistaActiva !== 'individual'" class="txt-lab fw-bold text-primary" style="font-size: 0.6rem;">{{ row.celdas[dia].clase.laboratorio }}</div>
                          <div v-if="vistaActiva !== 'maestro'" class="txt-docente text-dark mt-1" style="font-size: 0.55rem;">{{ row.celdas[dia].clase.docente }}</div>
                          <div class="txt-materia fw-bold text-dark text-uppercase mt-1" style="font-size: 0.55rem;">{{ row.celdas[dia].clase.materia }}</div>
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
               <h3 class="fw-bold fst-italic texto-verde-oscuro m-0 txt-cuatrimestre" style="font-size: 1.1rem;">{{ cuatrimestreAutomatico }}</h3>
               <img src="/logos/somos_mantenimeinto.png" alt="Somos" class="logo-bottom-large" @error="fallbackLogo" style="height: 70px;">
            </div>
          </footer>
        </div>

        <!-- VISTA MATRIZ GENERAL RESTAURADA -->
        <div v-else class="matriz-general-container shadow bg-white p-4 mx-auto border border-2 border-dark" style="max-width: 98%;">
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
                            <th v-for="lab in laboratoriosList" :key="lab" class="th-matriz" style="font-size: 0.65rem;">{{ lab.split(' - ')[0] }}</th>
                            <th v-for="aula in aulasList" :key="aula" class="th-matriz" style="font-size: 0.65rem;">{{ aula.split(' ')[1] }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="bloque in bloquesHorarios" :key="bloque.inicio">
                            <td class="fw-bold bg-light small" style="font-size: 0.7rem;">{{ bloque.inicio }} - {{ bloque.fin }}</td>
                            <td v-for="espacio in [...laboratoriosList, ...aulasList]" :key="espacio" class="celda-matriz">
                                <template v-if="bloque.tipo === 'receso'">RECESO</template>
                                <div v-else v-for="clase in buscarClaseMatriz(diaMatriz, espacio, bloque.inicio)" :key="clase.id">
                                    <div class="fw-bold" :style="{ color: getColorForGrupo(clase.grupo), fontSize: '0.7rem' }">{{ clase.grupo }}</div>
                                    <div class="text-dark" style="font-size: 0.6rem;">{{ clase.materia }}</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- MODAL VISTA PREVIA REDES -->
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
const bloquesHorarios = [{ inicio: '07:00', fin: '08:00', tipo: 'clase' }, { inicio: '08:00', fin: '09:00', tipo: 'clase' }, { inicio: '09:00', fin: '10:00', tipo: 'clase' }, { inicio: '10:00', fin: '11:00', tipo: 'clase' }, { inicio: '11:00', fin: '12:00', tipo: 'clase' }, { inicio: '12:00', fin: '12:30', tipo: 'receso' }, { inicio: '12:30', fin: '13:30', tipo: 'clase' }, { inicio: '13:30', fin: '14:30', tipo: 'clase' }, { inicio: '14:30', fin: '15:30', tipo: 'clase' }, { inicio: '15:30', fin: '16:30', tipo: 'clase' }, { inicio: '16:30', fin: '17:30', tipo: 'clase' }, { inicio: '17:30', fin: '18:30', tipo: 'clase' }, { inicio: '18:30', fin: '19:30', tipo: 'clase' }, { inicio: '19:30', fin: '20:30', tipo: 'clase' }];

const siluetasAleatorias = ref([]);
const generarSiluetas = () => {
  const filas = 4; const columnas = 5; const nuevas = [];
  const pasoX = 100 / columnas; const pasoY = 100 / filas;
  const catalogo = ['bi-wrench', 'bi-gear-fill', 'bi-cpu', 'bi-droplet-fill', 'bi-robot', 'bi-lightning-fill', 'bi-pip-fill', 'bi-tools', 'bi-pc-display', 'bi-moisture', 'bi-connector-fill', 'bi-shield-shaded'];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (Math.random() > 0.3) {
        const jitterX = (Math.random() - 0.5) * (pasoX * 0.8);
        const jitterY = (Math.random() - 0.5) * (pasoY * 0.8);
        nuevas.push({ clase: catalogo[Math.floor(Math.random() * catalogo.length)], top: (f * pasoY) + (pasoY / 2) + jitterY, left: (c * pasoX) + (pasoX / 2) + jitterX, rotacion: Math.random() * 360, size: 3 + Math.random() * 3, opacidad: 0.04 + Math.random() * 0.03 });
      }
    }
  }
  siluetasAleatorias.value = nuevas;
};

const matrizHorario = computed(() => {
  const m = []; const skip = {'Lunes':0,'Martes':0,'Miércoles':0,'Jueves':0,'Viernes':0};
  for(let r=0; r<bloquesHorarios.length; r++) {
    const b = bloquesHorarios[r]; const row = { bloque: b, celdas: {} };
    if(b.tipo !== 'receso') for(const d of diasList) {
      if(skip[d] > 0){ row.celdas[d] = {render:false}; skip[d]--; continue; }
      let c = horarios.value.find(h => h.dia===d && h.horaInicio===b.inicio && (vistaActiva.value==='individual'?h.laboratorio===espacioSeleccionado.value:vistaActiva.value==='grupo'?h.grupo===grupoSeleccionado.value:h.docente===maestroSeleccionado.value));
      if(c){ let rs=1; for(let n=r+1;n<bloquesHorarios.length;n++) if(bloquesHorarios[n].tipo!=='receso' && bloquesHorarios[n].inicio<c.horaFin) rs++; else break; row.celdas[d] = {render:true, rowspan:rs, clase:c}; skip[d]=rs-1; }
      else row.celdas[d] = {render:true, rowspan:1, clase:null};
    }
    m.push(row);
  }
  if(vistaActiva.value==='matriz') return m;
  let start = -1; let end = -1;
  for(let i=0;i<m.length;i++) {
    const ocupada = m[i].bloque.tipo==='receso' || diasList.some(d => (m[i].celdas[d]?.render && m[i].celdas[d]?.clase) || !m[i].celdas[d]?.render);
    if(ocupada){ if(start===-1 && m[i].bloque.tipo!=='receso') start=i; end=i; }
  }
  if(start===-1) return m.slice(0, 6);
  while(start<m.length && m[start].bloque.tipo==='receso') start++;
  while(end>=0 && m[end].bloque.tipo==='receso') end--;
  return m.slice(start, end+1);
});

const cuatrimestreAutomatico = computed(() => {
  const mes = new Date().getMonth(); return `HORARIO ESCOLAR ${mes <= 3 ? "ENERO-ABRIL" : mes <= 7 ? "MAYO-AGOSTO" : "SEPTIEMBRE-DICIEMBRE"} ${new Date().getFullYear()}`;
});

const getColorForGrupo = (g) => {
  const p = ['#1565C0', '#00695C', '#7B1FA2', '#D84315', '#C62828'];
  let h = 0; if(!g) return '#444'; for(let i=0;i<g.length;i++) h = g.charCodeAt(i)+((h<<5)-h); return p[Math.abs(h)%5];
};

const buscarClaseMatriz = (d,e,i) => horarios.value.filter(c => c.dia===d && c.laboratorio===e && c.horaInicio===i);
const loadHorarios = async () => { try { const r = await axios.get(API_URL); horarios.value = r.data; } catch(e) { console.error(e); } };
const abrirDetalle = (c) => { if(c) { claseSeleccionada.value = c; modalVisible.value = true; } };
const imprimirPDF = () => window.print();
const fallbackLogo = (e) => e.target.src = 'https://via.placeholder.com/150?text=Logo';

const descargarImagen = async (formato) => {
  const el = document.getElementById('hoja-reporte'); if(!el) return;
  if(formato === 'redes') {
    const containerRedes = document.createElement('div'); containerRedes.style.position = 'absolute'; containerRedes.style.left = '-9999px'; document.body.appendChild(containerRedes);
    const clon = el.cloneNode(true); Object.assign(clon.style, { width: '2040px', height: '1913px', minWidth: '2040px', padding: '80px 100px', display: 'flex', backgroundColor: 'white', transform: 'none' });
    const tPrincipal = clon.querySelector('.titulo-principal'); if(tPrincipal) tPrincipal.style.fontSize = '5.5rem';
    const labelAcademia = clon.querySelector('.label-academia'); if(labelAcademia) labelAcademia.style.fontSize = '2.5rem';
    clon.querySelectorAll('.horario-table th').forEach(th => th.style.fontSize = '2.2rem');
    clon.querySelectorAll('.celda-hora').forEach(ch => { ch.style.fontSize = '1.8rem'; ch.style.width = '220px'; });
    clon.querySelectorAll('.clase-info div').forEach(div => div.style.fontSize = div.classList.contains('txt-materia') ? '1.8rem' : '1.4rem');
    const receso = clon.querySelector('.etiqueta-receso'); if(receso) { receso.style.fontSize = '2.8rem'; receso.style.letterSpacing = '50px'; }
    const cuatri = clon.querySelector('.txt-cuatrimestre'); if(cuatri) cuatri.style.fontSize = '2.5rem';
    const lTop = clon.querySelector('.logo-top-large'); if(lTop) lTop.style.height = '180px';
    const lBot = clon.querySelector('.logo-bottom-large'); if(lBot) lBot.style.height = '150px';
    containerRedes.appendChild(clon);
    const canvas = await html2canvas(clon, { scale: 1, useCORS: true, backgroundColor: "#ffffff" });
    imgPreviewSrc.value = canvas.toDataURL("image/jpeg", 0.95); previewRedesVisible.value = true;
    document.body.removeChild(containerRedes);
  } else {
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
    const link = document.createElement('a'); link.download = `Horario_Carta_${Date.now()}.jpg`; link.href = canvas.toDataURL("image/jpeg", 0.95); link.click();
  }
};

const confirmarDescargaRedes = () => { const link = document.createElement('a'); link.download = `Horario_Redes_${Date.now()}.jpg`; link.href = imgPreviewSrc.value; link.click(); previewRedesVisible.value = false; };

const exportarExcel = () => { /* Lógica Excel */ };

watch(vistaActiva, () => generarSiluetas());
onMounted(async () => { generarSiluetas(); await loadHorarios(); if(gruposList.value.length>0) grupoSeleccionado.value = gruposList.value[0]; if(maestrosList.value.length>0) maestroSeleccionado.value = maestrosList.value[0]; });
</script>

<style scoped>
.reporte-bg { background-color: #555; overflow-x: hidden; }
.reporte-scroll-container { width: 100%; overflow-x: auto; padding: 10px; -webkit-overflow-scrolling: touch; }
.hoja-horizontal { background: white; width: 27.94cm; min-width: 27.94cm; height: 21.59cm; margin: 0 auto; box-sizing: border-box; padding: 5mm 8mm; display: flex; flex-direction: column; position: relative; z-index: 1; overflow: hidden; }
.barra-verde-industrial { background: linear-gradient(135deg, #005b4f 0%, #003d35 100%); padding: 8px 30px; border-left: 5px solid #b58c2a; border-radius: 0 25px 25px 0; margin-left: -8mm; box-shadow: 3px 3px 6px rgba(0,0,0,0.2); }
.texto-dorado-industrial { color: #a37a1e; text-transform: uppercase; letter-spacing: 1px; }
.table-container { flex: 1 1 auto; display: flex; flex-direction: column; margin: 4px 0; min-height: 0; position: relative; z-index: 5; }
.horario-table { height: 100%; width: 100%; border-collapse: collapse !important; border: 2px solid #000 !important; background-color: rgba(255, 255, 255, 0.82) !important; backdrop-filter: blur(2px); }
.horario-table th, .horario-table td { border: 0.75pt solid #000 !important; padding: 2px !important; vertical-align: middle; }

/* AJUSTE PARA QUITAR LA LÍNEA INTERNA EN CLASES UNIDAS */
.celda-clase.has-class {
  border-top: 0.75pt solid #000 !important;
  border-bottom: 0.75pt solid #000 !important;
}
/* Estilo para ocultar líneas cuando hay rowspan pero el navegador falla visualmente */
.horario-table td[rowspan] {
  border-bottom: 0.75pt solid #000 !important;
}

.header-verde { background: #004d40 !important; color: white !important; font-weight: 800; font-size: 0.8rem; }
.bg-hora { background-color: #cfd8dc !important; width: 75px; }
.bg-receso { background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e8e8e8 10px, #e8e8e8 20px) !important; color: #666 !important; font-size: 0.75rem; }
.clase-info { text-align: center; line-height: 0.95; }
.industrial-bg-pattern { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(0, 91, 79, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 91, 79, 0.03) 1px, transparent 1px); background-size: 20px 20px; z-index: 0; }
.watermark-gears { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 500px; background-image: url('https://cdn-icons-png.flaticon.com/512/3524/3524659.png'); background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.04; z-index: 0; }
.technical-silhouettes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: hidden; }
.silhouette { position: absolute; color: #005b4f; filter: grayscale(100%); display: block !important; }
.footer-line { height: 3px; background: linear-gradient(90deg, #005b4f, #b58c2a, transparent); margin-bottom: 5px; }

/* MATRIZ GENERAL ESTILOS */
.celda-matriz { font-size: 0.65rem; min-width: 60px; }
.th-matriz { background: #eee; font-weight: bold; }

@media print {
  @page { size: letter landscape; margin: 0 !important; }
  .no-print { display: none !important; }
  .reporte-scroll-container { padding: 0 !important; overflow: visible !important; }
  .hoja-horizontal { position: absolute !important; left: 0 !important; top: 0 !important; width: 27.8cm !important; height: 21.4cm !important; z-index: 9999 !important; margin: 0 !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
