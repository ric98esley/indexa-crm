<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="20">
      <PageHeader name="Modelos" />
      <el-col :span="24">
        <el-table :data="models.rows" stripe v-loading="loadingModels">
          <el-table-column type="index" width="50" />
          <el-table-column prop="name" label="Nombre" min-width="120">
            <template #header>
              <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column prop="category.name" label="Categoría" min-width="120">
            <template #header>
              <el-input :debounce="2000" v-model="filters.category" placeholder="Categoría" clearable />
            </template>
          </el-table-column>
          <el-table-column prop="brand.name" label="Fabricante" min-width="120">
            <template #header>
              <el-input :debounce="2000" v-model="filters.brand" placeholder="Fabricante" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Total activos" min-width="120" prop="count">
          </el-table-column>
          <el-table-column label="Acciones" width="180">
            <template #default="props">
              <el-row>
                <el-button type="info" circle @click="editModel(props.row)">
                  <Icon name="ep:edit" />
                </el-button>
                <el-button type="primary" circle>
                  <Icon name="ep:view" />
                </el-button>
                <el-button type="danger" circle @click="removeCategory(props.row.id)">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="models.total" />
      </el-col>
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Guardar modelo</h2>
        </template>
        <template #default>
          <ModelFormSave :id="modelToEdit" @submit="setModels"></ModelFormSave>
        </template>
      </el-dialog>
      <LeftButton @click="modals.create = true" />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['models:read', 'models:update', 'models:delete', 'models:create'],
});

const loadingCategories = ref(false);
const loadingModels = ref(false);
const loadingBrands = ref(false);

const modelToEdit = ref<number>(0);

const ModelsServices = useModels();
const modelsServices = new ModelsServices();

const filters = reactive({
  limit: 10,
  offset: 1,
  category: '',
  brand: '',
  name: ''
})

const categories = reactive<{
  rows: Category[],
  total: number
}>({
  rows: [],
  total: 0
})
const brands = reactive<{
  rows: Brand[],
  total: number
}>({
  rows: [],
  total: 0
})

const models = reactive<{
  rows: Model[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
})

const model = reactive<{
  id?: number,
  name: string,
  categoryId?: number,
  brandId?: number
}>({
  id: undefined,
  name: '',
  categoryId: undefined,
  brandId: undefined
});


const getModels = async () => {
  try {

    loadingModels.value = true;
    const { data } = await modelsServices.getModels({
      name: filters.name,
      brand: filters.brand,
      category: filters.category,
      offset: filters.offset,
      limit: filters.limit

    })

    loadingModels.value = false;
    return data.value
  } catch (error) {
    loadingModels.value = false;
    console.error(error)
  }
}

const editModel = (row: Model) => {
  modelToEdit.value = row.id || 0;
  modals.create = true;
}

const removeCategory = async (id: number) => {
  try {
    const { data, error } = await useFetch<Model>(`/assets/models/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingModels.value = false;
      ElNotification({
        message: 'Error al borrar el modelo intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'El modelo ha sido borrada.'
    })
    await setModels()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar el modelo intente de nuevo mas tarde.'
    })
  }
}


const setModels = async () => {
  const rta = await getModels();
  models.rows = rta?.rows || []
  models.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setModels()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
  } else {
    model.id = undefined;
    model.brandId = undefined;
    model.categoryId = undefined;
    model.name = ''
  }
})

watch(() => modals.create, async () => {
  model.id = undefined;
  model.brandId = undefined;
  model.categoryId = undefined;
  model.name = ''
})

onMounted(async () => {
  await setModels();
});

</script>