<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <PageHeader>
          <template #title>
            Reporte de: {{ route.query.type == 'checking' ? 'Entradas' : 'Salidas' }}
          </template>
          <template #buttons>
            <el-button @click="setAssignmentsExcel" type="primary">
              Exporta a excel
            </el-button>
          </template>
        </PageHeader>
      </el-col>
      <el-col class="py-4">
        <p>
          <label>Fecha</label>
        </p>
        <el-row>
          <el-form>
            <el-row>
              <el-form-item class="ml-4 w-10">
                <el-button @click="modals.filter = true" type="primary" circle class="">
                  <Icon name="ep:filter" />
                </el-button>
              </el-form-item>
              <el-form-item class="w-64 sm:w-auto ml-4">
                <el-date-picker v-model="filters.startDate" type="datetime" placeholder="Fecha de inicio"
                  format="YYYY/MM/DD" value-format="x" :shortcuts="shortcuts" />
              </el-form-item>
              <div class="ml-4 w-10 flex items-center sm:items-start sm:mt-1">
                <span class="ml-2">al</span>
              </div>
              <el-form-item class="w-64 sm:w-auto ml-4 sm:ml-0 sm:mr-4">
                <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite" format="YYYY/MM/DD"
                  value-format="x" />
              </el-form-item>
            </el-row>
          </el-form>
        </el-row>
      </el-col>
      <el-col>
        <el-row>
          <el-tabs v-model="type" class="w-full" type="card">
            <el-tab-pane label="Detalles activos" name="assets">
              <AssignmentsTableView :assignments="movements.rows" v-model:limit="filters.limit" v-model:filters="filters"
                :total="movements.total" :loading="loadingAssignments" />
            </el-tab-pane>
            <el-tab-pane label="Detalles por agencia" name="agencia">
              <el-alert title="Debes ingresar un rango de fechas para obtener un resultado en la búsqueda"
                type="warning" />
              <AssignmentsTableLocation :data="movementsByLocations.rows" :total="movementsByLocations.total"
                v-model:filters="filters" :order-type="route.query.type?.toString()" />
            </el-tab-pane>
            <el-tab-pane label="Detalles por ordenes" name="order">
              <OrderTableAll :data="orders.rows" :loading="loadingOrders" :total="orders.total"
                v-model:filters="orderFilters" />
            </el-tab-pane>
          </el-tabs>
        </el-row>
        <el-container>
          <el-dialog v-model="modals.filter">
            <template #header>
              Filtros
            </template>
            <el-form label-position="top">
              <el-row>
                <el-form-item label="Mostrar lo oculto">
                  <el-switch v-model="filters.paranoid" active-text="VER" />
                </el-form-item>
                <el-form-item label="Mostrar actualmente asignado">
                  <el-switch v-model="filters.all" inactive-text="VER" />
                </el-form-item>
              </el-row>
              <el-form-item label="Lugar del activo">
                <el-input v-model="filters.location" placeholder="Código o nombre del lugar" clearable />
              </el-form-item>
              <el-form-item label="Grupo">
                <el-input v-model="filters.group" placeholder="Código o nombre del grupo" clearable />
              </el-form-item>
              <el-form-item label="Serial">
                <el-input v-model="filters.serial" placeholder="Código del activo" clearable />
              </el-form-item>
              <el-form-item label="Categoría">
                <el-input v-model="filters.category" placeholder="Nombre de la categoría" clearable />
              </el-form-item>
              <el-form-item label="Modelo">
                <el-input v-model="filters.model" placeholder="Nombre del modelo" clearable />
              </el-form-item>
              <el-form-item label="Marca">
                <el-input v-model="filters.brand" placeholder="Nombre de la marca" clearable />
              </el-form-item>
              <el-row justify="space-between">
                <el-form-item label="Tipo de orden">
                  <el-select v-model="filters.order" placeholder="Tipo de orden">
                    <el-option v-for="option in sortType" :key="option.value" :value="option.value" :label="option.label">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-row>
            </el-form>
          </el-dialog>
          <OrderTableView v-model:open="modals.order" :id="orderId" />
        </el-container>
      </el-col>
    </el-row>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['movements:read', 'movements:update', 'movements:delete', 'movements:create'],
});

const MovementServices = useMovements();
const OrdersServices = useOrders();
const movementsServices = new MovementServices();
const ordersServices = new OrdersServices();

const route = useRoute();

const loadingAssignments = ref(false);
const loadingAssignmentsByLocation = ref(false);
const loadingOrders = ref(false);
const orderId = ref(0);

const type = ref('order')


const shortcuts = [
  {
    text: 'Hoy',
    value: new Date(),
  },
  {
    text: 'Ayer',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: 'Semana pasada',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: 'Mes pasado',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 30)
      return date
    },
  },
  {
    text: 'Trimestre pasado',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 90)
      return date
    },
  }
]

