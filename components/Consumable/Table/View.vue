
import { Row } from 'element-plus/es/components/table-v2/src/components';

import { Row } from 'element-plus/es/components/table-v2/src/components';
<script setup lang="ts">

const props = defineProps({
  data: {
    type: Array,
    default: () => ([])
  },
  loading: {
    type: Boolean,
  },
  filters: {
    type: Object,
    default: () => ({
      code: '',
      limit: 10,
      offset: 1,
      sort: 'createdAt',
      order: 'DESC',
      name: '',
    })
  },
  total: {
    type: Number,
    default: () => 0
  }
})

const emit = defineEmits(['update:filters']);

const assetStatus = ({
  row,
  rowIndex,
}: {
  row: Consumable,
  rowIndex: number
}) => {
  if (row.deletedAt) {
    return 'info-row'
  }

  if (Number(row.quantity) < row.min) {
    return 'danger-row'
  }
  return ''
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
  <el-col>
    <el-table :data="props.data" v-loading="props.loading" :row-class-name="assetStatus" id="area">
      <el-table-column prop="product.code" label="Código" sortable>
      </el-table-column>
      <el-table-column prop="product.name" label="Nombre" sortable></el-table-column>
      <el-table-column prop="quantity" label="Cantidad" sortable >
        <template #default="{ row }">
          {{ row.quantity }} - {{ row.product.unit }}
        </template>
      </el-table-column>
      <el-table-column prop="min" label="Mínimo" sortable></el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
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

.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-5);
}
</style>