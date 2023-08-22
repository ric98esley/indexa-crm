<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-col :lg="16">
        <el-card class="w-full">
          <template #header>
            Buscar categoría
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
      </el-col>
      <el-col :span="8">
        <el-card>
          <el-button type="primary" @click="modals.create = true">Crear nueva categoria</el-button>
        </el-card>
      </el-col>

    </el-row>
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <el-table :data="response.categories" stripe v-loading="loadingCategory">
          <el-table-column type="expand" width="50">
            <template #default="props">
              <el-table :data="props.row.customFields" :border="true">
                <el-table-column label="Campos personalizados" prop="name"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column type="index" width="50" />
          <el-table-column prop="name" label="Nombre">
            <template #header>
              <el-input v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Cantidad de marcas">
            <template #default="props">
              {{ props.row.brands.length }}
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
          <h2>Editar la categoria</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon
            @submit.prevent="patchCategory()">
            <el-form-item label="Nombre">
              <el-input v-model="newCategory.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-select class="w-full" v-model="newCategory.customFields" multiple filterable reserve-keyword
                placeholder="Porfavor escoge un campo personalizado" :loading="loadingCustomFields"
                @remove-tag="removeField">
                <el-option v-for="item in specification.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!newCategory.name" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nueva categoria</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="newCategory"
            @submit.prevent="createCategory()">
            <el-form-item label="Nombre">
              <el-input v-model="newCategory.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-select class="w-full" v-model="newCategory.customFields" multiple filterable reserve-keyword
                placeholder="Porfavor escoge una categoria" :loading="loadingCustomFields">
                <el-option v-for="item in specification.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!newCategory.name" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
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

const loadingCategory = ref(false)
const loadingCustomFields = ref(false)

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

const newCategory = reactive<{
  name?: string,
  customFields?: number[],
  removeFields?: number[]
}>({
  name: undefined,
  customFields: undefined,
  removeFields: undefined
});

const getSpecification = async () => {
  try {
    loadingCustomFields.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Specification[] }>('/assets/specification');
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
    const { data, error } = await useFetch<{ total: number, rows: Category[] }>('/assets/categories',
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
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las categorias intente de nuevo mas tarde'
      })
    }

    loadingCategory.value = false;
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    ElNotification({
      message: 'Error al obtener las categorias intente de nuevo mas tarde'
    })
  }
}

const createCategory = async () => {
  try {
    loadingCategory.value = true;

    const { data, error } = await useFetch<Category>('/assets/categories',
      {
        method: 'post',
        body: {
          name: newCategory.name,
          customFields: newCategory.customFields?.map((field) => {
            return { typeId: field }
          })
        }
      },
    )
    loadingCategory.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear categorias intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setCategories()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data.value?.name}`
    })
    newCategory.name = undefined;
    newCategory.customFields = undefined;
    newCategory.removeFields = undefined;
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    ElNotification({
      title: 'Error al crear categorias intente de nuevo mas tarde',
    })
  }
}

const patchCategory = async () => {
  try {
    loadingCategory.value = true;

    const body = {
      name: newCategory.name,
      customFields: newCategory.customFields?.map((field) => {
        return { typeId: field }
      }),
      removeFields: newCategory.removeFields?.map((field) => {
        return { typeId: field }
      })
    }

    const { data, error } = await useFetch<Category>('/assets/categories',
      {
        method: 'patch',
        body
      }
    );
    loadingCategory.value = false;


    if (error.value) {
      throw error
    }
    await setCategories()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data.value.data.message.message}`
    })
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    ElNotification({
      title: 'Error al crear categorias intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editCategory = (row: Category) => {
  modals.edit = true;
  const fields = row.customFields!.map((field) => field.id!)
  newCategory.name = row.name;
  newCategory.customFields = fields;
}
const removeField = (field: number) => {
  newCategory.removeFields?.push(field)
}

const removeCategory = async (id: number) => {
  try {
    const { data, error } = await useFetch<Category>(`/assets/categories/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingCategory.value = false;
      ElNotification({
        message: 'Error al borrar la categoria intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La categoria ha sido borrada.'
    })
    await setCategories()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la categoria intente de nuevo mas tarde.'
    })
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

watch(filters, async () => {
  await setCategories()
})

watch(modals.edit, async () => {
  console.log(newCategory.removeFields)
  newCategory.removeFields = undefined
})

onMounted(async () => {
  await setCategories();
  await setSpecification();
});

</script>