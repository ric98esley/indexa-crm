<template>
  <div class="p-3 text-center">
      <el-image :class="`${props.width} ${props.margin}`" src="/img/gana_logo.png" fit="contain" />
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  width: String,
  margin: String
})

</script>