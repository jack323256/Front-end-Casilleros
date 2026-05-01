<template>
  <div class="reporte-bg min-vh-100 pb-4">
    
    <div class="container-fluid py-2 bg-white shadow-sm mb-3 no-print border-bottom">
      <div class="row align-items-center px-lg-4">
        <div class="col-md-2">
          <button class="btn btn-sm btn-outline-secondary fw-bold" @click="$router.back()">
            <i class="bi bi-arrow-left me-1"></i> Volver
          </button>
        </div>

        <div class="col-md-4">
          <div class="btn-group w-100 shadow-sm">
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'individual' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'individual'">Individual</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'grupo' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'grupo'">Por Grupo</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'maestro' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'maestro'">Por Maestro</button>
            <button class="btn btn-sm fw-bold" :class="vistaActiva === 'matriz' ? 'btn-primary' : 'btn-outline-primary'" @click="vistaActiva = 'matriz'">Matriz General</button>
          </div>
        </div>

        <div class="col-md-3 d-flex gap-2 justify-content-center">
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

          <template v-else-if="vistaActiva === 'grupo'">
            <select v-model="grupoSeleccionado" class="form-select form-select-sm border-warning w-auto fw-bold">
              <option v-for="grupo in gruposList" :key="grupo" :value="grupo">{{ grupo }}</option>
            </select>
          </template>

          <template v-else-if="vistaActiva === 'maestro'">
            <select v-model="maestroSeleccionado" class="form-select form-select-sm border-info w-auto fw-bold">
              <option v-for="m in maestrosList" :key="m" :value="m">{{ m }}</option>
            </select>
          </template>

          <template v-else>
            <select v-model="diaMatriz" class="form-select form-select-sm border-success w-auto fw-bold">
              <option v-for="dia in diasList" :key="dia" :value="dia">{{ dia }}</option>
            </select>
          </template>
        </div>

        <div class="col-md-3 text-end">
          <button v-if="vistaActiva !== 'matriz'" class="btn btn-sm btn-danger shadow-sm fw-bold px-3" @click="imprimirPDF">
            <i class="bi bi-printer-fill me-1"></i> Imprimir PDF
          </button>
          <button v-else class="btn btn-sm btn-success shadow-sm fw-bold px-3" @click="exportarExcel">
            <i class="bi bi-file-earmark-excel-fill me-1"></i> Descargar Excel
          </button>
        </div>
      </div>
    </div>

    <div v-if="vistaActiva !== 'matriz'" class="hoja-horizontal shadow">
      <header class="d-flex justify-content-between align-items-start w-100 mb-1">
        <div class="d-flex flex-column align-items-start">
          <div class="barra-verde shadow-sm">
            <h2 class="fw-bold fst-italic m-0 text-white" style="font-size: 1.1rem;">Academia de Mantenimiento Industrial</h2>
          </div>
          <h1 class="texto-dorado fw-bold fst-italic mt-1 d-flex align-items-center" style="margin-left: 1.5rem; font-size: 1.6rem;">
            {{ vistaActiva === 'individual' ? espacioSeleccionado : vistaActiva === 'grupo' ? 'Grupo: ' + grupoSeleccionado : 'Docente: ' + maestroSeleccionado }}
            <span v-if="vistaActiva === 'maestro'" class="badge bg-dark ms-3 fs-6">
               Carga: {{ horasTotalesMaestro }} hrs/semana
            </span>
          </h1>
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

      <footer class="d-flex justify-content-between align-items-end mt-1 pt-1 w-100">
        <h3 class="fw-bold fst-italic texto-verde-oscuro m-0 pb-1" style="font-size: 1.1rem;">
          {{ cuatrimestreAutomatico }}
        </h3>
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
                            <img :src="fotoDocente(claseSeleccionada.docente) || '/logos/default-docente.png'" @error="$event.target.src = '/logos/default-docente.png'"
                                class="rounded-circle shadow bg-white mb-2" style="width: 120px; height: 120px; object-fit: cover; border: 4px solid white;">
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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import * as XLSX from 'xlsx';

