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
        <el-table-column label="Deposito" prop="deposit.name">
          <template #header>
            <el-input :debounce="2000" v-model="filters.deposit" placeholder="Deposito" clearable />
          </template>
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
        <template #header>
          <h2>Crear nueva tipo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="type"
            @submit.prevent="createProduct()">
            <el-form-item label="Nombre">
              <el-input v-model="type.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!type.name" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar tipo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="type"
            @submit.prevent="patchProduct()">
            <el-form-item label="Nombre">
              <el-input v-model="type.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!type.name" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
    <el-row justify="end" :span="24">
      <div
        class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
        @click="modals.create = true">
        <Icon name="ep:plus" size="2rem" color="white" />
      </div>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'asistente', 'auditor', 'receptor'],
});

const loadingProduct = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  category: '',
  deposit: ''
});

const response = reactive<{
  rows: Product[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
  menu: false
});


const type = reactive<{
  id?: number,
  name: string
}>({
  id: undefined,
  name: ''
});


const getProducts = async () => {
  try {
    loadingProduct.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Product[] }>('/consumables/products',
      {
        params: {
          ...(filters.name != '' && filters.name && {
            search: filters.name
          }),
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit,
          }),
          ...(filters.category
            && {
            category: filters.category,
          })
        }
      }
    );
    if (error.value) {
      throw new Error()
    }

    loadingProduct.value = false;
    return data.value
  } catch (error) {
    loadingProduct.value = false;
    ElNotification({
      message: 'Error al obtener los tipos intente de nuevo mas tarde'
    })
  }
}

const createProduct = async () => {
  try {
    loadingProduct.value = true;

    const { data, error } = await useFetch<Product>('/locations/types',
      {
        method: 'post',
        body: {
          name: type.name,
        }
      },
    )
    loadingProduct.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear tipos intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setProducts()
    ElNotification({
      title: 'Tipo creada correctamente',
      message: `${data.value?.name}`
    })
    type.id = undefined;
    type.name = '';
    return data.value
  } catch (error) {
    loadingProduct.value = false;
    ElNotification({
      title: 'Error al crear tipos intente de nuevo mas tarde',
    })
  }
}

const patchProduct = async () => {
  try {
    loadingProduct.value = true;

    const body = {
      name: type.name,
    }

    const { data, error } = await useFetch<Product>(`/locations/types/${type.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingProduct.value = false;


    if (error.value) {
      throw error
    }
    await setProducts()
    ElNotification({
      title: 'Tipo modificada correctamente',
      message: `${data.value?.name}`
    })

    type.id = undefined;
    type.name = '';
    return data.value
  } catch (error) {
    loadingProduct.value = false;
    ElNotification({
      title: 'Error al modificar la Tipo intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editProduct = (row: Product) => {
  modals.edit = true;
  type.id = row.id;
  type.name = row.name || '';
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
  const rta = await getProducts();
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