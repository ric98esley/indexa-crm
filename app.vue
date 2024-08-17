<script setup>
import ESLang from "element-plus/dist/locale/es.js";
</script>

<template>
  <ElConfigProvider :locale="ESLang">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ElConfigProvider>
</template>