const route = useRoute();
const API_URL = 'https://back-end-casilleros.onrender.com/horarios'; // Cambiar a Render en producción
const horarios = ref([]);

// CONTROL DE VISTAS
const vistaActiva = ref('individual');
const diaMatriz = ref('Lunes');
const grupoSeleccionado = ref('');
const maestroSeleccionado = ref('');

const laboratoriosList = [
  'Lab de Automatización - Pesado I', 'Lab Eléctrica - Pesado I', 'Lab Electrónica - Pesado I', 
  'Lab de Ciencias Básicas - Pesado I', 'Lab Manufactura - Pesado I', 'Lab Metrología - Pesado II', 'Cómputo III - Docencia II'
];
const aulasList = [
  'AU 106 Docencia III', 'AU 107 Docencia III', 'AU 108 Docencia III', 
  'AU 109 Docencia III', 'AU 110 Docencia III', 'AU 111 Docencia III', 
  'AU 406 Docencia IV', 'AU 407 Docencia IV', 'AU 408 Docencia IV', 'AU Virtual'
];

const espacioSeleccionado = ref(laboratoriosList[0]);
const diasList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const modalVisible = ref(false);
const claseSeleccionada = ref(null);

const bloquesHorarios = [
  { inicio: '07:00', fin: '08:00', tipo: 'clase' }, { inicio: '08:00', fin: '09:00', tipo: 'clase' },
  { inicio: '09:00', fin: '10:00', tipo: 'clase' }, { inicio: '10:00', fin: '11:00', tipo: 'clase' },
  { inicio: '11:00', fin: '12:00', tipo: 'clase' }, { inicio: '12:00', fin: '12:30', tipo: 'receso' },
  { inicio: '12:30', fin: '13:30', tipo: 'clase' }, { inicio: '13:30', fin: '14:30', tipo: 'clase' },
  { inicio: '14:30', fin: '15:30', tipo: 'clase' }, { inicio: '15:30', fin: '16:30', tipo: 'clase' },
  { inicio: '16:30', fin: '17:30', tipo: 'clase' }, { inicio: '17:30', fin: '18:30', tipo: 'clase' },
  { inicio: '18:30', fin: '19:30', tipo: 'clase' }, { inicio: '19:30', fin: '20:30', tipo: 'clase' }
];

// LISTAS DINÁMICAS
const gruposList = computed(() => {
  const lista = horarios.value.map(h => h.grupo).filter(g => g);
  return [...new Set(lista)].sort();
});

const maestrosList = computed(() => {
  const lista = horarios.value.map(h => h.docente).filter(d => d);
  return [...new Set(lista)].sort();
});

// CÁLCULO DE HORAS ACUMULADAS
// CÁLCULO DE HORAS ACUMULADAS (Versión Blindada y Precisa)
const horasTotalesMaestro = computed(() => {
  const clasesMaestro = horarios.value.filter(h => h.docente === maestroSeleccionado.value);
  let totalMinutos = 0;

  // 1. Agrupar todas las clases por día
  const clasesPorDia = {};
  
  clasesMaestro.forEach(c => {
    if (!c.horaInicio || !c.horaFin) return;
    
    let [hI, mI] = c.horaInicio.split(':').map(Number);
    let [hF, mF] = c.horaFin.split(':').map(Number);

    // CORRECCIÓN AUTOMÁTICA DE ERRORES DE CAPTURA (AM/PM)
    // Si la hora es menor a las 6:00, asumimos que es de la tarde (ej. 02:00 -> 14:00)
    if (hI < 6) hI += 12;
    if (hF < 6) hF += 12;
    // Si la hora final es menor a la inicial (ej. de 12:00 a 01:00), lo pasamos a PM
    if (hF < hI) hF += 12;

    const inicioMin = hI * 60 + mI;
    const finMin = hF * 60 + mF;

    if (!clasesPorDia[c.dia]) clasesPorDia[c.dia] = [];
    clasesPorDia[c.dia].push({ inicio: inicioMin, fin: finMin });
  });

  // 2. Fusionar horarios empalmados o duplicados para no contar horas dobles
  for (const dia in clasesPorDia) {
    let intervalos = clasesPorDia[dia];
    
    // Ordenamos las clases del día desde la más temprano a la más tarde
    intervalos.sort((a, b) => a.inicio - b.inicio);

    let fusionados = [];
    if (intervalos.length > 0) {
      fusionados.push(intervalos[0]);
      
      for (let i = 1; i < intervalos.length; i++) {
        let actual = intervalos[i];
        let ultimo = fusionados[fusionados.length - 1];

        // Si la clase actual choca o es a la misma hora que la anterior, las unimos
        if (actual.inicio <= ultimo.fin) {
          ultimo.fin = Math.max(ultimo.fin, actual.fin);
        } else {
          // Si no chocan, es un bloque de clase totalmente nuevo
          fusionados.push(actual);
        }
      }
    }

    // 3. Sumar los minutos reales que el docente estuvo trabajando
    fusionados.forEach(bloque => {
      totalMinutos += (bloque.fin - bloque.inicio);
    });
  }

  return (totalMinutos / 60).toFixed(1);
});

