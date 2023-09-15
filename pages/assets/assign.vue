<template>
  <el-col :gutter="20">
    <el-row :span="24" class="p-4">
      <el-card class="w-full">
        <el-table :data="response.assets" v-loading="loading" :row-class-name="assetstatus">
          <el-table-column type="index" width="50" />
          <el-table-column type="expand" width="50">
            <template #default="props">
              <el-table :data="props.row.specifications" :border="true">
                <el-table-column label="Campo" prop="type.name"></el-table-column>
                <el-table-column label="Valor" prop="value"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="Serial" prop="serial">
            <template #header>
              <el-input v-model="filters.serial" placeholder="Serial" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Estado" prop="deposit.name">
            <template #header>
              <el-input v-model="filters.deposit" placeholder="Estado" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Categoria" prop="model.category.name">
            <template #header>
              <el-input v-model="filters.category" placeholder="Categoria" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Marca" prop="model.brand.name">
            <template #header>
              <el-input v-model="filters.brand" placeholder="Marca" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Modelo" prop="model.name">
            <template #header>
              <el-input v-model="filters.model" placeholder="Modelo" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
            <template #default="{ row }">
              <el-row>
                <el-button type="primary" circle @click="addAssignment(row)">
                  <Icon name="ep:plus" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[5, 10]" :background="true" layout="total, sizes, prev, pager, next, jumper"
          :total="response.total" />
      </el-card>

    </el-row>
    <el-row :span="24" class="p-4">
      <el-card class="w-full">
        <template #header>
          <el-row >
            <el-descriptions class="margin-top w-full" :title="`Datos de la asignacion - activos ${ assetsId.values.length }`" :column="3" border>
              <template #extra>
                <el-button type="primary">Asignar</el-button>
              </template>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:user"/>
                    Responsable
                  </div>
                </template>
                Jhonatan
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="mdi-light:eye"/>
                    Codigo
                  </div>
                </template>
                EX100
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:phone"/>
                    Telefono
                  </div>
                </template>
                18100000000
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:school"/>
                    Taquilla
                  </div>
                </template>
                El cacho
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:connection"/>
                    Grupo
                  </div>
                </template>
                PROPIAS
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:place"/>
                    Dirección
                  </div>
                </template>
                Al lado de mis vecinos
              </el-descriptions-item>
            </el-descriptions>
          </el-row>
        </template>
        <template #default>
          <el-table :data="assignments.assets">
            <el-table-column prop="serial" label="Serial"></el-table-column>
          </el-table>
        </template>
      </el-card>
    </el-row>
  </el-col>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico', 'receptor'],
})

const response = reactive<{
  assets: Asset[],
  total: number
}>({
  assets: [],
  total: 0
});

const assignments = reactive<{
  assets: Asset[]
}>({
  assets: []
})

const modals = reactive({
  edit: false
})

const loading = ref(true)

const filters = reactive({
  limit: 5,
  offset: 0,
  serial: '',
  category: '',
  brand: '',
  model: '',
  deposit: ''
})

const assetstatus = ({
  row,
  rowIndex,
}: {
  row: Asset,
  rowIndex: number
}) => {
  if (row.deposit && row.deposit.state === 'archivado') {
    return 'danger-row'
  } else if (row.deposit && row.deposit.state === 'pendiente') {
    return 'warning-row'
  } else if (row.deposit && row.enabled === false) {
    return 'success-row'
  }
  return ''
}


const getAssets = async () => {
  try {
    loading.value = true;
    const { data, pending, error } = await useFetch<{ assets: Asset[], total: number }>('/assets',
      {
        params: {
          ...(filters.serial != '' && filters.serial && {
            serial: filters.serial
          }),
          ...(filters.model != '' && filters.model && {
            model: filters.model
          }),
          ...(filters.deposit != '' && filters.deposit && {
            deposit: filters.deposit
          }),
          ...(filters.category != '' && filters.category && {
            category: filters.category
          }),
          ...(filters.brand != '' && filters.brand && {
            brand: filters.brand
          }),
          enabled: true,
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit
          })
        }
      }
    );
    response.assets = data.value?.assets || [];
    response.total = data.value?.total || 0;
    loading.value = false;

    return { data, error, pending }
  } catch (error) {
    loading.value = false;
  }
}

const addAssignment = (row: Asset) => {
  if (assetsId.value.includes(row.id)) return;

  assignments.assets.push(row);
}

const assetsId = computed(() => {
  return assignments.assets.map((asset) => {
    return asset.id;
  });
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