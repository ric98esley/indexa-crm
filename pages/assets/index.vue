<template>
  <el-container direction="vertical" class="p-4">
    <el-row :gutter="10">
      <PageHeader name="Activos">
        <template #buttons>
          <div class="sm:flex items-center hidden">
            <el-button type="default" class="ml-2" @click="getExcel()" v-can="['assets:export']">Exportar a
              excel</el-button>
            <el-button type="primary" class="ml-2" @click="printDiv('area')">Imprimir</el-button>
          </div>
        </template>
      </PageHeader>
      <el-col class="mt-4">
        <h2>Filtros</h2>
        <el-row>
          <el-form>
            <el-row>
              <el-form-item class="ml-4 w-10">
                <el-button @click="modals.filters = true" type="primary" circle class="">
                  <Icon name="ep:filter" />
                </el-button>
              </el-form-item>
              <el-form-item class="w-64 sm:w-auto ml-4">
                <el-date-picker v-model="filters.startDate" type="datetime" placeholder="Fecha de inicio"
                  format="YYYY/MM/DD" value-format="x" :shortcuts="shortcuts" />
              </el-form-item>
              <div class="ml-4 w-10 flex items-center sm:items-start sm:mt-1">
                <span class="ml-2">al</span>
              </div>
              <el-form-item class="w-64 sm:w-auto ml-4 sm:ml-0 sm:mr-4">
                <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite" format="YYYY/MM/DD"
                  value-format="x" />
              </el-form-item>
            </el-row>
          </el-form>
        </el-row>
      </el-col>
      <el-col v-can="['assets:read']">
        <el-table :data="response.assets" v-loading="loading" :row-class-name="assetStatus" id="area">
          <el-table-column type="index" width="50" />
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <el-table :data="row.specifications" :border="true">
                <el-table-column label="Campo" prop="type.name"></el-table-column>
                <el-table-column label="Valor" prop="value"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="Fecha" :min-width="minWidth">
            <template #default="{ row }">
              {{ new Date(row.createdAt).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="Serial" prop="serial" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.serial" placeholder="Serial" clearable />
            </template>
            <template #default="{ row }">
              <Copy :text="row.serial" />
            </template>
          </el-table-column>
          <el-table-column label="Estado" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.location" placeholder="Estado" clearable />
            </template>
            <template #default="{ row }">
              <NuxtLink :href="`/places/${row.location.id}`">
                <span class="text-teal-500 underline">
                  {{ row.location?.code }} - {{ row.location?.name }}
                </span>
              </NuxtLink>
            </template>
          </el-table-column>
          <el-table-column label="Categoría" prop="model.category.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.category" placeholder="Categoría" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Marca" prop="model.brand.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.brand" placeholder="Marca" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Modelo" prop="model.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.model" placeholder="Modelo" clearable />
            </template>
          </el-table-column>
          <el-table-column v-role:not="'receptor'" width="140">
            <template #default="{ row }">
              <el-row justify="space-around">
                <el-button type="info" circle @click="getAsset(row)" v-can="['assets:update']">
                  <Icon name="ep:edit" />
                </el-button>
                <NuxtLink :to="`/assets/${row.id}`" v-can="['assets:read']">
                  <el-button type="primary" circle>
                    <Icon name="ep:view" />
                  </el-button>
                </NuxtLink>
                <el-button type="danger" circle @click="removeAsset(row.id)" v-can="['assets:delete']">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="response.total" />
      </el-col>
      <el-container>
        <AssetsFormGet :id="toEdit" v-model:open="editModal"></AssetsFormGet>
        <el-dialog v-model="modals.filters">
          <template #header>
            <h2 class="text-xl font-bold">Filtros</h2>
          </template>
          <el-form label-position="top">
            <el-row>
              <el-col :span="12">
                <el-form-item label="Serial">
                  <el-input v-model="filters.serial" placeholder="Serial" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Estado">
                  <el-input v-model="filters.location" placeholder="Estado" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Categoría">
                  <el-input v-model="filters.category" placeholder="Categoría" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Marca">
                  <el-input v-model="filters.brand" placeholder="Marca" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Modelo">
                  <el-input v-model="filters.model" placeholder="Modelo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Fecha de inicio">
                  <el-date-picker v-model="filters.startDate" type="datetime" placeholder="Fecha de inicio"
                    format="YYYY/MM/DD" value-format="x" :shortcuts="shortcuts" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Fecha limite">
                  <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite" format="YYYY/MM/DD"
                    value-format="x" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Todos">
                  <el-switch v-model="filters.all" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row justify="end">
              <el-button type="primary" @click="modals.filters = false">Cerrar</el-button>
            </el-row>
          </el-form>
        </el-dialog>
      </el-container>
    </el-row>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico', 'receptor', 'auditor'],
})

