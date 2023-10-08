<template>
  <el-col class="p-2 w-full">
    <el-col>
      <el-row>
        <el-page-header @back="onBack" class="w-full flex-col">
          <template #content>
            <div class="flex items-center">
              <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                {{ reportType[`${route.query?.type}`] }}
              </span>
            </div>
          </template>
          <template #extra>
            <div class="items-center hidden md:flex">
              <el-date-picker type="daterange" class="bg-transparent" clearable v-model="dateFilter.date"
                format="YYYY/MM/DD" value-format="MM-DD-YYYY" :shortcuts="shortcuts">
              </el-date-picker>
              <el-button type="primary" class="ml-2">Exportar a excel</el-button>
            </div>
          </template>
        </el-page-header>
      </el-row>
    </el-col>
    <el-col class="sm:hidden p-4 ">
      <span>Fecha</span>
      <el-date-picker type="daterange" class="bg-transparent" size="large" clearable v-model="dateFilter.date"
        format="YYYY/MM/DD" value-format="MM-DD-YYYY" :shortcuts="shortcuts">
      </el-date-picker>
    </el-col>
    <el-col>
      <el-row>
        <el-tabs v-model="type" class="w-full" type="card">
          <el-tab-pane label="Detalles activos" name="assets">
            <el-row>
              <el-table :data="response.assignments.rows" v-loading="loadingAssignments">
                <el-table-column type="index" width="50" />
                <el-table-column type="expand" width="50">
                  <template #default="props">
                    <el-table :data="props.row.target.specifications" :border="true">
                      <el-table-column label="Campo" prop="type.name"></el-table-column>
                      <el-table-column label="Valor" prop="value"></el-table-column>
                    </el-table>
                  </template>
                </el-table-column>
                <el-table-column label="Fecha" :min-width="minWidth">
                  <template #default="{ row }">
                    {{ new Date(row.checkoutAt).toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column label="Serial" prop="target.serial" :min-width="minWidth">
                  <template #header>
                    <el-input v-model="filters.serial" placeholder="Serial" clearable />
                  </template>
                  <template #default="{ row }">
                    <Copy :text="row.target.serial" />
                  </template>
                </el-table-column>
                <el-table-column label="Categoría" prop="target.model.category.name" :min-width="minWidth">
                  <template #header>
                    <el-input v-model="filters.category" placeholder="Categoría" clearable />
                  </template>
                </el-table-column>
                <el-table-column label="Marca" prop="target.model.brand.name" :min-width="minWidth">
                  <template #header>
                    <el-input v-model="filters.brand" placeholder="Marca" clearable />
                  </template>
                </el-table-column>
                <el-table-column label="Modelo" prop="target.model.name" :min-width="minWidth">
                  <template #header>
                    <el-input v-model="filters.model" placeholder="Modelo" clearable />
                  </template>
                </el-table-column>
                <el-table-column label="Agencia" :min-width="minWidth" width="250" class="">
                  <template #header>
                    <el-input v-model="filters.location" placeholder="Agencia" clearable />
                  </template>
                  <template #default="{ row }">
                    <b>
                      {{ row.location?.code }}
                    </b>
                    -{{ row.location?.name }}

                  </template>
                </el-table-column>
                <el-table-column label="group" :min-width="minWidth">
                  <template #header>
                    <el-input v-model="filters.group" placeholder="Agencia" clearable />
                  </template>
                  <template #default="{ row }">
                    <b>
                      {{ row.location?.group.code }}
                    </b>
                    -{{ row.location?.group.name }}

                  </template>
                </el-table-column>
                <el-table-column label="Acciones" :min-width="minWidth">
                  <template #default="{ row }">
                    <el-row>
                      <el-button type="primary" circle @click="setOrder(row.order)">
                        <Icon name="ep:view" />
                      </el-button>
                      <el-button type="danger" circle @click="" v-role="['auditor', 'superuser']">
                        <Icon name="ep:delete" />
                      </el-button>
                    </el-row>
                  </template>
                </el-table-column>
              </el-table>
              <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset"
                :total="response.assignments.total" />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Detalles por agencia" name="ag">
            <el-table :data="response.count.rows">
              <el-table-column label="Código" prop="code" />
              <el-table-column label="Agencia" prop="location" />
              <el-table-column label="Grupo" prop="groupCode" />
              <el-table-column label="Código de grupo" prop="group" />
              <el-table-column label="Total" prop="count" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <el-row justify="end">
        <div
          class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
          @click="modals.filter = true">
          <Icon name="ep:filter" size="2rem" color="white" />
        </div>
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
        <el-dialog v-model="modals.order">
          <template #header>
            Order
          </template>
          <el-table :data="order.assignments" v-loading="loadingOrder">
            <el-table-column label="serial" prop="target.serial">
            </el-table-column>
          </el-table>
        </el-dialog>
      </el-container>
    </el-col>
  </el-col>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

interface Count {
  code?: string,
  location?: string,
  locationId?: string,
  group?: string,
  groupCode?: string,
  count?: number
}

const route = useRoute();
const router = useRouter();

const loadingAssignments = ref(false);
const loadingOrder = ref(false)
const minWidth = ref(100);


const endDate = new Date()
const startDate = new Date(endDate.getTime() - 3600 * 1000 * 24 * 7);

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

const reportType = {
  checkout: 'Salidas',
  checking: 'Entradas'
}

const order = reactive<Order>({
  type: '',
  assignmentType: '',
  location: undefined,
  user: undefined,
  asset: undefined,
  delivered: false,
  closed: false,
  assignments: []
})

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

const onBack = () => {
  router.back();
}

const type = ref('assets')


const modals = reactive({
  filter: false,
  order: false
})

const filters = reactive<{
  locationId?: number,
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
  checkingAtFrom: string,
  checkingAtTo: string,
  checkoutAtFrom: string,
  checkoutAtTo: string,
}>({
  serial: '',
  type: '',
  deposit: '',
  category: '',
  brand: '',
  model: '',
  limit: 10,
  offset: 1,
  checkingAtFrom: '',
  checkingAtTo: '',
  checkoutAtFrom: '',
  checkoutAtTo: '',
  location: '',
  group: ''
})

const getAssignments = async ({
  serial = '',
  deposit = '',
  location = '',
  category = '',
  brand = '',
  model = '',
  limit = 10,
  offset = 0,
  checkingAtFrom,
  checkingAtTo,
  checkoutAtFrom,
  checkoutAtTo
}: {
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  location: string,
  model: string,
  limit: number,
  offset: number,
  checkingAtFrom: string,
  checkingAtTo: string,
  checkoutAtFrom: string,
  checkoutAtTo: string
}) => {
  try {
    loadingAssignments.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Assignments[] }>(`/orders/assignments`, {
      params: {
        ...(serial != '' && serial && {
          serial
        }),
        ...(model != '' && model && {
          model
        }),
        ...(deposit != '' && deposit && {
          deposit
        }),
        ...(category != '' && category && {
          category
        }),
        ...(brand != '' && brand && {
          brand
        }),
        ...(offset && {
          offset: (offset - 1) * limit
        }),
        ...(limit && {
          limit
        }),
        ...(checkingAtFrom && checkingAtTo && {
          checkingAtFrom,
          checkingAtTo
        }),
        ...(checkoutAtFrom && checkoutAtTo && {
          checkoutAtFrom,
          checkoutAtTo
        }),
        ...(location && location !== '' && {
          location
        }),
        sort: `${route.query.type}At`,
        all: true,
        paranoid: true
      }
    });
    loadingAssignments.value = false
    return data
  } catch (error) {
    loadingAssignments.value = false
    console.log(error)
  }
}
const getCount = async ({
  serial = '',
  deposit = '',
  location = '',
  category = '',
  brand = '',
  model = '',
  limit = 10,
  offset = 0,
  checkingAtFrom,
  checkingAtTo,
  checkoutAtFrom,
  checkoutAtTo
}: {
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  location: string,
  model: string,
  limit: number,
  offset: number,
  checkingAtFrom: string,
  checkingAtTo: string,
  checkoutAtFrom: string,
  checkoutAtTo: string
}) => {
  try {
    loadingAssignments.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Count[] }>(`/orders/assignments/count`, {
      params: {
        ...(serial != '' && serial && {
          serial
        }),
        ...(model != '' && model && {
          model
        }),
        ...(deposit != '' && deposit && {
          deposit
        }),
        ...(category != '' && category && {
          category
        }),
        ...(brand != '' && brand && {
          brand
        }),
        ...(offset && {
          offset: (offset - 1) * limit
        }),
        ...(limit && {
          limit
        }),
        ...(checkingAtFrom && checkingAtTo && {
          checkingAtFrom,
          checkingAtTo
        }),
        ...(checkoutAtFrom && checkoutAtTo && {
          checkoutAtFrom,
          checkoutAtTo
        }),
        ...(location && location !== '' && {
          location
        }),
        type: route.query.type,
        sort: `${route.query.type}At`,
        all: true,
        paranoid: true
      }
    });
    loadingAssignments.value = false
    return data
  } catch (error) {
    loadingAssignments.value = false
    console.log(error)
  }
}