const sortBy = [
  {
    label: 'Fecha',
    value: 'createdAt'
  },
  {
    label: 'Código',
    value: 'location.code'
  },
  {
    label: 'Serial',
    value: 'asset.serial'
  },
  {
    label: 'Categoría',
    value: 'asset.model.category.name'
  },
  {
    label: 'Modelo',
    value: 'asset.model.name'
  },
  {
    label: 'Marca',
    value: 'asset.model.brand.name'
  },
  {
    label: 'Grupo',
    value: 'to.group.code'
  },
  {
    label: 'Lugar',
    value: 'to.code'
  },
  {
    label: 'Tipo de movimiento',
    value: 'movementType'
  },
  {
    label: 'Tipo de orden',
    value: 'orderType'
  },
  {
    label: 'Estado',
    value: 'asset.status'
  },

]

const sortType = [
  {
    label: 'Ascendente',
    value: 'ASC'
  },
  {
    label: 'Descendente',
    value: 'DESC'
  }
]

const movementsByLocations = reactive<{
  total: number, rows: LocationMovementCount[]
}>({
  total: 0,
  rows: []
});

const movements = reactive<{
  total: number, rows: Assignments[]
}>({
  total: 0,
  rows: []
});

const orders = reactive<{
  rows: Order[],
  total: number
}>({
  total: 0,
  rows: []
})



const modals = reactive({
  place: false,
  filter: false,
  order: false
})

const filters = reactive<{
  paranoid: boolean,
  all: boolean,
  current: boolean,
  location: string,
  group: string,
  serial: string,
  category: string,
  model: string,
  brand: string,
  limit: number,
  offset: number,
  sort: string,
  order: string,
  type: string,
  startDate: string,
  endDate: string,
}>({
  paranoid: false,
  all: true,
  current: true,
  location: '',
  group: '',
  serial: '',
  category: '',
  model: '',
  brand: '',
  type: '',
  limit: 10,
  offset: 1,
  startDate: '',
  endDate: '',
  sort: 'createdAt',
  order: 'DESC',
})

const orderFilters = reactive<{
  limit: number,
  offset: number,
}>({
  limit: 10,
  offset: 1
})

const setMovementsByLocation = async () => {
  try {
    if (!filters.startDate || !filters.endDate) {
      throw new Error('Debe seleccionar un rango de fechas')
    }
    loadingAssignmentsByLocation.value = true;

    const orderType = route.query.type?.toString();

    const res = await movementsServices.getMovementsByLocations({ ...filters, orderType });
    loadingAssignmentsByLocation.value = false;

    movementsByLocations.total = res?.total || 0;
    movementsByLocations.rows = res?.rows || []

  } catch (error) {
    console.log(error)
    loadingAssignments.value = false;
  }
}

const setAssignments = async () => {
  try {
    if (filters.endDate < filters.startDate) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha limite')
    }
    loadingAssignments.value = true;

    const orderType = route.query.type?.toString() || '';

    const res = await movementsServices.getMovements({ ...filters, orderType });
    loadingAssignments.value = false;

    movements.total = res?.value?.total || 0;
    movements.rows = res?.value?.rows || []
  } catch (error) {
    loadingAssignments.value = false;
    ElNotification({
      title: 'Error',
      message: error.message,
      type: 'error'
    })
  }
}

const setAssignmentsExcel = async () => {
  try {
    const queries = {
      orderType: route.query.type?.toString() || '',
      serial: filters.serial,
      category: filters.category,
      brand: filters.brand,
      model: filters.model,
      limit: movements.total,
      offset: filters.offset,
      startDate: filters.startDate,
      group: filters.group,
      endDate: filters.endDate,
      location: filters.location,
    }

    await movementsServices.getExcelAssignment(queries)

  } catch (error) {

  }
}

const setOrders = async () => {
  loadingOrders.value = true;

  const orderType = route.query.type?.toString();


  const data = await ordersServices.getOrders({
    ...orderFilters,
    type: orderType,
    startDate: filters.startDate,
    endDate: filters.endDate
  });

  orders.rows = data?.rows || [];
  orders.total = data?.total || 0;

  loadingOrders.value = false;
}

const loadData = async () => {
  if (type.value === 'assets') {
    await setAssignments()
  }
  if (type.value === 'agencia') {
    await setMovementsByLocation();
  }
  if (type.value == 'order') {
    await setOrders()
  }
}

watch(type, async () => {
  await loadData();
})

watch(filters, useDebounce(async () => {
  await loadData()
}, 500
));

watch(orderFilters, useDebounce(async () => {
  await setOrders();
}))


watch(() => route.query.type, useDebounce(async () => {
  await loadData();
}));

onMounted(async () => {
  await loadData()
})
</script>