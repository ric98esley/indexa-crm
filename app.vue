<script setup >
import ESLang from "element-plus/dist/locale/es.js";
</script>

<template>
  <ElConfigProvider :locale="ESLang">
    <NuxtLayout>
      <NuxtLoadingIndicator/>
      <NuxtPage />
    </NuxtLayout>
  </ElConfigProvider>
</template>