const AssetServices = useAssets();
const assetServices = new AssetServices();

const modals = reactive({
  filters: false
})


const shortcuts = [
  {
    text: 'Hoy',
    value: new Date(),
  },
  {
    text: 'Ayer',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: 'Semana pasada',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: 'Mes pasado',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 30)
      return date
    },
  },
  {
    text: 'Trimestre pasado',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 90)
      return date
    },
  }
]

const minWidth = 120;
const toEdit = ref(0)
const editModal = ref(false)
const loading = ref(true)

const response = reactive<{
  assets: Asset[],
  total: number
  locations: Warehouse[]
  categories: any[]
}>({
  categories: [],
  locations: [],
  assets: [],
  total: 0
});

const filters = reactive({
  serial: '',
  limit: 10,
  offset: 1,
  sort: 'createdAt',
  order: 'DESC',
  location: '',
  type: '',
  status: '',
  all: false,
  model: '',
  brand: '',
  category: '',
  endDate: '',
  startDate: '',
})

const assetStatus = ({
  row,
  rowIndex,
}: {
  row: Asset,
  rowIndex: number
}) => {
  if (row.location && row.location.type && row.location.type.status === 'archivado') {
    return 'danger-row'
  } else if (row.location && row.location.type && row.location.type.status === 'pendiente') {
    return 'warning-row'
  } else if (row.location && row.location.type && row.location.type.status == 'asignado') {
    return 'success-row'
  }
  return ''
}


const getAssets = async () => {
  try {
    loading.value = true;
    if (filters.endDate < filters.startDate) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha limite')
    }
    const data = await assetServices.getAssets(filters);

    response.assets = data?.value?.rows || [];
    response.total = data?.value?.total || 0;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    ElNotification({
      title: 'Error al obtener los activos intente de nuevo mas tarde.',
      message: error.message,
      type: 'error'
    })
  }
}

const removeAsset = async (id: number) => {
  try {
    loading.value = true;
    const { data, error } = await useFetch<{ message: string }>(`/assets/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      throw new Error('El activo debe de estar disponible y no asignado')
    }

    ElNotification({
      message: data.value?.message
    })
    await getAssets()
  } catch (error) {
    console.log(error)
    loading.value = false;
    ElNotification({
      title: 'Error al ocultar el activo intente de nuevo mas tarde.',
      message: error.message
    })
  }
}

const printDiv = async (nombreDiv: string) => {
  var contenido = document.getElementById(nombreDiv).innerHTML;
  var contenidoOriginal = document.body.innerHTML;
  if (!contenido) return;
  document.body.innerHTML = contenido;

  window.print();

  document.body.innerHTML = contenidoOriginal;
}

const getAsset = (row: Asset) => {
  toEdit.value = row.id || 0;
  editModal.value = true;
}


const getExcel = async () => {
  await assetServices.getExcel({ ...filters, limit: response.total })
}

watch(editModal, () => {
  if (!editModal.value) getAssets();
})

watch(filters, useDebounce(async () => {
  await getAssets()
}, 500))

onMounted(async () => {
  await getAssets();
})
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