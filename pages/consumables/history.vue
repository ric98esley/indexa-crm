<template>
  <el-container direction="vertical" class="p-3">
    <div class="mt-4">
      <el-button @click="getExcelHistory()">Exportar a Excel</el-button>
    </div>
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
        <el-table-column label="Cantidad" width="90">
          <template #default="{ row }">
            <p class="text-right">
              {{ row.type == 'sub' ? '-' : '' }} {{ row.quantity }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="Producto">
          <template #header>
            <el-input :debounce="2000" v-model="filters.search" placeholder="Código o nombre" clearable />
          </template>
          <template #default="{ row }">
            {{ row.warehouse.product.code }} - {{ row.warehouse.product.name }}
          </template>
        </el-table-column>
        <el-table-column label="Deposito" prop="warehouse.deposit.name">
          <template #header>
            <el-input :debounce="2000" v-model="filters.deposit" placeholder="Almacén" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Nota" prop="notes">
          <template #header>
            <el-input :debounce="2000" v-model="filters.notes" placeholder="Nota" clearable />
          </template>
        </el-table-column>

      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="response.total" />
    </el-row>
    <el-row justify="end" :span="24">
      <div
        class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
        @click="modals.filter = true">
        <Icon name="ep:filter" size="2rem" color="white" />
      </div>
    </el-row>
    <el-container>
      <el-dialog v-model="modals.filter">
        <template #header>
          Filtros
        </template>
        <el-form label-position="top">
          <el-form-item label="Fecha">
            <el-date-picker type="daterange" class="bg-transparent" size="large" clearable v-model="dateFilter.date"
              format="YYYY/MM/DD" value-format="MM-DD-YYYY">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Código o nombre">
            <el-input v-model="filters.search">
            </el-input>
          </el-form-item>
          <el-form-item label="Deposito o almacén">
            <el-input v-model="filters.deposit">
            </el-input>
          </el-form-item>
          <el-form-item label="Notas">
            <el-input v-model="filters.notes">
            </el-input>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});


const loadingHistory = ref(false);

const dateFilter = reactive<{ date: string[] }>({
  date: []
});

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  search: '',
  deposit: '',
  quantity: '',
  notes: '',
  startDate: '',
  endDate: ''
});

const response = reactive<{
  rows: ConsumableHistory[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  details: false,
  filter: false
});


const getHistory = async () => {
  try {
    loadingHistory.value = true;
    const { data, error } = await useFetch<{ total: number, rows: ConsumableHistory[] }>('/consumables/history',
      {
        params: {
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit
          }),
          ...(filters.search && {
            search: filters.search
          }),
          ...(filters.deposit && {
            deposit: filters.deposit
          }),
          ...(filters.notes && {
            notes: filters.deposit
          }),
          ...(filters.endDate && {
            endDate: filters.endDate
          }),
          ...(filters.startDate && {
            startDate: filters.startDate
          })
        }
      }
    );
    if (error.value) {
      throw new Error()
    }

    loadingHistory.value = false;
    return data.value
  } catch (error) {
    loadingHistory.value = false;
    ElNotification({
      message: 'Error al obtener las historias intente de nuevo mas tarde'
    })
  }
}
const getExcelHistory = async () => {
  try {
    const { data: file, error } = await useFetch<Blob>('/consumables/history/excel',
      {
        params: {
          ...(filters.limit && {
            limit: response.total
          }),
          ...(filters.search && {
            search: filters.search
          }),
          ...(filters.deposit && {
            deposit: filters.deposit
          }),
          ...(filters.notes && {
            notes: filters.deposit
          }),
          ...(filters.endDate && {
            endDate: filters.endDate
          }),
          ...(filters.startDate && {
            startDate: filters.startDate
          })
        },
      },

    );
    if (error.value) {
      throw new Error()
    }

    let date = new Date();
    const day = date.getDay()
    const month = date.getMonth()
    const year = date.getFullYear()

    // Create a temporary link element to trigger the file download
    const url = window.URL.createObjectURL(new Blob([file.value]));
    const link = document.createElement("a");
    link.href = url
    link.setAttribute("download", `${day}-${month}-${year}-historial.xlsx`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.log(error)
    ElNotification({
      message: 'Error al obtener las historias intente de nuevo mas tarde'
    })
  }
}

const setHistory = async () => {
  const rta = await getHistory();
  response.rows = rta?.rows || []
  response.total = rta?.total || 0
}

const historyStatus = ({
  row,
  rowIndex,
}: {
  row: ConsumableHistory,
  rowIndex: number
}) => {
  if (row.type && row.type == 'sub') {
    return 'warning-row'
  }
  else if (row.type && row.type == 'add') {
    return 'success-row'
  }
  return ''
}

watch(filters, useDebounce(async () => {
  await setHistory()
}, 500)
)

watch(dateFilter, useDebounce(() => {
  if (
    dateFilter.date === null ||
    dateFilter.date === undefined ||
    dateFilter.date.length == 0
  ) {
    filters.startDate = '';
    filters.endDate = '';
    return;
  }
  console.log(dateFilter.date)
  filters.startDate = dateFilter.date[0];
  filters.endDate = dateFilter.date[1];
}))


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