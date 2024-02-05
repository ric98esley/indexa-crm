<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="response.rows" stripe v-loading="loadingProduct">
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
        <el-table-column prop="name" label="Nombre">
          <template #header>
            <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Categoría" prop="category.name">
          <template #header>
            <el-input :debounce="2000" v-model="filters.category" placeholder="Categoría" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Precio" prop="price">
        </el-table-column>
        <el-table-column>
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editProduct(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeProduct(props.row.id)" v-role="['superuser', 'auditor']">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="response.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <ProductFormSave @submit="setProducts"></ProductFormSave>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <ProductFormSave  :id="productToEdit" @submit="setProducts"></ProductFormSave>
      </el-dialog>
    </el-container>
    <LeftButton @click="modals.create = true"></LeftButton>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const ProductService = useProducts();
const productService = new ProductService();

const loadingProduct = ref(false);
const productToEdit = ref<number | undefined>(0);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  category: '',
});

const response = reactive<{
  rows: Product[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  create: false,
  edit: false
});


const type = reactive<{
  id?: number,
  name: string
}>({
  id: undefined,
  name: ''
});

const editProduct = (row: Product) => {
  modals.edit = true;
  productToEdit.value = row.id;
}

const removeProduct = async (id: number) => {
  try {
    const { data, error } = await useFetch<Product>(`/locations/types/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      throw new Error()
    }

    ElNotification({
      message: 'La Tipo ha sido borrada.'
    })
    await setProducts()
  } catch (error) {
    loadingProduct.value = false;
    ElNotification({
      message: 'Error al borrar la Tipo intente de nuevo mas tarde.'
    })
  }
}

const setProducts = async () => {
  const rta = await productService.find(filters)
  response.rows = rta?.rows || []
  response.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setProducts()
}, 500)
)

onMounted(async () => {
  await setProducts();
});
</script>