const getOrder = async ({ id }: { id: number }) => {
  try {
    loadingOrder.value = true;

    if (!id) {
      throw new Error('Debes cargar un id')
    }
    const { data, error } = await useFetch<Order>(`orders/${id}`);

    if (error.value) {
      throw new Error('Error al cargar la order')
    }


    return data
  } catch (error) {
    console.log(error);
    loadingOrder.value = false;
    ElNotification({
      title: 'Ha ocurrido un error.',
      message: error.message,
    })
  }


}

const setAssignments = async () => {
  const queries = {
    serial: filters.serial,
    deposit: filters.deposit,
    category: filters.category,
    brand: filters.brand,
    model: filters.model,
    limit: filters.limit,
    offset: filters.offset,
    checkingAtFrom: filters.checkingAtFrom,
    checkingAtTo: filters.checkingAtTo,
    checkoutAtFrom: filters.checkoutAtFrom,
    checkoutAtTo: filters.checkoutAtTo,
    location: filters.location
  }
  if (type.value === 'assets') {
    const res = await getAssignments(queries);
    response.assignments.total = res?.value?.total || 0;
    response.assignments.rows = res?.value?.rows || []
  }
  if (type.value === 'ag') {
    const res = await getCount(queries);
    response.count.total = res?.value?.total || 0;
    response.count.rows = res?.value?.rows || []
  }
}

