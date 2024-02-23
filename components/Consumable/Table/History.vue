<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean
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

const historyStatus = ({
  row,
  rowIndex,
}: {
  row: ConsumableMovement,
  rowIndex: number
}) => {
  if (row.lot.type && row.lot.type == 'checkout') {
    return 'warning-row'
  }
  else if (row.lot.type && row.lot.type == 'checking') {
    return 'success-row'
  }
  return ''
}

const emit = defineEmits(['update:filters']);

const filters = computed({
  get() {
    return props.filters
  },
  set(value) {
    emit('update:filters', value)
  }
})

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
</script>

<template>
  <el-col>
    <el-table :data="props.data" v-loading="props.loading" :row-class-name="historyStatus">
      <el-table-column width="120">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('es-VE') }}
        </template>
      </el-table-column>
      <el-table-column prop="target.product.code" label="Código" sortable>
        <template #header>
          <div class="w-28">
            <el-input v-model="filters.search" placeholder="Buscar"></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="target.product.name" label="Nombre" sortable>
      </el-table-column>
      <el-table-column prop="quantity" label="Cantidad" sortable>
        <template #default="{ row }">
          {{ row.quantity }} - {{ row.target.product.unit }}
        </template>
      </el-table-column>
      <el-table-column width="120">
        <template #default="{ row }">
          <el-row justify="space-around">
            <el-button type="info" circle @click="print(row.lot)">
              <Icon name="ep:printer" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="props.total" />
  </el-col>
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