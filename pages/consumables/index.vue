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
        <el-table-column prop="product.code" label="Código">
          <template #header>
            <el-input :debounce="2000" v-model="filters.search" placeholder="Nombre o código" clearable />
          </template>
        </el-table-column>

        <el-table-column prop="product.name" label="Nombre">
        </el-table-column>
        <el-table-column label="Categoría" prop="product.category.name">
          <template #header>
            <el-input :debounce="2000" v-model="filters.category" placeholder="Categoría" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Cantidad" prop="quantity">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.product.unit }}
          </template>
        </el-table-column>
        <el-table-column label="Deposito" prop="deposit.name">
          <template #header>
            <el-input :debounce="2000" v-model="filters.deposit" placeholder="Deposito" clearable />
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="" v-role="['superuser', 'auditor']">
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
            <el-form-item label="Código">
              <el-input v-model="product.code" placeholder="Ingrese aquí el código"></el-input>
            </el-form-item>
            <el-form-item label="Nombre">
              <el-input v-model="product.name" placeholder="Ingrese aquí el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Unidad de medida">
              <el-input v-model="product.unit" placeholder="Metros, Litros , Unidades"></el-input>
            </el-form-item>
            <el-form-item label="Unidad de precio">
              <el-input v-model="product.price" placeholder="Ingrese el precio"></el-input>
            </el-form-item>
            <el-form-item label="Description">
              <el-input v-model="product.description" placeholder="Ingrese aquí la descripción"
                type="textarea"></el-input>
            </el-form-item>
            <el-form-item label="Categoría del producto">
              <el-select v-model="product.categoryId" class="select-success" placeholder="Selecciona un deposito"
                label="Deposito" style="width: 100%" filterable>
                <el-option v-for="option in response.categories" :key="option.id" :value="option.id!"
                  :label="`${option.name}`">
                  {{ option.name }}
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Almacén del producto">
              <el-select v-model="product.depositId" class="select-success" placeholder="Selecciona un deposito"
                label="Deposito" style="width: 100%" filterable>
                <el-option v-for="option in response.deposits" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
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
              <el-input v-model="type.name" placeholder="Ingrese aquí el nombre"></el-input>
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
  roles: ['superuser', 'admin', 'auditor'],
});

const loadingProduct = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  search: '',
  category: '',
  deposit: ''
});

const response = reactive<{
  rows: Consumable[],
  categories: Category[],
  deposits: Deposit[],
  total: number
}>({
  rows: [],
  deposits: [],
  categories: [],
  total: 0
})

const products = reactive<{
  rows: Product[],
  total: number
}>({
  rows: [],
  total: 0
})
const category = reactive<{
  rows: Category[],
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
const product = reactive<{
  name: string,
  code: string,
  description: string,
  unit: string,
  price: string,
  depositId?: number,
  categoryId?: number,
}>({
  name: '',
  code: '',
  description: '',
  unit: '',
  price: '',
  categoryId: undefined,
  depositId: undefined
});


const getDeposit = async ({ name }: { name?: string }) => {
  try {
    const { data } = await useFetch<{ total: number, rows: Deposit[] }>('/assets/deposits', {
      params: {
        ...(name != '' && name && {
          name
        })
      }
    });
    return data.value;
  } catch (error) {
    console.log(error);
  }
}

const getProducts = async () => {
  try {
    loadingProduct.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Consumable[] }>('/consumables',
      {
        params: {
          ...(filters.search != '' && filters.search && {
            search: filters.search
          }),
          ...(filters.category != '' && filters.category && {
            category: filters.category
          }),
          ...(filters.deposit != '' && filters.deposit && {
            deposit: filters.deposit
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

const getCategories = async () => {
  try {
    const { data } = await useFetch<{ count: number, rows: Category[] }>('/assets/categories', {
      query: {
        type: 'consumable'
      }
    });

    response.categories = data.value?.rows || [];
  } catch (error) {
    console.log(error);
  }
}

const createProduct = async () => {
  try {
    loadingProduct.value = true;

    const { data, error } = await useFetch<Product>('/locations/types',
      {
        method: 'post',
        body: {
          name: product.name,
          code: product.code,
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

const setDeposit = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getDeposit(search);
  response.deposits = rta?.rows || []
}

watch(filters, useDebounce(async () => {
  await setProducts()
}, 500)
)

onMounted(async () => {
  await getCategories();
  await setProducts();
  await setDeposit();
});
</script>