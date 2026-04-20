import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import Dashboard from '../views/Dashboard.vue'
import Bitacora from '../views/Bitacora.vue'
import Horarios from '../views/Horarios.vue'
import Inventario from '../views/Inventario.vue'  // ← NUEVA IMPORTACIÓN
import Prestamos from '../views/Prestamos.vue'
import Aulas from '../views/Aulas.vue'
import Evidencias_Mateniminto from '../views/Evidencias_Mateniminto.vue'  // ← NUEVA IMPORTACIÓN
import Reporte_Horarios from '../views/Reporte_Horarios.vue'; // Asegúrate de que la ruta del archivo sea correcta


const routes = [
  { path: '/', component: App },
  { path: '/dashboard', component: Dashboard },
  { path: '/bitacora', component: Bitacora },
  { path: '/horarios', component: Horarios },
  { path: '/inventario', component: Inventario },  // ← NUEVA RUTA
  { path: '/prestamos', component: Prestamos },
  { path: '/aulas', component: Aulas },
  { path: '/evidencias-mantenimiento', component: Evidencias_Mateniminto },  // ← NUEVA RUTA
  { path: '/reporte-horarios', component: Reporte_Horarios }  // ← NUEVA RUTA
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router