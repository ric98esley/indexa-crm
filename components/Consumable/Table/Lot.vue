<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => ([])
  },
  loading: {
    type: Boolean
  },
  warehouseId: {
    type: Number
  },
  total: {
    type: Number,
    default: () => 0
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 1,
      customer: '',
      description: '',
    })
  }
});

const emit = defineEmits(['update:filters'])

const historyStatus = ({
  row,
  rowIndex,
}: {
  row: Lot,
  rowIndex: number
}) => {
  if (row.type && row.type == 'checkout') {
    return 'warning-row'
  }
  else if (row.type && row.type == 'checking') {
    return 'success-row'
  }
  return ''
}

const print = (row: Lot) => {
  return navigateTo(
    {
      path: `/consumables/${row.location?.id}/lot/${row.id}/print`,
    },
    {
      open: {
        target: '_blank',
        windowFeatures: {
          popup: true,
          noopener: true,
          noreferrer: true,
        }
      }
    })
}

const filters = computed({
  get() {
    return props.filters
  },
  set(value) {
    emit('update:filters', value)
  }
})
</script>

<template>
  <el-table :data="props.data" v-loading="props.loading" :row-class-name="historyStatus">
    <el-table-column type="index" width="50" />
    <el-table-column type="expand" width="50">
      <template #default="props">
        <el-row :span="24" :gutter="24">
          <el-col :span="22" :offset="2">
            Creado por: {{ props.row.createdBy.username }}
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column width="120">
      <template #default="{ row }">
        {{ new Date(row.createdAt).toLocaleString('es-VE') }}
      </template>
    </el-table-column>
    <el-table-column label="Entregado a" prop="customer" min-width="120">
      <template #header>
        <el-input :debounce="2000" v-model="filters.customer" placeholder="Almacén" clearable />
      </template>
    </el-table-column>
    <el-table-column label="Nota" prop="description" min-width="120">
      <template #header>
        <el-input :debounce="2000" v-model="filters.description" placeholder="Nota" clearable />
      </template>
    </el-table-column>
    <el-table-column width="120">
      <template #default="{ row }">
          <el-row justify="space-around">
              <el-button type="info" circle @click="print(row)">
                <Icon name="ep:printer" />
              </el-button>
          </el-row>
        </template>
    </el-table-column>
  </el-table>
  <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="props.total" />
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
</style>