<template>
  <div
    class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg">
    <Icon name="ep:plus" size="2rem" color="white" @click="modal = true" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modal: boolean
}>()
</script>