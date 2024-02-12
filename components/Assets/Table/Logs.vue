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
      <el-table-column label="Fecha" :min-width="120">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="Mensaje" prop="details.message">
      </el-table-column>
      <el-table-column label="Creado por" prop="createdBy.username">
      </el-table-column>
    </el-table>
  </el-col>
</template>