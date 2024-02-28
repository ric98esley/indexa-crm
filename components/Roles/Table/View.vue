<script setup lang="ts">

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>
<template>
  <el-col>
    <el-table :data="props.data">
      <el-table-column type="index" width="50" />
      <el-table-column label="Fecha" min-width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Nombre" min-width="180" />
    </el-table>
  </el-col>
</template>