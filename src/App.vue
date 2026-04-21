<template>
  <div>
    <!-- Barra de navegación fija con menú hamburguesa -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm fixed-top">
      <div class="container-fluid">
        <!-- Título / Logo -->
<router-link to="/" class="navbar-brand fw-bold d-flex align-items-center">
<img 
    src="/logos/Somos_Mantenimiento.png" 
    alt="Logo Mantenimiento" 
    class="me-2 rounded bg-light shadow-sm p-1" 
    style="height: 2em; width: auto; vertical-align: middle;"
/>
  Mantenimeinto
</router-link>
        <!-- Botón hamburguesa -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Menú colapsable -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link 
                to="/" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-list-ul me-1"></i> Lista de Casilleros
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/dashboard" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-graph-up me-1"></i> Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/bitacora" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-journal-text me-1"></i> Bitácora
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/horarios" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-calendar3 me-1"></i> Horarios Labs
              </router-link>
            </li>

            <li class="nav-item">
              <router-link 
                to="/aulas" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-calendar2 me-2"></i> Horarios Aulas
              </router-link>
            </li>

            <li class="nav-item">
              <router-link 
                to="/evidencias-mantenimiento" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-calendar2 me-2"></i> Evidencias Mantenimiento
              </router-link>
            </li>

            <li class="nav-item">
              <router-link 
                to="/inventario" 
                class="nav-link px-3" 
                active-class="active"
                @click="closeNavbar"
              >
                <i class="bi bi-box-seam me-1"></i> Inventario
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/prestamos" class="nav-link px-3" active-class="active" @click="closeNavbar">
                <i class="bi bi-box-arrow-up me-1"></i> Préstamos
              </router-link>
            </li>

            <li class="nav-item">
              <button 
                class="nav-link btn btn-link px-3" 
                @click="toggleDarkMode"
                title="Cambiar tema"
              >
                <i class="bi" :class="isDark ? 'bi-sun' : 'bi-moon-stars'"></i>
                <span class="d-none d-md-inline ms-2">{{ isDark ? 'Claro' : 'Oscuro' }}</span>
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido principal (más ancho y responsivo) -->
    <div class="container-fluid px-3 px-md-4 px-lg-5 mt-5 pt-5">
      <!-- Vista Lista (solo cuando estamos en /) -->
      <div v-if="$route.path === '/'">
        <h1 class="text-center mb-4 text-primary fw-bold fs-3 fs-md-2">Administración de Casilleros</h1>

        <div class="card shadow mb-4">
          <div class="card-body">
            <!-- Búsqueda + Botón Nuevo (mejor en móvil) -->
<!-- Botón Nuevo Casillero (más equilibrado) -->
<div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
  <input 
    v-model="search" 
    type="text" 
    class="form-control" 
    placeholder="Buscar por alumno, matrícula o casillero..." 
  />
  <button class="btn btn-success px-4 py-2 w-md-auto shadow-sm" @click="openModal()">
    <i class="bi bi-plus-circle me-2"></i>
    <span class="d-none d-sm-inline"></span>
    <span class="d-inline d-sm-none">Nuevo</span>
  </button>
