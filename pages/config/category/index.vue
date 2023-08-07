<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-col :lg="16">
        <el-card class="w-full">
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
      </el-col>
      <el-col :span="8">
        <el-card>
          <el-button type="primary" @click="modals.create = true">Crear nueva categoria</el-button>
        </el-card>
      </el-col>

    </el-row>
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <h2>Categorias</h2>
      </el-col>
      <el-col :span="24">
        <el-table :data="response.categories" stripe v-loading="loadingCategory">
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
                <el-button type="info" circle @click="modals.edit = true">
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
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon>
            <el-form-item label="Nombre">
              <el-input></el-input>
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
              <el-button type="primary" :disabled="!newCategory.name" @click="createCategory()"
                native-type="submit">Crear</el-button>
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

const modals = reactive({
  details: false,
  edit: false,
  create: false,
})

const newCategory = reactive<{
  name?: string,
  customFields?: { typeId: number }[]
}>({
  name: undefined,
  customFields: undefined
})

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

    const body = {
      name: newCategory.name
    }

    const { data, error } = await useAsyncData('createCategory', () => useFetch<Category>('/assets/categories',
      {
        method: 'post',
        body
      }
    ))
    loadingCategory.value = false;

    console.log(error.value)

    if (error.value) {
      throw error
    }
    await setCategories()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data}`
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

const removeCategory = async (id: number) => {
  try {
    const { data, error } = await useFetch<Category>(`/assets/categories/${id}`, {
      method: 'delete'
    })

    if (error) {
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

watch(filters, async () => {
  await setCategories()
})

onMounted(async () => {
  await setCategories()
});

</script>