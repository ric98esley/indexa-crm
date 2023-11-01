<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <el-table :data="response.categories" stripe v-loading="loadingCategory">
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <el-row>
                <el-col :span="12">
                  Descripción:
                  {{ row.description }}
                </el-col>
                <el-col :span="12">
                  <el-table :data="row.customFields" :border="true">
                    <el-table-column label="Campos personalizados" prop="name"></el-table-column>
                  </el-table>
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
          <el-table-column>
            <template #default="{ row }">
              {{ row.type == 'asset' ? 'Activo' : 'Consumible' }}
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
            <template #default="props">
              <el-row>
                <el-button type="info" circle @click="editCategory(props.row)">
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
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
          layout="total, sizes, prev, pager, next, jumper" :total="response.total" />
      </el-col>
    </el-row>
    <el-container>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar la categoría</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon
            @submit.prevent="patchCategory()">
            <el-form-item label="Nombre">
              <el-input v-model="category.name" placeholder="Ingrese aquí el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Campos personalizados" v-if="category.type === 'asset'">
              <el-select class="w-full" v-model="category.customFields" multiple filterable reserve-keyword
                placeholder="Por favor escoge un campo personalizado" :loading="loadingCustomFields"
                @remove-tag="removeField">
                <el-option v-for="item in specification.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item label="Tipo">
              <el-select class="w-full" v-model="category.type">
                <el-option v-for="item in categoryType" :key="item.label" :label="item.label"
                  :value="item.value!"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Descripción">
              <el-input v-model="category.description" type="textarea"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!category.name" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nueva categoría</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="category"
            @submit.prevent="createCategory()">
            <el-form-item label="Nombre">
              <el-input v-model="category.name" placeholder="Ingrese aquí el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Especificaciones" v-if="category.type === 'asset'">
              <el-select class="w-full" v-model="category.customFields" multiple filterable reserve-keyword
                placeholder="Por favor escoge características" :loading="loadingCustomFields">
                <el-option v-for="item in specification.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item label="Tipo">
              <el-select class="w-full" v-model="category.type">
                <el-option v-for="item in categoryType" :key="item.label" :label="item.label"
                  :value="item.value!"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Descripción">
              <el-input v-model="category.description" type="textarea"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!category.name" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-row justify="end" :span="24">
        <div
          class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
          @click="modals.create = true">
          <Icon name="ep:plus" size="2rem" color="white" />
        </div>
      </el-row>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
});

const CategoriesService = useCategories();
const categoriesService = new CategoriesService()
const loadingCategory = ref(false);
const loadingCustomFields = ref(false);

const categoryType = [
  { label: "Activo", value: "asset" },
  { label: "Consumible", value: "consumable" },
];


const filters = reactive({
  limit: 10,
  offset: 0,
  name: ''
})
const specification = reactive<{
  rows: Specification[],
  total: number,
}>({
  rows: [],
  total: 0
})

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

const category = reactive<{
  id?: number,
  name: string,
  description: string
  customFields: number[],
  removeFields: number[],
  type: string
}>({
  id: undefined,
  name: '',
  description: '',
  customFields: [],
  removeFields: [],
  type: ''
});

const getSpecification = async () => {
  try {
    loadingCustomFields.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Specification[] }>('/categories/specifications');
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las campos personalizados intente de nuevo mas tarde'
      })
    }

    loadingCustomFields.value = false;
    return data.value;
  } catch (error) {
    loadingCustomFields.value = false;
    ElNotification({
      message: 'Error al obtener las personalizados intente de nuevo mas tarde'
    })
  }
}

const getCategories = async () => {
  try {
    loadingCategory.value = true;

    const { data, error } = await categoriesService.getCategories({
      name: filters.name,
      offset: filters.offset,
      limit: filters.limit
    })

    loadingCategory.value = false;
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    console.log(error)
  }
}

const createCategory = async () => {
  try {
    loadingCategory.value = true;

    const { data, error } = await categoriesService.createCategory({
      name: category.name,
      customFields: category.customFields,
      description: category.description,
      type: category.type
    })

    loadingCategory.value = false;

    await setCategories()
    category.id = undefined;
    category.name = '';
    category.customFields = [];
    category.removeFields = [];
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    console.error(error)
  }
}

const patchCategory = async () => {
  try {
    loadingCategory.value = true;

    const body = {
      id: category.id,
      name: category.name,
      customFields: category.customFields,
      removeFields: category.removeFields,
      type: category.type,
      ...(category.description && {
        description: category.description
      })
    }

    const { data }  = await categoriesService.patchCategory(body);

    loadingCategory.value = false;

    await setCategories()

    category.id = undefined;
    category.name = '';
    category.customFields = [];
    category.removeFields = [];
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    console.error(error)
  }
}

const editCategory = (row: Category) => {
  modals.edit = true;

  const fields = row.customFields!.map((field) => field.id!)
  category.id = row.id;
  category.name = row.name || '';
  category.customFields = fields;
  category.type = row.type;
  category.description = row.description;
}
const removeField = (field: number) => {
  category.removeFields?.push(field)
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
const setSpecification = async () => {
  const rta = await getSpecification();
  specification.rows = rta?.rows || [];
  specification.total = rta?.total || 0;

}

watch(filters, useDebounce(async () => {
  await setCategories()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit == false) {
    category.removeFields = [];
    category.name = '';
    category.type = '';
    category.description = '';
  }
})

onMounted(async () => {
  await setCategories();
  await setSpecification();
});

</script>