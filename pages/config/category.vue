<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24">
      <el-card class="w-full m-2">
        <template #header>
          Buscar activos
        </template>
        <el-row :gutter="20" align="middle">
          <el-col :span="22">
            <el-input v-model="filters.name" placeholder="Nombre" clearable class="w-50 m-4" />
          </el-col>
          <el-col :span="2">
            <Icon name="ep:filter" class="m-4" />
          </el-col>
        </el-row>
      </el-card>
    </el-row>
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <h2>Categorias</h2>
      </el-col>
      <el-col :span="24">
        <el-table :data="response.categories" stripe v-loading="loadingCategory">
          <el-table-column type="index" width="50" />
          <el-table-column prop="name" label="Nombre">
          </el-table-column>
          <el-table-column label="Cantidad de marcas">
            <template #default="props">
              {{ props.row.brands.length }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
          layout="total, sizes, prev, pager, next, jumper" :total="response.total"  />
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
});

const loadingCategory = ref(false)

const filters = reactive({
  limit: 10,
  offset: 0,
  name: ''
})

const response = reactive<{
  categories: Category[],
  total: number
}>({
  categories: [],
  total: 0
})

watch(filters, async () => {
  const rta = await getCategories();
  response.categories = rta?.rows || []
  response.total = rta?.total || 0
})

const getCategories = async () => {
  try {
    loadingCategory.value = true;
    const { data } = await useFetch<{ count: number, rows: Category[] }>('/assets/categories',
      {
        params: {
          ...(filters.name != '' && filters.name && {
            name: filters.name
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
    loadingCategory.value = false;
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    ElNotification({
      message: 'Error al obtener las categorias intente de nuevo mas tarde'
    })
  }
}

onMounted(async () => {
  const rta = await getCategories();
  response.categories = rta?.rows || []
  response.total = rta?.total || 0
});

</script>