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

<style>
.el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  background-color: var(--el-color-primary-light-7);
}

.el-autocomplete-suggestion li:hover {
  background-color: var(--el-color-primary-light-7) !important;
}

.el-autocomplete-suggestion li.highlighted {
  background-color: var(--el-color-primary-light-7) !important;
}
</style>
