<template>
  <el-container direction="vertical">
    <el-row :span="24">
      <el-card class="w-full m-2">
        <template #header>
          Buscar activos
        </template>
        <el-row :gutter="20" align="middle">
          <el-col :span="22">
            <el-input v-model="filters.serial" placeholder="Serial" clearable class="w-50 m-4" />
          </el-col>
          <el-col :span="2">
            <Icon name="ep:filter" class="m-4" />
          </el-col>
        </el-row>
      </el-card>
    </el-row>

    <el-table :data="response.assets" v-loading="loading">
      <el-table-column type="index" width="50" />
      <el-table-column type="expand" width="50">
        <template #default="props">
          <el-table :data="props.row.customFields" :border="true">
            <el-table-column label="Campo" prop="name"></el-table-column>
            <el-table-column label="Valor" prop="value"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="Serial" prop="serial">
        <template #header>
          <el-input v-model="filters.serial" placeholder="Serial" clearable />
        </template>
      </el-table-column>
      <el-table-column label="Estado" prop="state.name">
        <template #header>
          <el-input v-model="filters.state" placeholder="Estado" clearable />
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
        <template #default="props">
          <el-row>
            <el-button type="info" circle @click="modals.edit = true">
              <Icon name="ep:edit" />
            </el-button>
            <el-button type="primary" circle>
              <Icon name="ep:view" />
            </el-button>
            <el-button type="danger" circle @click="" v-role="['auditor', 'superuser']">
              <Icon name="ep:delete" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
      :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
      :total="response.total" />
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico'],
})

const response = reactive<{
  assets: Asset[],
  total: number
}>({
  assets: [],
  total: 0
});

const modals = reactive({
  edit: false
})

const loading = ref(true)

const filters = reactive({
  limit: 10,
  offset: 0,
  serial: '',
  category: '',
  brand: '',
  model: '',
  state: ''
})


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
          ...(filters.state != '' && filters.state && {
            state: filters.state
          }),
          ...(filters.category != '' && filters.category && {
            category: filters.category
          }),
          ...(filters.brand != '' && filters.brand && {
            brand: filters.brand
          }),
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

watch(filters, useDebounce(async () => {
  await getAssets()
}, 500))

onMounted(async () => {
  await getAssets();
})

</script>