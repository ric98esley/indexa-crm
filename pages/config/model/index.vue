<template></template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
})


const getModels = async (query: string) => {
  try {
    const { data } = await useFetch<{ count: number, rows: Model[] }>('/assets/models', {
      params: {
        name: query
      }
    });
    // response.models = data.value?.rows || [];
  } catch (error) {
    console.log(error);
  }
}
</script>