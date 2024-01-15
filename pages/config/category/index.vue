<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader name="Categorías" />
      <el-col :span="24" :gutter="20">
        <el-col :span="24">
          <el-table :data="response.categories" stripe v-loading="loadingCategory">
            <el-table-column type="expand" width="50">
              <template #default="{ row }">
                <el-row>
                  <el-col :small="24" :md="12">
                    Descripción:
                    {{ row.description }}
                  </el-col>
                  <el-col :small="24" :md="12">
                    <el-table :data="row.customFields" :border="true">
                      <el-table-column label="Campos personalizados" prop="name"></el-table-column>
                    </el-table>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index" width="50" />
            <el-table-column prop="name" label="Nombre" min-width="120">
              <template #header>
                <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Tipo" min-width="120">
              <template #header>
                <el-select class="w-full" v-model="filters.type" placeholder="Tipo" clearable>
                  <el-option v-for="item in categoryType" :key="item.label" :label="item.label"
                    :value="item.value!"></el-option>
                </el-select>
              </template>
              <template #default="{ row }">
                {{ CATEGORIES_TYPES[row.type] }}
              </template>
            </el-table-column>
            <el-table-column label="Descripción" prop="description" min-width="120" />
            <el-table-column label="Total Activos" prop="count" min-width="120">
            </el-table-column>
            <el-table-column label="Acciones" width="150">
              <template #default="props">
                <el-row>
                  <el-button type="info" circle @click="editCategory(props.row)">
                    <Icon name="ep:edit" />
                  </el-button>
                  <el-button type="danger" circle @click="removeCategory(props.row.id)">
                    <Icon name="ep:delete" />
                  </el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
          <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="response.total" />
        </el-col>
      </el-col>
      <el-container>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Guardar categoría</h2>
          </template>
          <template #default>
            <CategoryFormSave @submit="setCategories" :id="categoryToEdit" ></CategoryFormSave>
          </template>
        </el-dialog>
        <LeftButton @click="createCategory"/>
      </el-container>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['categories:read', 'categories:update', 'categories:delete', 'categories:create'],
});

const CategoriesService = useCategories();
const categoriesService = new CategoriesService()

const categoryToEdit = ref<number>(0);

const loadingCategory = ref(false);

const CATEGORIES_TYPES = {
  asset: 'Activo',
  consumable: 'Consumible',
  accessory: 'Accesorio'
}

const categoryType = [
  { label: "Activo", value: "asset" },
  { label: "Consumible", value: "consumable" },
  { label: "Accesorio", value: "accessory" }
];

const filters = reactive({
  limit: 10,
  offset: 1,
  type: '',
  name: ''
});

const response = reactive<{
  categories: Category[],
  total: number
}>({
  categories: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
})


const getCategories = async () => {
  try {
    loadingCategory.value = true;

    const { data } = await categoriesService.getCategories({
      name: filters.name,
      type: filters.type,
      limit: filters.limit,
      offset: filters.offset,
    })

    loadingCategory.value = false;
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    console.log(error)
  }
}

const createCategory = () => {
  modals.create = true;
  categoryToEdit.value = 0;
}

const editCategory = (row: Category) => {
  modals.create = true;

  if(row.id) {
    categoryToEdit.value = row.id;
  }
}

const removeCategory = async (id: number) => {
  try {
    const { data } = await categoriesService.removeCategory(id)

    await setCategories()
  } catch (error) {
    console.error(error)
  }
}

const setCategories = async () => {
  const rta = await getCategories();
  response.categories = rta?.rows || []
  response.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setCategories()
}, 500)
)

onMounted(async () => {
  await setCategories();
});
</script>