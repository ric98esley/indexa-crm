<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="response.rows" stripe v-loading="loadingInventory">
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
              <el-button type="primary" circle @click="editProduct(props.row, 'add')">
                <Icon name="ep:plus" />
              </el-button>
              <el-button type="danger" circle @click="editProduct(props.row, 'sub')">
                <Icon name="ep:semi-select" />
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
          <el-row justify="space-between">
            <h2>Crear nueva tipo</h2>
            <el-switch v-model="productSwitch" active-text="Nuevo" inactive-text="Existente" />
          </el-row>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="warehouse"
            @submit.prevent="createInventory()" :rules="rules" ref="createFormRef">
            <el-form-item v-if="!productSwitch" label="Categoría del producto">
              <el-select v-model="warehouse.productId" class="select-success" placeholder="Selecciona un producto"
                label="Deposito" style="width: 100%" filterable remote :remote-method="setProducts" clearable>
                <el-option v-for="option in products.rows" :key="option.id" :value="option.id!"
                  :label="`${option.code} - ${option.name}`">
                  {{ option.code }} - {{ option.name }}
                </el-option>
              </el-select>
            </el-form-item>
            <el-col v-if="productSwitch">
              <el-form-item label="Código">
                <el-input v-model="product.code" placeholder="Ingrese aquí el código"></el-input>
              </el-form-item>
              <el-form-item label="Nombre">
                <el-input v-model="product.name" placeholder="Ingrese aquí el nombre"></el-input>
              </el-form-item>
              <el-form-item label="Categoría del producto">
                <el-select v-model="product.categoryId" class="select-success" placeholder="Selecciona un deposito"
                  label="Deposito" style="width: 100%" filterable clearable remote :remote-method="getCategories">
                  <el-option v-for="option in response.categories" :key="option.id" :value="option.id!"
                    :label="`${option.name}`">
                    {{ option.name }}
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Unidad de medida">
                <el-input v-model="product.unit" placeholder="Metros, Litros , Unidades"></el-input>
              </el-form-item>
              <el-form-item label="Precio">
                <el-input v-model="product.price" placeholder="Ingrese el precio"></el-input>
              </el-form-item>
              <el-form-item label="Descripción">
                <el-input v-model="product.description" placeholder="Ingrese aquí la descripción"
                  type="textarea"></el-input>
              </el-form-item>
            </el-col>
            <el-form-item label="Cantidad" prop="quantity">
              <el-input v-model="warehouse.quantity" placeholder="10"></el-input>
            </el-form-item>
            <el-form-item label="Mínimo" prop="quantity">
              <el-input v-model="warehouse.min" placeholder="10"></el-input>
            </el-form-item>
            <el-form-item label="Almacén del producto">
              <el-select v-model="warehouse.locationId" class="select-success" placeholder="Selecciona un deposito"
                label="Deposito" style="width: 100%" filterable clearable>
                <el-option v-for="option in response.deposits" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"
                :disabled="!((warehouse.productId && warehouse.locationId) || (product.code && product.categoryId))"
                native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.add">
        <template #header>
          <h2>Agregar al inventario</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="movement"
            @submit.prevent="addProducts()" :rules="rules" ref="addFormRef">
            <el-form-item label="Cantidad" prop="quantity">
              <el-input v-model="movement.quantity" placeholder="Ingrese aquí la cantidad"></el-input>
            </el-form-item>
            <el-form-item label="Nota">
              <el-input v-model="movement.notes" placeholder="Ingrese aquí la nota"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!movement.quantity" native-type="submit">Agregar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.sub">
        <template #header>
          <h2>Remover del inventario</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="movement"
            @submit.prevent="subProducts()" :rules="rules" ref="subFormRef">
            <el-form-item label="Cantidad" prop="quantity">
              <el-input v-model="movement.quantity" placeholder="Ingrese aquí la cantidad"></el-input>
            </el-form-item>
            <el-form-item label="Nota">
              <el-input v-model="movement.notes" placeholder="Ingrese aquí la nota"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!movement.quantity" native-type="submit">Remover</el-button>
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
import { FormInstance, FormRules } from 'element-plus';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permission: ['consumables:read', 'consumables:create', 'consumables:update', 'consumables:delete'],
});

const CategoryService = useCategories();
const categoryService = new CategoryService();
const LocationService = useLocation();
const locationService = new LocationService();

const createFormRef = ref<FormInstance>()
const addFormRef = ref<FormInstance>()
const subFormRef = ref<FormInstance>()

const loadingInventory = ref(false);
const loadingProduct = ref(false);
const productSwitch = ref(false);

const filters = reactive({
  limit: 10,
  offset: 1,
  search: '',
  category: '',
  deposit: ''
});

