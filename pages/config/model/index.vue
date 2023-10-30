<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <el-table :data="models.rows" stripe v-loading="loadingModels">
          <el-table-column type="expand" width="50">
            <template #default="props">
            </template>
          </el-table-column>
          <el-table-column type="index" width="50" />
          <el-table-column prop="name" label="Nombre">
            <template #header>
              <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Cantidad de activos">
            <template #default="props">
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
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
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
          layout="total, sizes, prev, pager, next, jumper" :total="models.total" />
      </el-col>
    </el-row>
    <el-container>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar modelo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon @submit.prevent="patchModel()">
            <el-form-item label="Nombre">
              <el-input v-model="model.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Categoria">
              <el-select class="w-full" v-model="model.categoryId" filterable remote
                placeholder="Porfavor escoge una categoria" :loading="loadingCategories" :remote-method="searchCategory">
                <el-option v-for="item in categories.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item label="Fabricante">
              <el-select class="w-full" v-model="model.brandId" filterable remote placeholder="Porfavor escoge una marca"
                :loading="loadingBrands" :remote-method="searchBrand">
                <el-option v-for="item in brands.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!model.name && !model.categoryId && !model.brandId"
                native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nuevo modelo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="model"
            @submit.prevent="createModel()">
            <el-form-item label="Nombre">
              <el-input v-model="model.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Categoria">
              <el-select class="w-full" v-model="model.categoryId" filterable remote
                placeholder="Porfavor escoge una categoria" :loading="loadingCategories" :remote-method="searchCategory">
                <el-option v-for="item in categories.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item label="Fabricante">
              <el-select class="w-full" v-model="model.brandId" filterable remote placeholder="Porfavor escoge una marca"
                :loading="loadingBrands" :remote-method="searchBrand">
                <el-option v-for="item in brands.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!model.name && !model.categoryId && !model.brandId"
                native-type="submit">Crear</el-button>
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

const loadingCategories = ref(false);
const loadingModels = ref(false);
const loadingBrands = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
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


const getCategories = async (name: string) => {
  try {
    loadingCategories.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Category[] }>('/categories',
      {
        params: {
          ...(name != '' && name && {
            name
          }),
          ...(name == '' && !name && model.categoryId && {
            id: model.categoryId
          }),
          limit: 20
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las categorias intente de nuevo mas tarde'
      })
    }

    loadingCategories.value = false;
    return data.value
  } catch (error) {
    loadingCategories.value = false;
    ElNotification({
      message: 'Error al obtener las categorias intente de nuevo mas tarde'
    })
  }
}

const getBrands = async (name: string) => {
  try {
    loadingBrands.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Brand[] }>('/brands',
      {
        params: {
          ...(name != '' && name && {
            name
          }),
          ...(name == '' && !name && model.brandId && {
            id: model.brandId
          }),
          limit: 20
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingBrands.value = false;
    return data.value
  } catch (error) {
    loadingBrands.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const getModels = async () => {
  try {
    loadingModels.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Model[] }>('/assets/models',
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
        message: 'Error al obtener las Modelos intente de nuevo mas tarde'
      })
    }

    loadingModels.value = false;
    return data.value
  } catch (error) {
    loadingModels.value = false;
    ElNotification({
      message: 'Error al obtener las Modelos intente de nuevo mas tarde'
    })
  }
}

const createModel = async () => {
  try {
    loadingModels.value = true;

    const { data, error } = await useFetch<Model>('/assets/models',
      {
        method: 'post',
        body: {
          name: model.name,
          categoryId: model.categoryId,
          brandId: model.brandId
        }
      },
    )
    loadingModels.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear Modelo intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setModels()
    ElNotification({
      title: 'Modelo creado correctamente',
      message: `${data.value?.name}`
    })
    model.id = undefined;
    model.name = '';
    model.categoryId = 0;
    model.brandId = 0;
    return data.value
  } catch (error) {
    loadingModels.value = false;
    ElNotification({
      title: 'Error al crear modelo intente de nuevo mas tarde',
    })
  }
}

const patchModel = async () => {
  try {
    loadingModels.value = true;

    const body = {
      name: model.name,
      categoryId: model.categoryId,
      brandId: model.brandId
    }

    const { data, error } = await useFetch<Model>(`/assets/models/${model.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingModels.value = false;


    if (error.value) {
      throw error
    }
    await setModels()
    ElNotification({
      title: 'Modelo modificada correctamente',
      message: `${data.value?.name}`
    })

    model.id = undefined;
    model.name = '';
    model.categoryId = 0;
    model.brandId = 0
    return data.value
  } catch (error) {
    loadingModels.value = false;
    ElNotification({
      title: 'Error al modificar el modelo intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editModel = (row: Model) => {
  modals.edit = true;

  model.id = row.id;
  model.name = row.name || '';
  model.categoryId = row.category.id!;
  model.brandId = row.brand.id!;
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

const searchCategory = async (query: string) => {
  loadingCategories.value = true;
  await setCategories(query)

}

const searchBrand = async (query: string) => {
  loadingBrands.value = true;
  await setBrands(query)

}

const setModels = async () => {
  const rta = await getModels();
  models.rows = rta?.rows || []
  models.total = rta?.total || 0
}
const setCategories = async (name: string) => {
  const rta = await getCategories(name);
  categories.rows = rta?.rows || [];
  categories.total = rta?.total || 0;
}
const setBrands = async (name: string) => {
  const rta = await getBrands(name);
  brands.rows = rta?.rows || [];
  brands.total = rta?.total || 0;
}

watch(filters, useDebounce(async () => {
  await setModels()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
    await setCategories('')
    await setBrands('')
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
  await setCategories('');
  await setBrands('');
});

</script>