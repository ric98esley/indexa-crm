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
                  @remove-tag="removeField" remote :remote-method="(name: string) => setSpecification(name)">
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
const SpecificationService = useSpecifications();

const specificationsService = new SpecificationService();
const categoriesService = new CategoriesService()
const loadingCategory = ref(false);
const loadingCustomFields = ref(false);

const router = useRouter();

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

const onBack = () => {
  router.back();
}

const getCategories = async () => {
  try {
    loadingCategory.value = true;

    const { data, error } = await categoriesService.getCategories({
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

    const { data } = await categoriesService.patchCategory(body);

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
const setSpecification = async (name: string) => {
  try {

    loadingCustomFields.value = true;
    const data = await specificationsService.getSpecification({ name });

    if (!data) throw new Error();

    specification.rows = data?.rows || [];
    specification.total = data?.total || 0;

    loadingCustomFields.value = false;
  } catch (error) {
    console.log(error);
  }

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
  await setSpecification('');
});

</script>