// LÓGICA DE EXCEL Y FILTROS
const buscarClaseMatriz = (dia, espacio, inicio) => {
  return horarios.value.filter(c => c.dia === dia && c.laboratorio === espacio && c.horaInicio <= inicio && c.horaFin > inicio);
};

// LÓGICA DE EXCEL Y FILTROS
const exportarExcel = () => {
    // Encabezado principal con los espacios exactos para que Excel combine las celdas
    const encabezadoSuperior = [
        "HORA", 
        "EDIFICIO PESADO 1 y 2", "", "", "", "", "", "", // 7 columnas para Pesado
        "DOCENCIA III (PB)", "", "", "", "", "",         // 6 columnas para Docencia III
        "DOCENCIA IV", "", "",                            // 3 columnas para Docencia IV
        "VIRTUAL", "", "",  
    ];
    
    // Todos los espacios (sin usar slice)
    const encabezadoEspacios = ["", ...laboratoriosList, ...aulasList];
    
    const cuerpoMatriz = bloquesHorarios.map(b => {
        const fila = [ `${b.inicio} - ${b.fin}` ];
        const todosLosEspacios = [...laboratoriosList, ...aulasList];
        
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

// MATRIZ HORARIO UNIVERSAL
// MATRIZ HORARIO UNIVERSAL
const matrizHorario = computed(() => {
  const matrix = [];
  // Este objeto controlará las celdas que debemos "saltarnos" porque una clase de arriba ya las cubrió con un rowspan
  const skipCells = { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0 };

  for (let r = 0; r < bloquesHorarios.length; r++) {
    const bloque = bloquesHorarios[r];
    const row = { bloque, celdas: {} };

    if (bloque.tipo !== 'receso') {
      for (const dia of diasList) {
        
        // 1. Si esta celda ya está cubierta por un rowspan de una hora anterior, la saltamos obligatoriamente
        if (skipCells[dia] > 0) {
          row.celdas[dia] = { render: false };
          skipCells[dia]--; // Descontamos 1 hora al bloque que estamos saltando
          continue;
        }

        let claseInicio;
        if (vistaActiva.value === 'individual') {
          claseInicio = horarios.value.find(c => c.dia === dia && c.laboratorio === espacioSeleccionado.value && c.horaInicio === bloque.inicio);
        } else if (vistaActiva.value === 'grupo') {
          claseInicio = horarios.value.find(c => c.dia === dia && c.grupo === grupoSeleccionado.value && c.horaInicio === bloque.inicio);
        } else {
          claseInicio = horarios.value.find(c => c.dia === dia && c.docente === maestroSeleccionado.value && c.horaInicio === bloque.inicio);
        }

        if (claseInicio) {
          let rowspan = 1;
          // Calcular cuántos bloques hacia abajo abarca esta clase
          for (let nextR = r + 1; nextR < bloquesHorarios.length; nextR++) {
            if (bloquesHorarios[nextR].tipo !== 'receso' && bloquesHorarios[nextR].inicio < claseInicio.horaFin) {
              rowspan++;
            } else {
              break;
            }
          }
          row.celdas[dia] = { render: true, rowspan, clase: claseInicio };
          
          // 2. Le decimos a las SIGUIENTES filas que NO se dibujen en esta columna durante 'X' bloques
          skipCells[dia] = rowspan - 1; 
          
        } else {
          // No hay clase, dibujamos celda vacía normal
          row.celdas[dia] = { render: true, rowspan: 1, clase: null };
        }
      }
    }
    matrix.push(row);
  }
  return matrix;
});

const cuatrimestreAutomatico = computed(() => {
  const mes = new Date().getMonth();
  const año = new Date().getFullYear();
  let periodo = (mes <= 3) ? "ENERO-ABRIL" : (mes <= 7) ? "MAYO-AGOSTO" : "SEPTIEMBRE-DICIEMBRE";
  return `HORARIO ESCOLAR ${periodo} ${año}`;
});

const getColorForGrupo = (grupo) => {
    const paleta = ['#1565C0', '#00695C', '#7B1FA2', '#D84315', '#C62828'];
    if (!grupo) return '#444';
    let hash = 0; for (let i = 0; i < grupo.length; i++) hash = grupo.charCodeAt(i) + ((hash << 5) - hash);
    return paleta[Math.abs(hash) % paleta.length];
};

// --- AGREGA ESTA FUNCIÓN AQUÍ ---
const fotoDocente = (nombreDocente) => {
  if (!nombreDocente) return null;
  // Limpia el nombre (quita acentos y espacios) para que coincida con el nombre de tu archivo .png
  const nombreArchivo = nombreDocente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_') + '.png';
  
  // Recuerda: si las fotos están en Render, pon la URL completa aquí (https://back-end-casilleros.onrender.com/maestros_manto/)
  // Si están en la carpeta public de Vue, déjalo así:
  return `/maestros_manto/${nombreArchivo}`;
};

const loadHorarios = async () => { try { const res = await axios.get(API_URL); horarios.value = res.data; } catch (err) { console.error(err); } };
const abrirDetalle = (clase) => { if (clase) { claseSeleccionada.value = clase; modalVisible.value = true; } };
const imprimirPDF = () => { window.print(); };
const fallbackLogo = (e) => { e.target.src = 'https://via.placeholder.com/150?text=Logo'; };

onMounted(async () => {
  await loadHorarios();
  if (gruposList.value.length > 0) grupoSeleccionado.value = gruposList.value[0];
  if (maestrosList.value.length > 0) maestroSeleccionado.value = maestrosList.value[0];
});
</script>

<style scoped>
/* =========================================
   ESTILOS GENERALES Y VISTA EN PANTALLA
========================================= */
.reporte-bg { background-color: #555; }

/* Contenedor principal: Tamaño carta horizontal estricto */
.hoja-horizontal { 
  background: white; 
  width: 27.94cm; 
  height: 21.59cm; 
  margin: 0 auto; 
  box-sizing: border-box; 
  padding: 5mm 8mm; /* Márgenes compactos */
  display: flex; 
  flex-direction: column; 
  /* Evita desbordamientos a nivel de hoja */
  overflow: hidden; 
}

.barra-verde { 
  background-color: #005b4f; 
  padding: 4px 20px 4px 15px; 
  border-radius: 0 20px 20px 0; 
  margin-left: -8mm; 
}

.texto-dorado { color: #b58c2a; letter-spacing: -1px; }

/* El encabezado no debe aplastarse */
header { flex-shrink: 0; }
.logo-top { height: 45px; object-fit: contain; }

/* =========================================
   MAGIA PARA UNA TABLA INMUTABLE
========================================= */
.table-container { 
  /* La tabla ocupa exactamente el espacio disponible entre header y footer, ni más ni menos */
  flex: 1 1 auto; 
  display: flex; 
  flex-direction: column; 
  margin: 4px 0;
  /* Crucial: Evita que el contenedor crezca más allá de su espacio asignado */
  min-height: 0; 
}

.horario-table { 
  height: 100%; /* Obliga a la tabla a estirarse a lo alto del contenedor */
  border: 2px solid black !important; 
  table-layout: fixed; /* Anchos de columna fijos y distribuidos equitativamente */
  margin: 0 !important;
}

/* 
   EL SECRETO: Celdas con alto estricto 
   Al usar height: 1%, forzamos al navegador a distribuir la altura de manera equitativa
   entre todas las filas, sin importar el contenido.
*/
.horario-table tr {
  height: 1%; 
}

.horario-table th, 
.horario-table td { 
  padding: 2px !important; 
  vertical-align: middle;
  /* Impide que la celda crezca por contenido largo */
  overflow: hidden; 
}

.header-verde { 
  background-color: #005b4f !important; 
  color: white !important; 
  font-size: 0.75rem; 
  height: 20px; /* Alto fijo para el encabezado de la tabla */
}

.bg-hora { 
  background-color: #cfd8dc !important; 
  font-size: 0.55rem; /* Hora más pequeña para ahorrar espacio */
  width: 75px;
}

.bg-receso { background-color: #e0e0e0 !important; font-size: 0.75rem; }

/* =========================================
   CONTENIDO DE LA CELDA (EL TEXTO)
========================================= */
.celda-clase {
  position: relative; /* Para posibles ajustes de posicionamiento interno */
}

/* Contenedor interno para el texto de la clase */
.clase-info { 
  text-align: center; 
  line-height: 0.95; /* Interlineado muy compacto */
  /* Flexbox para centrar sin expandir la celda padre */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%; /* Ocupa el espacio que la celda le da, sin forzarla a crecer */
}

/* 
   Ajuste de tipografías:
   Usamos clamp() si es posible, o tamaños muy pequeños para asegurar que quepan.
*/
.texto-grupo-color { 
  font-size: 0.7rem; 
  font-weight: 900; 
  margin-bottom: 1px;
}

.fs-docente { 
  font-size: 0.55rem; 
  color: #222; 
  margin-top: 1px;
  /* Permite que el nombre largo se rompa en varias líneas más fácil */
  word-wrap: break-word; 
}

.fs-materia { 
  font-size: 0.55rem; 
  color: #005b4f; 
  margin-top: 1px;
  word-wrap: break-word;
  /* Si la materia es excesivamente larga, se truncará con puntos suspensivos (...)
     en lugar de estirar la celda */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Máximo 3 líneas para la materia */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================================
   BLINDAJE DEL PIE DE PÁGINA (FOOTER)
========================================= */
footer {
  /* IMPIDE que el pie de página se aplaste o desaparezca */
  flex-shrink: 0; 
  margin-top: auto; 
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.logo-bottom { 
  height: 35px; /* Un poco más compacto */
  object-fit: contain; 
}

/* =========================================
   REGLAS DE IMPRESIÓN (PDF)
========================================= */
@media print {
  @page { size: letter landscape; margin: 0 !important; }
  
  nav, .navbar, header:not(.d-flex), .no-print { display: none !important; }

  html, body, #app, .reporte-bg {
    height: 100% !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important; 
  }

  body * { visibility: hidden !important; }
  .hoja-horizontal, .hoja-horizontal * { visibility: visible !important; }
  
  .hoja-horizontal { 
    position: absolute !important; 
    left: 0 !important; 
    top: 0 !important; 
    width: 27.94cm !important; 
    height: 21.59cm !important; 
    margin: 0 !important; 
    padding: 5mm 8mm !important; 
    box-sizing: border-box !important;
    background-color: white !important; 
    z-index: 9999 !important; 
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
  }
  
  * { 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }
}
</style>
