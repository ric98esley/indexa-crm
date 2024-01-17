<template>
  <el-container direction="vertical" class="p-4">
    <el-row :gutter="10">
      <PageHeader name="Activos">
        <template #buttons>
          <div class="sm:flex items-center hidden">
            <el-button type="default" class="ml-2" @click="getExcel()" v-can="['assets:export']">Exportar a excel</el-button>
            <el-button type="primary" class="ml-2" @click="printDiv('area')">Imprimir</el-button>
          </div>
        </template>
      </PageHeader>
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
              <div>
                {{ row.location?.code }} - {{ row.location?.name }}
              </div>
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
                <el-button type="info" circle @click="getAsset(row)" v-can="['assets:update']" >
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

const viewDetails = async (id: number) => {
  await navigateTo(`/assets/${id}`);
}

const filters = reactive({
  limit: 10,
  offset: 1,
  serial: '',
  category: '',
  brand: '',
  model: '',
  location: ''
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
    const data = await assetServices.getAssets(filters);

    response.assets = data?.value?.rows || [];
    response.total = data?.value?.total || 0;
    loading.value = false;
  } catch (error) {
    loading.value = false;
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
  if(!editModal.value) getAssets();
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