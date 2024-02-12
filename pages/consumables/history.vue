<template>
  <el-container direction="vertical" class="p-3">
    <PageHeader title="Historial"></PageHeader>
    <el-row :span="24" :gutter="12">
      <el-table :data="response.rows" v-loading="loadingHistory" :row-class-name="historyStatus">
        <el-table-column type="expand" width="50">
          <template #default="props">
            <el-row :span="24" :gutter="24">
              <el-col :span="22" :offset="2">
                Creado por: {{ props.row.createdBy.name }} {{ props.row.createdBy.lastName }}
              </el-col>
              <el-col :span="22" :offset="2">
                Fecha de creación: {{ new Date(props.row.createdAt).toLocaleString('es-VE') }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50" />
        <el-table-column label="Entregado a" prop="customer">
          <template #header>
            <el-input :debounce="2000" v-model="filters.customer" placeholder="Almacén" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Nota" prop="description">
          <template #header>
            <el-input :debounce="2000" v-model="filters.description" placeholder="Nota" clearable />
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="response.total"/>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const ConsumableService = useConsumable();
const consumableService = new ConsumableService();

const loadingHistory = ref(false);

const filters = reactive({
  limit: 10,
  offset: 1,
  customer: '',
  description: '',
});

const response = reactive<{
  rows: Lot[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  details: false,
  filter: false
});

const setHistory = async () => {
  const rta = await consumableService.getLots(
    filters
  );
  response.rows = rta?.rows || []
  response.total = rta?.total || 0
}

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

watch(filters, useDebounce(async () => {
  await setHistory()
}, 500)
)

onMounted(async () => {
  await setHistory();
});
</script>


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