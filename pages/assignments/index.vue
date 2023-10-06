<template>
  <el-col class="p-2 w-full">
    <el-col>
      <el-row>
        <el-page-header @back="onBack" class="w-full">
          <template #content>
            <div class="flex items-center">
              <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                {{ reportType[`${route.query?.type}`] }}
              </span>
            </div>
          </template>
          <template #extra>
            <div class="flex items-center">
              <el-date-picker type="daterange" class="bg-transparent" clearable v-model="dateFilter.date"
                format="YYYY/MM/DD" value-format="MM-DD-YYYY">
              </el-date-picker>
              <el-button type="primary" class="ml-2">Exportar a excel</el-button>
            </div>
          </template>
        </el-page-header>
      </el-row>
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
                <el-table-column label="Estado" prop="target.deposit.name" :min-width="minWidth">
                  <template #header>
                    <el-input v-model="filters.deposit" placeholder="Estado" clearable />
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
                <el-table-column label="Acciones" :min-width="minWidth">
                  <template #default="{ row }">
                    <el-row>
                      <el-button type="primary" circle>
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
          <el-tab-pane label="Detalles por agencia" name="ag">Detalles por agencia</el-tab-pane>
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
                format="YYYY/MM/DD" value-format="MM-DD-YYYY">
              </el-date-picker>
            </el-form-item>
          </el-form>
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

const route = useRoute();
const router = useRouter();

const loadingAssignments = ref(false)
const minWidth = ref(120);

const dateFilter = reactive<{ date: string[] }>({
  date: []
});


const reportType = {
  checkout: 'Salidas',
  checking: 'Entradas'
}

const response = reactive<{ place: Place, assignments: { total: number, rows: Assignments[] } }>({
  place: {
    isActive: false,
    code: '',
    phone: '',
    rif: '',
    address: ''
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
  filter: false
})

const filters = reactive<{
  locationId?: number
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
  checkoutAtTo: ''
})

const getAssignments = async ({
  serial = '',
  deposit = '',
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
    const { data, error } = await useFetch<{ total: number, rows: Assignments }>(`/orders/assignments`, {
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
    checkoutAtTo: filters.checkoutAtTo
  }
  const res = await getAssignments(queries);
  response.assignments.total = res?.value?.total || 0;
  response.assignments.rows = res?.value?.rows || []
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

watch(dateFilter, useDebounce(() => {
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
  console.log(filters)
}))

watch(filters, useDebounce(async () => {
  await setAssignments()
}, 500
));

watch(() => route.query.type, useDebounce(async () => {
  await setAssignments()
}));

onMounted(() => {
  setAssignments();
})
</script>