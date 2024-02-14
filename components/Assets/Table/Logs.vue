<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: () => 0
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
      <el-table-column label="Mensaje" prop="details.message" :min-width="240">
      </el-table-column>
      <el-table-column label="Creado por" prop="createdBy.username" :min-width="120">
      </el-table-column>
    </el-table>
    <Pagination :offset="1" :limit="10" :total="props.total" />
  </el-col>
</template>