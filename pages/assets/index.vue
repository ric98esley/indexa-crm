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
      <el-table-column type="expand">
        <template #default="props">
          <div m="4">
            <p m="t-0 b-2">prueba</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Serial" prop="serial">
      </el-table-column>
      <el-table-column label="Estado" prop="state.name">
      </el-table-column>
      <el-table-column label="Descripción">
        <template #default="{ row }">
          <div m="4">
            <p m="t-0 b-2">{{ row.model.category.name }} - {{ row.model.brand.name }} - {{ row.model.name }}</p>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
      :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
      :total="response.total"/>
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

const loading = ref(true)

const filters = reactive({
  limit: 10,
  offset: 0,
  serial: ''
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
// const handleSizeChange = async (val: number) => {
//   await getAssets();
// }
// const handleCurrentChange = async (val: number) => {
//   await getAssets();
// }

watch(filters, useDebounce(async () =>{
  await getAssets()
}, 500))

onMounted(async () => {
  await getAssets();
})

</script>