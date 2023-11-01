<template>
  <h2>Bienvenidos al sistema de inventario de GANA loterías</h2>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'asistente', 'tecnico', 'receptor', 'auditor'],
})
</script>