const setOrder = async (id: number) => {
  modals.order = true;
  const res = await getOrder({ id });
  Object.assign(order, res);
}

const print = () => {
  return navigateTo(
    {
      path: `/assignments/${route.params.id}/print`,
      query: {
        total: response.assignments.total,
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

const setDate = () => {
  if (
    dateFilter.date === null ||
    dateFilter.date === undefined ||
    dateFilter.date.length == 0
  ) {
    filters.checkingAtFrom = '';
    filters.checkingAtTo = '';
    filters.checkoutAtFrom = '';
    filters.checkoutAtTo = '';
    return;
  }
  if (route.query.type == "checking") {
    console.log("checking");
    filters.checkingAtFrom = dateFilter.date[0];
    filters.checkingAtTo = dateFilter.date[1];
    filters.checkoutAtFrom = '';
    filters.checkoutAtTo = '';
  }

  if (route.query.type == "checkout") {
    console.log("checkout");
    filters.checkoutAtFrom = dateFilter.date[0];
    filters.checkoutAtTo = dateFilter.date[1];
    filters.checkingAtFrom = '';
    filters.checkingAtTo = '';
  }

  console.log(dateFilter.date)
}

watch(dateFilter, useDebounce(() => {
  setDate()
}))

watch(filters, useDebounce(async () => {
  await setAssignments()
}, 500
));

watch(type, useDebounce(async () => {
  await setAssignments()
}, 500
))

watch(() => route.query.type, useDebounce(async () => {
  await setAssignments()
}));

onMounted(async () => {
  setDate();
  await setAssignments();
  console.log(dateFilter.date)
})
</script>