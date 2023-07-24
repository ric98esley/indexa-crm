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

    <el-table :data="response.assets" v-loading="pending">
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
    <el-pagination class="m-4" v-model:current-page="currentPage" v-model:page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
      :total="response.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
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

const currentPage = ref(4);
const pageSize = ref(100);

const filters = reactive({
  serial: ''
})

const { data, pending, error } = useLazyFetch<{ assets: Asset[], total: number }>('/assets');

watch(pending, () => {
  console.log(data.value)
  response.assets = data.value?.assets || [];
  response.total = data.value?.total || 0;
})

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

</script>