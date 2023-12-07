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
        <el-row justify="end">
          <el-date-picker type="daterange" class="bg-transparent" clearable v-model="dateFilter.date" format="YYYY/MM/DD"
            value-format="MM-DD-YYYY" :shortcuts="shortcuts">
          </el-date-picker>
        </el-row>
      </el-col>
      <el-col>
        <el-row>
          <el-tabs v-model="type" class="w-full" type="card">
            <el-tab-pane label="Detalles activos" name="assets">
              <AssignmentsTableView :assignments="response.assignments.rows" v-model:limit="filters.limit"
                v-model:filters="filters" :total="response.assignments.total" :loadingAssignments="loadingAssignments" />
            </el-tab-pane>
            <el-tab-pane label="Detalles por agencia" name="ag">
              <el-table :data="response.count.rows">
                <el-table-column label="Código" prop="code" />
                <el-table-column label="Agencia" prop="location" />
                <el-table-column label="Grupo" prop="groupCode" />
                <el-table-column label="Código de grupo" prop="group" />
                <el-table-column label="Total" prop="count" />
                <el-table-column label="Acciones" :min-width="minWidth">
                  <template #default="{ row }">
                    <el-row>
                      <el-button type="primary" circle @click="setPlace(row.locationId, row)">
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
              <el-form-item label="Fecha">
                <el-date-picker type="daterange" class="bg-transparent" size="large" clearable v-model="dateFilter.date"
                  format="YYYY/MM/DD" value-format="MM-DD-YYYY" :shortcuts="shortcuts">
                </el-date-picker>
              </el-form-item>
            </el-form>
          </el-dialog>
          <OrderTableView v-model:open="modals.order" :id="orderId" />
          <el-dialog v-model="modals.place">
            <template #header>
              <el-row justify="space-between">
                Agencia
                <!-- <el-button @click="print(response.assignments.total, response.place.id, 'place')"
                  type="primary">Imprimir</el-button> -->
              </el-row>
            </template>
            <el-table :data="response.assignments.rows" v-loading="loadingAssignments">
              <el-table-column label="serial" prop="target.serial">
              </el-table-column>
              <el-table-column label="Descripción">
                <template #default="{ row }">
                  {{ row.target?.model.category.name }} - {{ row.target.model.name }} - {{ row.target.model.brand.name }}
                </template>
              </el-table-column>
            </el-table>
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
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const MovementServices = useMovements();
const movementsServices = new MovementServices();

const route = useRoute();

const loadingAssignments = ref(false);
const minWidth = ref(150);
const orderId = ref(0);

const endDate = new Date()
const startDate = new Date(new Date().getTime() - 3600 * 1000 * 24 * 7);

const defaultDate = [`${startDate.getMonth().toString().padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}-${startDate.getFullYear()}`,
`${endDate.getMonth().toString().padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}-${endDate.getFullYear()}`]

const dateFilter = reactive<{ date: string[] }>({
  date: [...defaultDate]
});

const shortcuts = [
  {
    text: "Semana pasada",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "Mes Pasado",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "Últimos 3 meses",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

const response = reactive<{
  place: Place, assignments: { total: number, rows: Assignments[] }, count: {
    total: number, rows: Count[]
  }
}>({
  place: {
    isActive: false,
    code: '',
    phone: '',
    rif: '',
    address: ''
  },
  count: {
    total: 0,
    rows: [],
  },
  assignments: {
    total: 0,
    rows: []
  }
})

const type = ref('assets')

const modals = reactive({
  place: false,
  filter: false,
  order: false
})

const filters = reactive<{
  location: string,
  group: string,
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  model: string,
  type: string,
  limit: number,
  offset: number,
  startDate: string,
  endDate: string,
}>({
  serial: '',
  type: '',
  deposit: '',
  category: '',
  brand: '',
  model: '',
  limit: 10,
  offset: 1,
  startDate: '',
  endDate: '',
  location: '',
  group: ''
})

const getPlace = async ({
  locationId
}: {
  locationId?: number
}) => {
  const { data, error } = await useFetch<Place>(`/locations/${locationId}`)
  return data
}

const setLocation = async (placeId: number) => {
  response.place = await getPlace({ locationId: placeId })
}

const setAssignments = async () => {
  try {
    loadingAssignments.value = true;
    const queries = {
      orderType: route.query.type?.toString() || '',
      serial: filters.serial,
      deposit: filters.deposit,
      category: filters.category,
      brand: filters.brand,
      model: filters.model,
      limit: filters.limit,
      offset: filters.offset,
      startDate: filters.startDate,
      group: filters.group,
      endDate: filters.endDate,
      location: filters.location,
      all: true,
      paranoid: false
    }
    const res = await movementsServices.getMovements(queries);
    loadingAssignments.value = false;

    response.assignments.total = res?.value?.total || 0;
    response.assignments.rows = res?.value?.rows || []
  } catch (error) {
    loadingAssignments.value = false;

  }
}

const setAssignmentsExcel = async () => {
  try {
    const queries = {
      orderType: route.query.type?.toString() || '',
      serial: filters.serial,
      deposit: filters.deposit,
      category: filters.category,
      brand: filters.brand,
      model: filters.model,
      limit: response.assignments.total,
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

const setPlace = async (id: number, row: Count) => {
  try {
    await setLocation(id)
    modals.place = true;
    filters.location = row.code || '';
    filters.limit = row.count || 0;
    filters.offset = 0
  } catch (error) {
    console.log(error)
  }
}

const setDate = () => {
  if (
    dateFilter.date === null ||
    dateFilter.date === undefined ||
    dateFilter.date.length == 0
  ) {
    filters.startDate = '';
    filters.endDate = '';
    return;
  }
  if (route.query.type == "checking") {
    filters.startDate = dateFilter.date[0];
    filters.endDate = dateFilter.date[1];
  }

  if (route.query.type == "checkout") {
    filters.startDate = '';
    filters.endDate = '';
  }
}

watch(dateFilter, useDebounce(() => {
  setDate()
}))

watch(filters, useDebounce(async () => {
  await setAssignments()
}, 500
));

watch(() => route.query.type, useDebounce(async () => {
  await setAssignments()
}));

onMounted(async () => {
  setDate();
  await setAssignments();
})
</script>