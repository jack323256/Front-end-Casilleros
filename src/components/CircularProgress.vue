<!-- src/components/CircularProgress.vue -->
<template>
  <div class="d-flex flex-column align-items-center">
    <!-- Logo de carrera arriba -->
    <img 
      :src="logoCarrera" 
      alt="Logo carrera"
      class="mb-3"
      style="width: 135px; height: 60px; object-fit: contain; background: white; padding: 1px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    />

    <!-- Círculo de progreso -->
    <div 
      class="position-relative d-inline-block" 
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <svg :width="size" :height="size" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          :r="radius"
          stroke="#e9ecef"
          stroke-width="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          :r="radius"
          :stroke="dynamicColor"
          stroke-width="10"
          fill="none"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          stroke-linecap="round"
          transform="rotate(-90 50 50)"
          class="progress-ring"
        />
      </svg>

      <!-- Porcentaje dentro del círculo -->
      <div class="position-absolute top-50 start-50 translate-middle text-center">
        <div class="fw-bold" :style="{ color: dynamicColor, fontSize: textSize + 'px' }">
          {{ Math.round(progress * 100) }}%
        </div>
      </div>
    </div>

    <!-- Texto abajo del círculo -->
    <div class="mt-3 text-center">
      <small class="text-muted d-block">Porcentaje de la clase</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#007bff' },
  size: { type: Number, default: 120 },
  logoCarrera: { type: String, required: true }  // Nueva prop para el logo
})

const radius = computed(() => (props.size / 2) - 25)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = ref(circumference.value)

// Cambio de color degradado cuando llega al 90%
const dynamicColor = computed(() => {
  const p = props.progress
  if (p < 0.7) return props.color
  if (p < 0.9) return '#ffa726'  // Naranja suave
  return '#d32f2f'  // Rojo intenso
})

watch(() => props.progress, (newVal) => {
  offset.value = circumference.value * (1 - Math.max(0, Math.min(1, newVal)))
}, { immediate: true })

const textSize = computed(() => Math.round(props.size / 4.5))
</script>

<style scoped>
.progress-ring {
  transition: stroke-dashoffset 0.8s ease-in-out, stroke 0.6s ease;
}
</style>