</div>

            <!-- Tabla responsiva con columnas ocultas en móvil -->
            <div class="table-responsive">
              <table class="table table-hover align-middle table-sm">
                <thead class="table-primary">
                  <tr>
                    <th class="d-none d-md-table-cell">ID</th>
                    <th>Alumno</th>
                    <th class="d-none d-lg-table-cell">Cuatrimestre</th>
                    <th class="d-none d-md-table-cell">Grupo</th>
                    <th>Matrícula</th>
                    <th class="d-none d-lg-table-cell">Casillero</th>
                    <th class="d-none d-xl-table-cell">Periodo</th>
                    <th class="d-none d-xl-table-cell">Fecha Préstamo</th>
                    <th class="d-none d-lg-table-cell">Estado</th>
                    <th class="d-none d-md-table-cell">En Uso</th>
                    <th class="d-none d-lg-table-cell">Foto</th>
                    <th class="d-none d-md-table-cell">Celular</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedAssignments" :key="item.id">
                    <td class="d-none d-md-table-cell">{{ item.id }}</td>
                    <td><strong>{{ item.alumno }}</strong></td>
                    <td class="d-none d-lg-table-cell">
                      <span class="badge fs-6" :class="getCuatrimestreClass(item.cuatrimestre)">
                        {{ getCuatrimestreText(item.cuatrimestre) }}
                      </span>
                    </td>
                    <td class="d-none d-md-table-cell">
                      <span class="badge bg-secondary">{{ item.grupo }}</span>
                    </td>
                    <td>{{ item.matricula }}</td>
                    <td class="d-none d-lg-table-cell"><strong>#{{ item.numero_casillero }}</strong></td>
                    <td class="d-none d-xl-table-cell">{{ item.periodo }}</td>
                    <td class="d-none d-xl-table-cell">{{ item.fecha_prestamo || '—' }}</td>
                    <td class="d-none d-lg-table-cell">
                      <span class="badge fs-6" :class="getEstadoPagoClass(item)">
                        {{ getEstadoPagoText(item) }}
                      </span>
                    </td>
                    <td class="d-none d-md-table-cell">
                      <span class="badge" :class="item.en_uso === 'Si' ? 'bg-primary' : 'bg-warning'">
                        {{ item.en_uso || 'No' }}
                      </span>
                    </td>
                    <td class="d-none d-lg-table-cell text-center">
                      <div v-if="item.foto_credencial">
                        <img 
                          :src="UPLOAD_URL + item.foto_credencial" 
                          class="img-thumbnail cursor-pointer" 
                          style="width: 60px; height: 60px; object-fit: cover;" 
                          @click="openImageModal(UPLOAD_URL + item.foto_credencial)"
                          alt="Credencial"
                          title="Clic para ampliar"
                        />
                      </div>
                      <div v-else class="text-muted">
                        <i class="bi bi-person-circle fs-3"></i><br>
                        <small>Sin foto</small>
                      </div>
                    </td>
                    <td class="d-none d-md-table-cell text-center">
                      <div v-if="item.celular">
                        <div class="d-flex flex-column gap-1">
                          <a :href="'https://wa.me/52' + item.celular" target="_blank" class="btn btn-success btn-sm" title="Enviar mensaje por WhatsApp">
                            <i class="bi bi-whatsapp"></i>
                          </a>
                          <a :href="'tel:' + item.celular" class="btn btn-primary btn-sm" title="Llamar">
                            <i class="bi bi-telephone-fill"></i>
                          </a>
                        </div>
                        <small class="text-muted d-block mt-1">{{ item.celular }}</small>
                      </div>
                      <div v-else class="text-muted">
                        <small>Sin celular</small>
                      </div>
                    </td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" @click="openModal(item)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" @click="deleteAssignment(item.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginación -->
            <nav aria-label="Paginación">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--">Anterior</button>
                </li>
                <li class="page-item active">
                  <span class="page-link">{{ currentPage }} / {{ totalPages }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++">Siguiente</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Modal de edición RESPONSIVO -->
        <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down">
            <div class="modal-content shadow-lg">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title">{{ form.id ? 'Editar' : 'Nuevo' }} Casillero</h5>
                <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveAssignment">
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-bold">Alumno</label>
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

                    <!-- SELECT PARA TUTORES -->
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
                      <label class="form-label">Celular</label>
                      <input v-model="form.celular" class="form-control" :class="{ 'is-warning': celularExistente }" required />
                      <div v-if="celularExistente" class="text-warning mt-1">
                        <i class="bi bi-info-circle me-1"></i> Este celular ya está registrado
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label">Matrícula</label>
                      <input v-model="form.matricula" class="form-control" :class="{ 'is-invalid': matriculaExistente }" required />
                      <div v-if="matriculaExistente" class="text-danger mt-1">
                        <i class="bi bi-exclamation-triangle me-1"></i> Matrícula ya registrada
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Número de Casillero</label>
                      <input v-model.number="form.numero_casillero" type="number" class="form-control" :class="{ 'is-invalid': casilleroOcupado }" required />
                      <div v-if="casilleroOcupado" class="text-danger mt-1">
                        <i class="bi bi-exclamation-triangle me-1"></i> Casillero ya ocupado
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label fw-bold">Periodo</label>
                      <select v-model="form.periodo" class="form-select" required>
                        <option v-for="p in periodosDisponibles" :value="p.value" :key="p.value">
                          {{ p.label }}
                        </option>
                      </select>
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label">Fecha Préstamo</label>
                      <input v-model="form.fecha_prestamo" type="date" class="form-control" required />
                      <div v-if="form.fecha_prestamo && form.periodo" class="mt-2">
                        <span class="badge fs-5" :class="getEstadoPagoClass(form)">
                          {{ getEstadoPagoText(form) }}
                        </span>
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label">En Uso</label>
                      <select v-model="form.en_uso" class="form-select">
                        <option value="">No</option>
                        <option value="Si">Sí</option>
                      </select>
                    </div>
                  </div>

                  <!-- Notas -->
                  <div class="row mt-4">
                    <div class="col-12">
                      <label class="form-label fw-bold">Notas / Observaciones del Casillero</label>
                      <textarea v-model="form.notas" class="form-control" rows="4" placeholder="Ej: Puerta floja, falta llave, rayones..."></textarea>
                      <small class="text-muted">Información adicional sobre el estado físico del casillero</small>
                    </div>
                  </div>

                  <!-- Fotos -->
                  <div class="row mt-4">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Foto Credencial</label>
                      <input type="file" @change="onFileChange($event, 'foto_credencial')" class="form-control" accept="image/*" />
                      <div class="mt-2 text-center">
                        <img v-if="previewCredencial" :src="previewCredencial" class="img-thumbnail rounded" style="max-height: 200px;" />
                        <img v-else-if="form.foto_credencial" :src="UPLOAD_URL + form.foto_credencial" class="img-thumbnail rounded" style="max-height: 200px;" />
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Foto Casillero</label>
                      <input type="file" @change="onFileChange($event, 'foto_casillero')" class="form-control" accept="image/*" />
                      <div class="mt-2 text-center">
                        <img v-if="previewCasillero" :src="previewCasillero" class="img-thumbnail rounded" style="max-height: 200px;" />
                        <img v-else-if="form.foto_casillero" :src="UPLOAD_URL + form.foto_casillero" class="img-thumbnail rounded" style="max-height: 200px;" />
                      </div>
                    </div>
                  </div>

                  <div class="modal-footer mt-4 d-flex flex-column flex-md-row justify-content-end">
                    <button type="button" class="btn btn-secondary mb-2 mb-md-0 me-md-2" @click="closeModal">Cancelar</button>
                    <button type="submit" class="btn btn-primary btn-lg w-100 w-md-auto" :disabled="!isValidForm">
                      <i class="bi bi-save me-2"></i>{{ form.id ? 'Actualizar' : 'Guardar' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de imagen grande -->
        <div v-if="showImageModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 bg-transparent">
              <div class="text-end mb-2">
                <button type="button" class="btn-close btn-close-white" @click="closeImageModal"></button>
              </div>
              <div class="text-center">
                <img :src="currentImage" class="img-fluid rounded shadow-lg" style="max-height: 80vh; max-width: 90vw;" alt="Credencial ampliada" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Dashboard y otras -->
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { toast } from 'vue3-toastify'

const API_URL = 'https://back-end-casilleros.onrender.com/assignments'

export default {
  data() {
    return {
      UPLOAD_URL: 'https://back-end-casilleros.onrender.com/uploads/',
      assignments: [],
      search: '',
      showModal: false,
      showImageModal: false,
      currentImage: '',
      currentPage: 1,
      itemsPerPage: 20,
      form: {
        id: null,
        alumno: '',
        cuatrimestre: 4,
        grupo: 'C',
        tutor: '',
        celular: '',
        matricula: '',
        numero_casillero: null,
        periodo: '',
        en_uso: '',
        fecha_prestamo: '',
        foto_credencial: null,
        foto_casillero: null,
        notas: ''
      },
      previewCredencial: null,
      previewCasillero: null
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    periodosDisponibles() {
      return [
        { label: `Enero - Abril ${this.currentYear}`, value: `Enero - Abril ${this.currentYear}` },
        { label: `Mayo - Agosto ${this.currentYear}`, value: `Mayo - Agosto ${this.currentYear}` },
        { label: `Septiembre - Diciembre ${this.currentYear}`, value: `Septiembre - Diciembre ${this.currentYear}` }
      ]
    },
    filteredAssignments() {
      if (!this.search) return this.assignments
      const s = this.search.toLowerCase()
      return this.assignments.filter(item =>
        item.alumno.toLowerCase().includes(s) ||
        item.matricula.toLowerCase().includes(s) ||
        item.numero_casillero.toString().includes(s)
      )
    },
    totalPages() {
      return Math.ceil(this.filteredAssignments.length / this.itemsPerPage)
    },
    paginatedAssignments() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredAssignments.slice(start, start + this.itemsPerPage)
    },
    matriculaExistente() {
      if (!this.form.matricula || this.form.id) return false
      return this.assignments.some(a => a.matricula === this.form.matricula)
    },
    casilleroOcupado() {
      if (!this.form.numero_casillero || this.form.id) return false
      return this.assignments.some(a => a.numero_casillero === this.form.numero_casillero)
    },
    celularExistente() {
      if (!this.form.celular || this.form.id) return false
      return this.assignments.some(a => a.celular === this.form.celular)
    },
    isValidForm() {
      return !this.matriculaExistente && !this.casilleroOcupado
    }
  },
  mounted() {
    this.loadAssignments()
    this.form.periodo = this.periodosDisponibles[2].value
  },
  methods: {
    closeNavbar() {
      const navbarCollapse = document.getElementById('navbarNav')
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
          toggle: false
        })
        bsCollapse.hide()
      }
    },
    async loadAssignments() {
      try {
        const res = await axios.get(API_URL)
        this.assignments = res.data
      } catch (err) {
        toast.error('Error al cargar datos')
      }
    },
    openModal(item = null) {
      if (item) {
        this.form = { 
          ...item, 
          notas: item.notas || ''
        }
        this.previewCredencial = item.foto_credencial ? this.UPLOAD_URL + item.foto_credencial : null
        this.previewCasillero = item.foto_casillero ? this.UPLOAD_URL + item.foto_casillero : null
      } else {
        this.form = {
          id: null,
          alumno: '',
          cuatrimestre: 4,
          grupo: 'C',
          tutor: '',
          celular: '',
          matricula: '',
          numero_casillero: null,
          periodo: this.periodosDisponibles[2].value,
          en_uso: '',
          fecha_prestamo: new Date().toISOString().split('T')[0],
          foto_credencial: null,
          foto_casillero: null,
          notas: ''
        }
        this.previewCredencial = null
        this.previewCasillero = null
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    openImageModal(imageUrl) {
      this.currentImage = imageUrl
      this.showImageModal = true
    },
    closeImageModal() {
      this.showImageModal = false
      this.currentImage = ''
    },
    onFileChange(e, field) {
      const file = e.target.files[0]
      if (file) {
        this.form[field] = file
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (field === 'foto_credencial') this.previewCredencial = ev.target.result
          else this.previewCasillero = ev.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async saveAssignment() {
      if (this.matriculaExistente) {
        toast.error('Esta matrícula ya está registrada')
        return
      }
      if (this.casilleroOcupado) {
        toast.error('Este número de casillero ya está ocupado')
        return
      }

      const formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key] !== null && this.form[key] !== undefined) {
          formData.append(key, this.form[key])
        }
      })

      try {
        if (this.form.id) {
          await axios.put(`${API_URL}/${this.form.id}`, formData)
          toast.success('¡Actualizado correctamente!')
        } else {
          await axios.post(API_URL, formData)
          toast.success('¡Casillero creado!')
        }
        this.loadAssignments()
        this.closeModal()
      } catch (err) {
        toast.error('Error al guardar')
      }
    },
    async deleteAssignment(id) {
      if (!confirm('¿Seguro que quieres eliminar este casillero?')) return
      try {
        await axios.delete(`${API_URL}/${id}`)
        toast.success('Eliminado')
        this.loadAssignments()
      } catch (err) {
        toast.error('Error al eliminar')
      }
    },
    getEstadoPagoText(item) {
      if (!item.fecha_prestamo || !item.periodo) return 'Sin fecha'
      const fecha = new Date(item.fecha_prestamo)
      const month = fecha.getMonth() + 1
      if (item.periodo.includes('Enero - Abril') && month >= 1 && month <= 4) return 'Al día'
      if (item.periodo.includes('Mayo - Agosto') && month >= 5 && month <= 8) return 'Al día'
      if (item.periodo.includes('Septiembre - Diciembre') && month >= 9 && month <= 12) return 'Al día'
      return 'Adeudo'
    },
    getEstadoPagoClass(item) {
      return this.getEstadoPagoText(item) === 'Adeudo' ? 'bg-danger' : 'bg-success'
    },
    getCuatrimestreText(cuatrimestre) {
      if (cuatrimestre === 6 || cuatrimestre === 11) {
        return `${cuatrimestre} - Estadia`
      }
      return cuatrimestre
    },
    getCuatrimestreClass(cuatrimestre) {
      if (cuatrimestre === 6 || cuatrimestre === 11) {
        return 'bg-secondary'
      }
      return 'bg-info'
    }
  }
}
</script>

<style>
.navbar .nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-weight: bold;
}

.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}
.cursor-pointer:hover {
  transform: scale(1.1);
}

.is-warning {
  border-color: #ffc107 !important;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
}

/* Mejoras responsivas en móvil */
@media (max-width: 767px) {
  .btn-lg {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
  .form-control {
    font-size: 1rem;
  }
}
</style>
