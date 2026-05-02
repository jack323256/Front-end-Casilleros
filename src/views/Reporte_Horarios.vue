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

        <div class="col-md-3 text-end d-flex gap-2 justify-content-end">
          <template v-if="vistaActiva !== 'matriz'">
            <!-- Botón de PDF existente -->
            <button class="btn btn-sm btn-danger shadow-sm fw-bold px-3" @click="imprimirPDF">
              <i class="bi bi-printer-fill me-1"></i> Imprimir PDF
            </button>
            
            <!-- NUEVO: Botón de Imagen JPG -->
            <button class="btn btn-sm btn-warning shadow-sm fw-bold px-3 text-dark" @click="descargarImagen">
              <i class="bi bi-image-fill me-1"></i> Descargar JPG
            </button>
          </template>
        
          <button v-else class="btn btn-sm btn-success shadow-sm fw-bold px-3" @click="exportarExcel">
            <i class="bi bi-file-earmark-excel-fill me-1"></i> Descargar Excel
          </button>
        </div>
      </div>
    </div>

    <div v-if="vistaActiva !== 'matriz'" class="hoja-horizontal shadow">
      
      <!-- ELEMENTOS DE FONDO (CAPA DETRÁS DE TODO) -->
      <div class="industrial-bg-pattern"></div>
      <div class="watermark-gears"></div>

    <!-- NUEVO: Contenedor de Siluetas Técnicas -->
      <div class="technical-silhouettes">
        <i class="bi bi-wrench silhouette item-1"></i>
        <i class="bi bi-gear-fill silhouette item-2"></i>
        <i class="bi bi-cpu silhouette item-3"></i>
        <i class="bi bi-droplet-fill silhouette item-4"></i> <!-- Para área de Petróleo -->
        <i class="bi bi-robot silhouette item-5"></i>
        <i class="bi bi-lightning-fill silhouette item-6"></i>
        <i class="bi bi-tools silhouette item-7"></i>
        <i class="bi bi-pci-card silhouette item-8"></i>
      </div>
      

      <!-- ENCABEZADO ESTILIZADO -->
      <header class="d-flex justify-content-between align-items-center w-100 mb-2 header-industrial">
        <div class="d-flex flex-column align-items-start">
          <div class="barra-verde-industrial shadow-sm">
            <h2 class="fw-bold fst-italic m-0 text-white" style="font-size: 1.2rem;">
              <i class="bi bi-gear-fill me-2"></i>Academia de Mantenimiento Industrial
            </h2>
          </div>
          <h1 class="texto-dorado-industrial fw-bold fst-italic mt-1" style="margin-left: 1.5rem; font-size: 1.8rem;">
            {{ vistaActiva === 'individual' ? espacioSeleccionado : vistaActiva === 'grupo' ? 'Grupo: ' + grupoSeleccionado : 'Docente: ' + maestroSeleccionado }}
            <span v-if="vistaActiva === 'maestro'" class="badge bg-dark ms-3 fs-6">
               Carga: {{ horasTotalesMaestro }} hrs/semana
            </span>
          </h1>
        </div>
        <div class="logo-container">
          <img src="/logos/logo-mantenimiento.png" alt="Mascota" class="logo-top-large" @error="fallbackLogo">
        </div>
      </header>

      <!-- TABLA DE HORARIOS (EL CONTENIDO ES EL MISMO) -->
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

      <!-- PIE DE PÁGINA INDUSTRIAL -->
      <footer class="footer-industrial mt-1 pt-1">
        <div class="footer-line"></div>
        <div class="d-flex justify-content-between align-items-end w-100">
           <h3 class="fw-bold fst-italic texto-verde-oscuro m-0" style="font-size: 1.1rem;">
             {{ cuatrimestreAutomatico }}
           </h3>
           <img src="/logos/somos_mantenimeinto.png" alt="UTXJ" class="logo-bottom-large" @error="fallbackLogo">
        </div>
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
import html2canvas from 'html2canvas';


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
  'Lab de Ciencias Básicas - Pesado I', 'Lab Manufactura - Pesado II', 'Lab Metrología - Pesado II', 'Cómputo III - Docencia II'
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
// MATRIZ HORARIO UNIVERSAL OPTIMIZADA
const matrizHorario = computed(() => {
  const matrix = [];
  const skipCells = { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0 };

  // 1. Construimos la matriz completa como lo hacíamos antes
  for (let r = 0; r < bloquesHorarios.length; r++) {
    const bloque = bloquesHorarios[r];
    const row = { bloque, celdas: {} };

    if (bloque.tipo !== 'receso') {
      for (const dia of diasList) {
        if (skipCells[dia] > 0) {
          row.celdas[dia] = { render: false };
          skipCells[dia]--;
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
          for (let nextR = r + 1; nextR < bloquesHorarios.length; nextR++) {
            if (bloquesHorarios[nextR].tipo !== 'receso' && bloquesHorarios[nextR].inicio < claseInicio.horaFin) {
              rowspan++;
            } else {
              break;
            }
          }
          row.celdas[dia] = { render: true, rowspan, clase: claseInicio };
          skipCells[dia] = rowspan - 1; 
        } else {
          row.celdas[dia] = { render: true, rowspan: 1, clase: null };
        }
      }
    }
    matrix.push(row);
  }

  // =========================================================
  // 2. FILTRO INTELIGENTE PARA APROVECHAR EL ESPACIO
  // =========================================================
  
  let ultimoIndiceConClase = -1;

  // Escaneamos la matriz para encontrar la ÚLTIMA fila que tiene contenido
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    let filaOcupada = false;

    if (row.bloque.tipo !== 'receso') {
      for (const dia of diasList) {
        // ¿Hay una clase aquí? (render: true y clase existe) 
        // ¿O hay una clase pasando por aquí desde arriba? (render: false)
        if ((row.celdas[dia].render && row.celdas[dia].clase) || !row.celdas[dia].render) {
          filaOcupada = true;
          break;
        }
      }
    } else {
      // Marcamos temporalmente el receso como ocupado para evaluarlo
      filaOcupada = true;
    }

    if (filaOcupada) {
      ultimoIndiceConClase = i;
    }
  }

  // Si el último bloque con "contenido" es el RECESO, lo eliminamos también 
  // (no tiene caso mostrar un receso si ya no hay clases después)
  while (ultimoIndiceConClase >= 0 && matrix[ultimoIndiceConClase].bloque.tipo === 'receso') {
    ultimoIndiceConClase--;
  }

  // 3. Recortar la matriz
  if (ultimoIndiceConClase !== -1) {
    // Para que la tabla no se vea extraña si alguien solo tiene clase a las 7:00 AM,
    // le decimos que POR LO MENOS dibuje hasta el receso (índice 5).
    const indiceSanoMinimo = Math.max(ultimoIndiceConClase, 5);
    
    // Retornamos la matriz cortada exactamente donde terminan las clases
    return matrix.slice(0, indiceSanoMinimo + 1);
  }

  // Si no hay ninguna clase programada en toda la semana, devolvemos al menos hasta el receso
  return matrix.slice(0, 6);
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

const descargarImagen = async () => {
  const elemento = document.querySelector('.hoja-horizontal');
  if (!elemento) return;

  try {
    const canvas = await html2canvas(elemento, {
      scale: 3,
      useCORS: true, // Esto es vital para tus logos de Render
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY, // Corrige posición si hay scroll
      onclone: (clonedDoc) => {
        // Asegura que el clon sea visible para la captura
        clonedDoc.querySelector('.hoja-horizontal').style.display = 'flex';
      }
    });

    const link = document.createElement('a');
    link.download = `Horario_Industrial_${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  } catch (err) {
    console.error("Error capturando imagen:", err);
  }
};



  
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
.reporte-bg { 
  background-color: #555; 
}

/* Contenedor principal: Tamaño carta horizontal */
.hoja-horizontal { 
  background: white; 
  width: 27.94cm; 
  height: 21.59cm; 
  margin: 0 auto; 
  box-sizing: border-box; 
  padding: 5mm 8mm; /* Márgenes compactos */
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  transform: scale(1);
  position: relative; /* Necesario para posicionar los fondos */
  z-index: 1;
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
   MAGIA PARA UNA TABLA INMUTABLE Y BORDES (PDF)
========================================= */
.table-container { 
  flex: 1 1 auto; 
  display: flex; 
  flex-direction: column; 
  margin: 4px 0;
  min-height: 0; /* Vital para que no desborde */
}

.horario-table { 
  height: 100%; 
  width: 100%;
  border-collapse: collapse !important; /* CRUCIAL para líneas nítidas en PDF */
  table-layout: fixed; 
  margin: 0 !important;
  border: 1.5pt solid #000 !important; /* Borde exterior en PUNTOS */
}

.horario-table tr {
  height: 1%; /* Fuerza altura equitativa de las filas */
}

.horario-table th, 
.horario-table td { 
  border: 0.75pt solid #000 !important; /* Bordes internos finos en PUNTOS */
  padding: 2px !important; 
  vertical-align: middle;
  overflow: hidden; 
}

.header-verde { 
  background-color: #005b4f !important; 
  color: white !important; 
  font-size: 0.75rem; 
  height: 20px; 
}

.bg-hora { 
  background-color: #cfd8dc !important; 
  font-size: 0.55rem; 
  width: 75px;
}

.bg-receso { background-color: #e0e0e0 !important; font-size: 0.75rem; }

/* =========================================
   CONTENIDO DE LA CELDA (TEXTO AJUSTABLE)
========================================= */
.celda-clase { position: relative; }

.clase-info { 
  text-align: center; 
  line-height: 0.95; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%; 
}

.texto-grupo-color { 
  font-size: 0.7rem; 
  font-weight: 900; 
  margin-bottom: 1px;
}

.fs-docente { 
  font-size: 0.55rem; 
  color: #222; 
  margin-top: 1px;
  word-wrap: break-word; 
}

.fs-materia { 
  font-size: 0.55rem; 
  color: #005b4f; 
  margin-top: 1px;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Trunca el texto a 3 líneas si es muy largo */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* =========================================
   BLINDAJE DEL PIE DE PÁGINA (FOOTER)
========================================= */
footer {
  flex-shrink: 0; /* Impide que el footer se aplaste */
  margin-top: auto; 
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.logo-bottom { 
  height: 35px; 
  object-fit: contain; 
}

.industrial-bg-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* Crea una textura de líneas técnicas sutiles */
  background-image: 
    linear-gradient(rgba(0, 91, 79, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 91, 79, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: -2;
}

.watermark-gears {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background-image: url('https://cdn-icons-png.flaticon.com/512/3524/3524659.png'); /* Puedes usar un SVG local de engranaje */
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.04; /* Casi invisible para no molestar la lectura */
  z-index: -1;
}

/* Logos más grandes y con presencia */
.logo-top-large {
  height: 90px; /* Aumentado de 45px */
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.logo-bottom-large {
  height: 70px; /* Aumentado de 35px */
}

/* Barra de título con estilo de "placa" industrial */
.barra-verde-industrial {
  background: linear-gradient(135deg, #005b4f 0%, #003d35 100%);
  padding: 8px 30px 8px 20px;
  border-left: 5px solid #b58c2a;
  border-radius: 0 25px 25px 0;
  margin-left: -8mm;
  box-shadow: 3px 3px 6px rgba(0,0,0,0.2);
}

.texto-dorado-industrial {
  color: #a37a1e;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
}

/* Bordes de tabla más "técnicos" */
.horario-table {
  border: 2px solid #000 !important;
  background-color: rgba(255, 255, 255, 0.85) !important; /* Ligeramente transparente para ver el fondo */
  backdrop-filter: blur(2px);
}

.header-verde {
  background: #004d40 !important;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.8rem;
}

/* Estilo para el receso con rayas de seguridad */
.bg-receso {
  background: repeating-linear-gradient(
    45deg,
    #f0f0f0,
    #f0f0f0 10px,
    #e8e8e8 10px,
    #e8e8e8 20px
  ) !important;
  color: #666 !important;
  font-style: italic;
}

/* Línea decorativa en el footer */
.footer-line {
  height: 3px;
  background: linear-gradient(90deg, #005b4f, #b58c2a, transparent);
  margin-bottom: 5px;
  border-radius: 2px;
}

/* Ajuste de celdas para mayor legibilidad con logos grandes */
.celda-clase:hover {
  background-color: rgba(0, 91, 79, 0.05); /* Efecto hover en pantalla */
}

/* =========================================
   SILUETAS TÉCNICAS DE FONDO
========================================= */
.technical-silhouettes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* No interfiere con clics en la tabla */
  z-index: 1;
  overflow: hidden;
}

.silhouette {
  position: absolute;
  color: #005b4f;
  /* Subimos la opacidad de 0.035 a 0.07 para que sean perceptibles */
  opacity: 0.07 !important; 
  font-size: 5rem;
  /* Aseguramos que el navegador no los oculte por optimización */
  display: block !important;
  font-style: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}

/* Posiciones y rotaciones "al azar" para dar dinamismo */
.item-1 { top: 10%; left: 5%; transform: rotate(-15deg); font-size: 6rem; }
.item-2 { top: 15%; right: 10%; transform: rotate(20deg); font-size: 4rem; }
.item-3 { bottom: 20%; left: 8%; transform: rotate(10deg); font-size: 5rem; }
.item-4 { bottom: 10%; right: 15%; transform: rotate(-10deg); font-size: 7rem; }
.item-5 { top: 45%; left: 2%; transform: rotate(45deg); font-size: 6rem; }
.item-6 { top: 50%; right: 3%; transform: rotate(-25deg); font-size: 5rem; }
.item-7 { bottom: 40%; right: 8%; transform: rotate(15deg); font-size: 8rem; }
.item-8 { top: 5%; left: 40%; transform: rotate(-5deg); font-size: 4rem; }

/* Ajuste adicional para asegurar que la tabla sea legible */
.horario-table {
  /* ... tus estilos anteriores ... */
  background-color: rgba(255, 255, 255, 0.9) !important; /* Un poco más de opacidad blanca */
  position: relative;
  z-index: 5;
}

/* =========================================
   REGLAS DE IMPRESIÓN (PDF Y TAMAÑO CARTA)
========================================= */

  /* Asegúrate de que esto esté así para que la captura sea limpia */
.hoja-horizontal {
    /* ... tus estilos anteriores ... */
    transform: scale(1); /* Estabiliza la captura en algunos navegadores */
}

@media screen {
    /* Estilo del botón amarillo para que combine con el estilo industrial */
    .btn-warning {
        background-color: #b58c2a !important;
        border-color: #a37a1e !important;
        color: white !important;
    }
}

  
  
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
    /* Tolerancia de 1-2 mm para evitar choques con el límite del papel del navegador */
    width: 27.8cm !important; 
    height: 21.4cm !important; 
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
    /* Obliga al motor de renderizado a suavizar vectores, textos y líneas (Adiós bordes feos) */
    text-rendering: optimizeLegibility !important; 
  }
}
</style>