const response = reactive<{
  rows: Consumable[],
  categories: Category[],
  deposits: Warehouse[],
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

const modals = reactive({
  details: false,
  add: false,
  create: false,
  sub: false
});


const movement = reactive<{
  id?: number,
  quantity: string,
  inTransit: boolean,
  notes: string
}>({
  id: undefined,
  quantity: '',
  inTransit: false,
  notes: ''
});
const product = reactive<{
  name: string,
  code: string,
  description: string,
  unit: string,
  price: string,
  categoryId?: number,
}>({
  name: '',
  code: '',
  description: '',
  unit: '',
  price: '',
  categoryId: undefined,
});

const warehouse = reactive<{
  locationId?: number,
  quantity: string,
  productId?: number,
  min: number
}>({
  locationId: undefined,
  quantity: '',
  productId: undefined,
  min: 0
})
const rules = reactive<FormRules<{
  quantity: string,
}>>({
  quantity: [
    { pattern: /^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, trigger: 'blur', message: "Debes introducir un numero Entero o Racional" },
  ],
})



const getWarehouse = async ({ name }: { name?: string }) => {
  try {
    const { data } = await locationService.getLocations({
      name,
      limit: 10,
      offset: 0,
      status: ['desplegable']
    });
    return data.value;
  } catch (error) {
    console.log(error);
  }
}

const getInventory = async () => {
  try {
    loadingInventory.value = true;
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

    loadingInventory.value = false;
    return data.value
  } catch (error) {
    loadingInventory.value = false;
    ElNotification({
      message: 'Error al obtener los tipos intente de nuevo mas tarde'
    })
  }
}

const getProducts = async (search?: string) => {
  try {
    loadingProduct.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Product[] }>('/products',
      {
        params: {
          ...(search && search != '' && {
            search
          }),
          limit: 10,
          offset: 0
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


const getCategories = async (query: string) => {
  try {
    const { data } = await categoryService.getCategories({
      name: query,
      limit: 10,
      offset: 0,
      type: 'consumable'
    });
    response.categories = data.value.rows;
  } catch (error) {
    console.log(error);
  }
}

const createInventory = async () => {
  try {
    loadingInventory.value = true;

    const { data, error } = await useFetch<Product>('/consumables',
      {
        method: 'post',
        body: {
          ...(productSwitch.value && {
            product: {
              code: product.code,
              name: product.name,
              description: product.description,
              unit: product.unit,
              price: product.price,
              categoryId: product.categoryId,
            }
          }),
          ...(!productSwitch.value && {
            productId: warehouse.productId
          }),
          min: warehouse.min,
          quantity: warehouse.quantity,
          locationId: warehouse.locationId,
        }
      },
    )
    loadingInventory.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setInventory()
    ElNotification({
      title: 'Creada correctamente',
    })
    return data.value
  } catch (error) {
    loadingInventory.value = false;
    ElNotification({
      title: 'Error al crear tipos intente de nuevo mas tarde',
    })
  }
}

const addProducts = async () => {
  try {
    loadingInventory.value = true;

    const body = {
      quantity: movement.quantity,
      notes: movement.notes,
      inTransit: movement.inTransit,
    }

    const { data, error } = await useFetch<Product>(`/consumables/${movement.id}/add`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingInventory.value = false;


    if (error.value) {
      throw error
    }
    await setInventory()
    ElNotification({
      title: 'Producto agregado correctamente',
    })

    movement.quantity = '';
    movement.id = undefined;
    movement.notes = '';
    return data.value
  } catch (error) {
    loadingInventory.value = false;
    ElNotification({
      title: 'Error al añadir los productos intente de nuevo mas tarde',
    })
  }
}
const subProducts = async () => {
  try {
    loadingInventory.value = true;

    const body = {
      quantity: movement.quantity,
      notes: movement.notes,
      inTransit: movement.inTransit,
    }

    const { data, error } = await useFetch<Product>(`/consumables/${movement.id}/sub`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingInventory.value = false;


    if (error.value) {
      throw error
    }
    await setInventory()
    ElNotification({
      title: 'Producto removido correctamente',
    })

    return data.value
  } catch (error) {
    loadingInventory.value = false;
    ElNotification({
      title: 'Error al consumir los productos intente de nuevo mas tarde',
      message: 'Verifica la cantidad que deseas consumir exista en el inventario'
    })
  }
}

const editProduct = (row: Consumable, type: string) => {
  if (type == 'add') modals.add = true;
  if (type == 'sub') modals.sub = true;
  movement.id = row.id
}

const setInventory = async () => {
  const rta = await getInventory();
  response.rows = rta?.rows || []
  response.total = rta?.total || 0
}

const setProducts = async (query?: string) => {
  const rta = await getProducts(query);
  products.rows = rta?.rows || []
}

const setDeposit = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getWarehouse(search);
  response.deposits = rta?.rows || []
}

const productStatus = ({
  row,
  rowIndex,
}: {
  row: Consumable,
  rowIndex: number
}) => {
  if (row.min && row.min > Number(row.quantity)) {
    return 'danger-row'
  }
  return ''
}

watch(filters, useDebounce(async () => {
  await setInventory()
}, 500)
)

onMounted(async () => {
  await setInventory();
  await setDeposit();
});
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-5);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-5);
}

.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-5);
}
</style>