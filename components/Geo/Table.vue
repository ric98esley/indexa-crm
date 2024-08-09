<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['filters'])

const filters = reactive({
  limit: 10,
  offset: 1,
  ip: '',
  serial: '',
  alertType: '',
})

const geoClass = ({
  row,
  rowIndex,
}: {
  row: GeoAlert,
  rowIndex: number
}) => {
  if (row.alert) {
    return 'danger-row'
  }

  return ''
}

watch(filters, () => {
  emit('filters', filters)
}, { deep: true })
</script>

<template>
  <el-container>
    <el-col>
      <el-table :data="props.data" :row-class-name="geoClass">
        <el-table-column prop="serial" label="Serial">
          <template #header>
            <el-input v-model="filters.serial" placeholder="Serial" clearable />
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP">
          <template #header>
            <el-input v-model="filters.ip" placeholder="IP" clearable />
          </template>
        </el-table-column>
        <el-table-column prop="alertType" label="Description">
          <template #header>
            <el-input v-model="filters.alertType" placeholder="Description" clearable />
          </template>
        </el-table-column>
        <el-table-column prop="latitude" label="Coordenadas">
          <template #default="{ row }">
            {{ row.latitude }} ,{{ row.longitude }}
          </template>
        </el-table-column>
        <el-table-column prop="location.code" label="Lugar">
          <template #default="{ row }">
            {{ row.location?.code ?? 'Activo no encontrado' }} - {{ row.location?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Fecha">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    </el-col>
  </el-container>
</template>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-5);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-5);
}

.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-5);
}

.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-5);
}

.cell {
  display: flex;
  align-items: center;
}
</style>