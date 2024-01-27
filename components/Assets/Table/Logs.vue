<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <el-col v-can="['assets:read']">
    <el-table :data="props.data">
      <el-table-column prop="details.message">
      </el-table-column>
      <el-table-column prop="createdBy.username">
      </el-table-column>
    </el-table>
  </el-col>
</template>