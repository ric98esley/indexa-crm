<script setup lang="ts">

const props = defineProps({
  assets: {
    type: Array,
    default: () => ([])
  },
  loading: {
    type: Boolean,
  },
  filters: {
    type: Object,
    default: () => ({
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
  },
  total: {
    type: Number,
    default: () => 1
  }
});

const emit = defineEmits([
  'refresh',
  'update:filters'
])

const AssetServices = useAssets();
const assetService = new AssetServices();

const minWidth = 120;
const toEdit = ref(0);
const toDelete = ref(0);

const modals = reactive({
  edit: false,
  delete: false
})

const editAsset = (row: Asset) => {
  toEdit.value = row.id || 0;
  modals.edit = true;
}

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


const removeAsset = async (id: number) => {
  toDelete.value = id
  modals.delete = true;
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
  <el-col v-can="['assets:read']">
    <el-table :data="props.assets" v-loading="props.loading" :row-class-name="assetStatus" id="area">
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
            <el-button type="info" circle @click="editAsset(row)" v-can="['assets:update']">
              <Icon name="ep:edit" />
            </el-button>
            <NuxtLink :to="`/assets/${row.id}`">
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
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    <AssetsFormGet :id="toEdit" v-model:open="modals.edit" @submit="emit('refresh')"></AssetsFormGet>
    <el-dialog v-model="modals.delete">
      <AssetsFormDelete :id="toDelete" @submit="emit('refresh')"></AssetsFormDelete>
    </el-dialog>
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