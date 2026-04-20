<template>
  <div>
    <h1 class="text-center mb-4 text-primary fw-bold fs-3">Gestión de Inventario MANTO</h1>

    <div class="card shadow mb-4">
      <div class="card-body">
        <!-- Búsqueda + Botón Nuevo -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
          <input 
            v-model.trim="search" 
            type="text" 
            class="form-control" 
            placeholder="Buscar por código, nombre, categoría o ubicación..." 
          />
          <button class="btn btn-success px-4 py-2 w-md-auto shadow-sm" @click="openModal(null, true)">
            <i class="bi bi-plus-circle me-2"></i>
            <span class="d-none d-sm-inline">Nuevo Item</span>
            <span class="d-inline d-sm-none">Nuevo</span>
          </button>
        </div>

        <!-- Mensajes -->
        <div v-if="loading" class="alert alert-info text-center">
          Cargando inventario...
        </div>
        <div v-else-if="groupedItems.length === 0" class="alert alert-info text-center">
          No hay items en el inventario aún. ¡Agrega el primero con el botón arriba!
        </div>
        <div v-else-if="paginatedGroups.length === 0" class="alert alert-warning text-center">
          No hay resultados para la búsqueda "<strong>{{ search }}</strong>". Limpia el filtro.
        </div>

        <!-- Tabla con agrupación -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle table-sm table-bordered">
            <thead class="table-primary">
              <tr>
                <th style="width: 60px;"></th> <!-- Expander -->
                <th>Nombre del Material</th>
                <th class="d-none d-lg-table-cell">Categoría</th>
                <th class="d-none d-md-table-cell">Cantidad Total</th>
                <th class="d-none d-md-table-cell">Disponible</th>
                <th class="d-none d-lg-table-cell">Ubicación Principal</th>
                <th class="d-none d-lg-table-cell">Foto</th>
                <th class="d-none d-md-table-cell">Estado</th>
                <th style="width: 200px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(group, index) in paginatedGroups" :key="group.key">
                <!-- Fila principal del grupo -->
                <tr class="table-group" :class="{'bg-light': index % 2 === 0, 'bg-white': index % 2 !== 0}">
                  <td class="text-center">
                    <button 
                      class="btn btn-link p-0 text-decoration-none expander-btn"
                      @click="toggleGroup(index)"
                      title="Expandir / Contraer"
                    >
                      <i class="bi fs-4" :class="expandedGroups[index] ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                    </button>
                  </td>
                  <td><strong>{{ group.name }}</strong></td>
                  <td class="d-none d-lg-table-cell">{{ group.commonCategoria || 'Varios' }}</td>
                  <td class="d-none d-md-table-cell text-center fw-bold">{{ group.totalCantidad }}</td>
                  <td class="d-none d-md-table-cell text-center">
                    <span class="badge fs-6" :class="group.disponible === 0 ? 'bg-danger' : (group.disponible < group.totalCantidad * 0.3 ? 'bg-warning' : 'bg-success')">
                      {{ group.disponible }}
                    </span>
                  </td>
                  <td class="d-none d-lg-table-cell">{{ group.commonUbicacion || 'Varios' }}</td>
                  <td class="d-none d-lg-table-cell text-center">
                    <img v-if="group.commonImagenUrl" :src="group.commonImagenUrl" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;" @click="openImageModal(group.commonImagenUrl)" />
                    <div v-else class="text-muted"><small>Sin foto</small></div>
                  </td>
                  <td class="d-none d-md-table-cell">
                    <span class="badge" :class="group.allActivo ? 'bg-success' : 'bg-secondary'">
                      {{ group.allActivo ? 'Activo' : 'Mixto' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm me-2" @click="addToGroup(group)">
                      <i class="bi bi-plus-lg"></i> Agregar unidad
                    </button>
                  </td>
                </tr>

                <!-- Detalle expandido -->
                <tr v-if="expandedGroups[index]">
                  <td colspan="9" class="p-3 bg-light border-top border-bottom">
                    <div class="table-responsive">
                      <table class="table table-sm table-bordered mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th class="d-none d-sm-table-cell">Categoría</th>
                            <th>Total</th>
                            <th>Disponible</th>
                            <th>Ubicación</th>
                            <th class="d-none d-md-table-cell">Foto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="subItem in group.items" :key="subItem.id">
                            <td>{{ subItem.id }}</td>
                            <td>{{ subItem.codigo }}</td>
                            <td class="d-none d-sm-table-cell">{{ subItem.categoria || '—' }}</td>
                            <td class="text-center">{{ subItem.cantidad_total }}</td>
                            <td class="text-center">{{ subItem.cantidad_disponible }}</td>
                            <td>{{ subItem.ubicacion || '—' }}</td>
                            <td class="d-none d-md-table-cell text-center">
                              <img v-if="subItem.imagen_url" :src="subItem.imagen_url" class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover;" @click="openImageModal(subItem.imagen_url)" />
                            </td>
                            <td>
                              <span class="badge" :class="subItem.activo ? 'bg-success' : 'bg-secondary'">
                                {{ subItem.activo ? 'Activo' : 'Inactivo' }}
                              </span>
                            </td>
                            <td>
                              <button class="btn btn-warning btn-sm me-1" @click="openModal(subItem)">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button class="btn btn-danger btn-sm" @click="deleteItem(subItem.id)">
                                <i class="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <nav v-if="totalPages > 1" class="mt-4">
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

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-scrollable modal-lg modal-fullscreen-sm-down">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ form.id ? 'Editar' : 'Nuevo' }} Item de Inventario</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveItem">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Código (único)</label>
                  <input v-model="form.codigo" class="form-control" :class="{ 'is-invalid': codigoExistente }" required />
                  <div v-if="codigoExistente" class="text-danger mt-1">
                    <i class="bi bi-exclamation-triangle me-1"></i> Este código ya existe
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Nombre</label>
                  <input v-model="form.nombre" class="form-control" @input="suggestNombres" required />
                  <div v-if="nombreSuggestions.length > 0" class="position-relative">
                    <div class="list-group position-absolute w-100" style="z-index: 1000; max-height: 200px; overflow-y: auto;">
                      <button v-for="sug in nombreSuggestions" :key="sug" type="button" class="list-group-item list-group-item-action text-start" @click="selectNombre(sug)">
                        {{ sug }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Categoría</label>
                  <select v-model="form.categoria" class="form-select">
                    <option value="">Seleccione categoría...</option>
                    <option v-for="cat in categoriasPredefinidas" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Ubicación</label>
                  <input v-model="form.ubicacion" class="form-control" @input="suggestUbicaciones" />
                  <div v-if="ubicacionSuggestions.length > 0" class="position-relative">
                    <div class="list-group position-absolute w-100" style="z-index: 1000; max-height: 200px; overflow-y: auto;">
                      <button v-for="sug in ubicacionSuggestions" :key="sug" type="button" class="list-group-item list-group-item-action text-start" @click="selectUbicacion(sug)">
                        {{ sug }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-bold">Cantidad Total</label>
                  <input v-model.number="form.cantidad_total" type="number" min="0" class="form-control" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">Activo</label>
                  <select v-model="form.activo" class="form-select">
                    <option :value="true">Sí</option>
                    <option :value="false">No</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">Descripción</label>
                  <textarea v-model="form.descripcion" class="form-control" rows="3"></textarea>
                </div>

                <div class="col-12">
                  <label class="form-label">Foto del Item</label>
                  <input type="file" @change="onFileChange" class="form-control" accept="image/*" />
                  <div class="mt-3 text-center">
                    <img v-if="previewImage" :src="previewImage" class="img-thumbnail rounded" style="max-height: 300px;" alt="Preview" />
                    <img v-else-if="form.imagen_url" :src="form.imagen_url" class="img-thumbnail rounded" style="max-height: 300px;" alt="Foto actual" />
                    <div v-else class="text-muted py-5">
                      <i class="bi bi-image fs-1"></i><br>
                      <small>Sin foto aún</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer mt-4 d-flex flex-column flex-md-row justify-content-end gap-2">
                <button type="button" class="btn btn-secondary w-100 w-md-auto" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-lg w-100 w-md-auto" :disabled="codigoExistente || saving">
                  <i class="bi bi-save me-2"></i>{{ form.id ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Imagen Grande -->
    <div v-if="showImageModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.8);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 bg-transparent">
          <div class="text-end mb-2">
            <button type="button" class="btn-close btn-close-white" @click="closeImageModal"></button>
          </div>
          <div class="text-center">
            <img :src="currentImage" class="img-fluid rounded shadow-lg" style="max-height: 80vh; max-width: 90vw;" alt="Imagen ampliada" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { toast } from 'vue3-toastify'

const API_URL = '/manto/inventario'

export default {
  data() {
    return {
      items: [],
      search: '',
      loading: true,
      saving: false,
      showModal: false,
      showImageModal: false,
      currentImage: '',
      currentPage: 1,
      itemsPerPage: 15,
      expandedGroups: {},
      nombreSuggestions: [],
      ubicacionSuggestions: [],
      categoriasPredefinidas: [
        'Medición',
        'Automatización',
        'Electrónica',
        'Electricidad',
        'Neumática',
        'Hidráulica',
        'Mecatrónica',
        'Otro'
      ],
      form: {
        id: null,
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        cantidad_total: 0,
        ubicacion: '',
        activo: true,
        imagen: null,
        imagen_url: null
      },
      previewImage: null
    }
  },
  computed: {
    groupedItems() {
      const groups = {}
      this.filteredItems.forEach(item => {
        const key = item.nombre.toLowerCase().trim()
        if (!groups[key]) {
          groups[key] = {
            key: key,
            name: item.nombre,
            items: [],
            totalCantidad: 0,
            disponible: 0,
            allActivo: true,
            commonCategoria: item.categoria || null,
            commonUbicacion: item.ubicacion || null,
            commonImagenUrl: item.imagen_url || null
          }
        }
        const group = groups[key]
        group.items.push(item)
        group.totalCantidad += item.cantidad_total
        group.disponible += item.cantidad_disponible
        group.allActivo = group.allActivo && item.activo

        if (group.commonCategoria !== null && item.categoria !== group.commonCategoria) group.commonCategoria = 'Varios'
        if (group.commonUbicacion !== null && item.ubicacion !== group.commonUbicacion) group.commonUbicacion = 'Varios'
        if (group.commonImagenUrl !== null && item.imagen_url !== group.commonImagenUrl) group.commonImagenUrl = null
      })
      return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
    },
    totalPages() {
      return Math.ceil(this.groupedItems.length / this.itemsPerPage)
    },
    paginatedGroups() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.groupedItems.slice(start, start + this.itemsPerPage)
    },
    filteredItems() {
      if (!this.search.trim()) return this.items
      const s = this.search.toLowerCase()
      return this.items.filter(item =>
        item.codigo.toLowerCase().includes(s) ||
        item.nombre.toLowerCase().includes(s) ||
        (item.categoria && item.categoria.toLowerCase().includes(s)) ||
        (item.ubicacion && item.ubicacion.toLowerCase().includes(s)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(s))
      )
    },
    codigoExistente() {
      if (!this.form.codigo || this.form.id) return false
      return this.items.some(i => i.codigo === this.form.codigo)
    }
  },
  watch: {
    search() {
      this.currentPage = 1
    }
  },
  mounted() {
    this.loadItems()
  },
  methods: {
    async loadItems() {
      this.loading = true
      try {
        const res = await axios.get(API_URL)
        this.items = res.data || []
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar el inventario')
      } finally {
        this.loading = false
      }
    },
    toggleGroup(index) {
      this.expandedGroups = {
        ...this.expandedGroups,
        [index]: !this.expandedGroups[index]
      }
    },
    // Botón "Agregar unidad" → prellena con datos del grupo
    addToGroup(group) {
      this.form = {
        id: null,
        codigo: '',
        nombre: group.name,
        descripcion: '',
        categoria: group.commonCategoria === 'Varios' ? '' : group.commonCategoria,
        cantidad_total: 1,  // Valor por defecto para nueva unidad
        ubicacion: group.commonUbicacion === 'Varios' ? '' : group.commonUbicacion,
        activo: true,
        imagen: null,
        imagen_url: group.commonImagenUrl
      }
      this.previewImage = group.commonImagenUrl
      this.showModal = true
    },
    // Botón "Nuevo Item" → todo en blanco
    openModal(item = null, isNew = false) {
      if (item) {
        this.form = { ...item }
        this.previewImage = item.imagen_url
      } else if (isNew) {
        this.form = {
          id: null,
          codigo: '',
          nombre: '',
          descripcion: '',
          categoria: '',
          cantidad_total: 0,
          ubicacion: '',
          activo: true,
          imagen: null,
          imagen_url: null
        }
        this.previewImage = null
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.previewImage = null
      this.nombreSuggestions = []
      this.ubicacionSuggestions = []
    },
    openImageModal(url) {
      this.currentImage = url
      this.showImageModal = true
    },
    closeImageModal() {
      this.showImageModal = false
    },
    onFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.form.imagen = file
        const reader = new FileReader()
        reader.onload = (ev) => {
          this.previewImage = ev.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async saveItem() {
      if (this.codigoExistente) {
        toast.error('Este código ya existe')
        return
      }

      this.saving = true
      const formData = new FormData()
      Object.keys(this.form).forEach(key => {
        if (this.form[key] !== null && this.form[key] !== undefined && key !== 'imagen_url' && key !== 'imagen') {
          formData.append(key, this.form[key])
        }
      })
      if (this.form.imagen instanceof File) {
        formData.append('imagen', this.form.imagen)
      }

      try {
        if (this.form.id) {
          await axios.put(`${API_URL}/${this.form.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          toast.success('¡Actualizado correctamente!')
        } else {
          await axios.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          toast.success('¡Item creado!')
        }
        await this.loadItems()
        this.closeModal()
      } catch (err) {
        toast.error('Error al guardar')
        console.error(err)
      } finally {
        this.saving = false
      }
    },
    async deleteItem(id) {
      if (!confirm('¿Desactivar este item? (borrado lógico)')) return
      try {
        await axios.delete(`${API_URL}/${id}`)
        toast.success('Item desactivado')
        await this.loadItems()
      } catch (err) {
        toast.error('Error al desactivar')
      }
    },
    suggestNombres() {
      if (this.form.nombre.length < 2) {
        this.nombreSuggestions = []
        return
      }
      const s = this.form.nombre.toLowerCase()
      const unique = new Set(this.items.map(i => i.nombre).filter(n => n.toLowerCase().includes(s)))
      this.nombreSuggestions = Array.from(unique).slice(0, 6)
    },
    selectNombre(sug) {
      this.form.nombre = sug
      this.nombreSuggestions = []
    },
    suggestUbicaciones() {
      if (this.form.ubicacion.length < 2) {
        this.ubicacionSuggestions = []
        return
      }
      const s = this.form.ubicacion.toLowerCase()
      const unique = new Set(this.items.map(i => i.ubicacion).filter(u => u && u.toLowerCase().includes(s)))
      this.ubicacionSuggestions = Array.from(unique).slice(0, 6)
    },
    selectUbicacion(sug) {
      this.form.ubicacion = sug
      this.ubicacionSuggestions = []
    }
  }
}
</script>

<style scoped>
.table-group {
  background-color: #f8f9fa;
  font-size: 1.1rem;
}
.table-group td {
  vertical-align: middle;
}
.expander-btn {
  color: #495057;
}
.expander-btn:hover {
  color: #0d6efd;
}
</style>