<template>
  <el-container direction="vertical" class="p-3">
    <el-row class="p-2 w-full">
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
              <el-alert title="Debes ingresar un rango de fechas para obtener un resultado en la búsqueda" type="warning" />
              <el-table :data="movementsByLocations.rows" v-loading="loadingAssignmentsByLocation">
                <el-table-column label="Código" prop="code" />
                <el-table-column label="Agencia" prop="name" />
                <el-table-column label="Grupo" prop="group.name" />
                <el-table-column label="Código de grupo" prop="group.code" />
                <el-table-column label="Total" prop="total" />
                <el-table-column label="Acciones" width="120">
                  <template #default="{ row }">
                    <el-row>
                      <el-button type="primary" circle @click="setPlace(row)">
                        <Icon name="ep:view" />
                      </el-button>
                    </el-row>
                  </template>
                </el-table-column>
              </el-table>
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
                  <el-switch v-model="filters.paranoid" active-color="#13ce66" inactive-color="#ff4949" />
                </el-form-item>
                <el-form-item label="Mostrar actualmente asignado">
                  <el-switch v-model="filters.all" active-color="#13ce66" inactive-color="#ff4949" />
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
                <el-form-item label="Ordenar por">
                  <el-select v-model="filters.sort" placeholder="Ordenar por">
                    <el-option v-for="option in sortBy" :key="option.value" :value="option.value" :label="option.label">
                    </el-option>
                  </el-select>
                </el-form-item>
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
          <el-dialog v-model="modals.place">
            <template #header>
              <el-row justify="space-between">
                Agencia
                <el-button @click="print()"
                  type="primary">Imprimir</el-button>
              </el-row>
            </template>
            <AssignmentsTableView :assignments="movements.rows" v-model:limit="filters.limit" v-model:filters="filters"
              :total="movements.total" :loading="loadingAssignments" />
          </el-dialog>
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
const movementsServices = new MovementServices();

const route = useRoute();

const loadingAssignments = ref(false);
const loadingAssignmentsByLocation = ref(false);
const orderId = ref(0);

const placeId = ref(0);

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
    value: 'code'
  },
  {
    label: 'Serial',
    value: 'serial'
  },
  {
    label: 'Categoría',
    value: 'category'
  },
  {
    label: 'Modelo',
    value: 'model'
  },
  {
    label: 'Marca',
    value: 'brand'
  },
  {
    label: 'Grupo',
    value: 'group'
  },
  {
    label: 'Lugar',
    value: 'location'
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
    value: 'status'
  },
  {
    label: 'Usuario',
    value: 'user'
  },
  {
    label: 'Acciones',
    value: 'actions'
  }
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


const type = ref('assets')

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
  all: false,
  current: false,
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

const setMovementsByLocation = async () => {
  try {
    if(!filters.startDate || !filters.endDate) {
      throw new Error('Debe seleccionar un rango de fechas')
    }
    loadingAssignmentsByLocation.value = true;
    const query = {
      limit: filters.limit,
      offset: filters.offset,
      orderType: route.query.type?.toString() || '',
      startDate: filters.startDate,
      endDate: filters.endDate
    }
    const res = await movementsServices.getMovementsByLocations(query);
    loadingAssignmentsByLocation.value = false;

    movementsByLocations.total = res?.total || 0;
    movementsByLocations.rows = res?.rows || []

  } catch (error) {
    loadingAssignments.value = false;
    ElNotification({
      title: 'Error',
      message: error.message,
      type: 'error'
    })
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

const setPlace = (row: LocationMovementCount) => {
  placeId.value = row.id;
  filters.location = row.code;
  modals.place = true;
}

const print = () => {
  return navigateTo(
    {
      path: `/places/${placeId.value}/print`,
      query: {
        total: movements.total,
        all: 'true',
        startDate: filters.startDate,
        endDate: filters.endDate,
        orderType: route.query.type?.toString() || '',
      }
    },
    {
      open: {
        target: '_blank',
        windowFeatures: {
          popup: true,
          noopener: true,
          noreferrer: true,
        }
      }
    })
}

watch(type, async () => {
  if (type.value === 'agencia') {
    await setMovementsByLocation()
  }
})

watch(filters, useDebounce(async () => {
  if (type.value === 'agencia') {
    await setMovementsByLocation();
  }
  await setAssignments();
}, 500
));

watch(() => route.query.type, useDebounce(async () => {
  if (type.value === 'assets') {
    await setAssignments()
  }
  if (type.value === 'agencia') {
    await setMovementsByLocation();
  }
}));

onMounted(async () => {
  await setAssignments();
})
</script>