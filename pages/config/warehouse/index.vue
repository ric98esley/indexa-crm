<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader name="Depósitos de activos" />
      <el-col class="mt-4">
        <h2 class="mb-4">Filtros</h2>
        <el-row>
          <el-form>
            <el-row>
              <el-form-item class="ml-4 w-10">
                <el-button @click="modals.filters = true" type="primary" circle class="">
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
      <el-col :span="24" :gutter="12">
        <el-table :data="warehouse.rows" stripe v-loading="loadingWarehouse">
          <el-table-column type="expand" width="50">
            <template #default="props">
              <el-row :span="24" :gutter="24">
                <el-col :span="22" :offset="2">
                  Creado por: {{ props.row.createdBy.username }}
                </el-col>
                <el-col :span="22" :offset="2">
                  Fecha de creación: {{ new Date(props.row.createdAt).toLocaleString('es-VE') }}
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" width="50" />
          <el-table-column label="Nombre" min-width="180">
            <template #header>
              <el-input v-model="filters.name" placeholder="Nombre" clearable />
            </template>
            <template #default="{ row }">
              <NuxtLink :href="`/places/${row.id}`">
                <span class="text-teal-500 underline">
                  {{ row.name }} </span>
              </NuxtLink>
            </template>
          </el-table-column>
          <el-table-column label="Código" min-width="180" prop="code">
            <template #header>
              <el-input v-model="filters.code" placeholder="Código" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Estatus" min-width="120">
            <template #header>
              <el-input v-model="filters.status" placeholder="Estatus" clearable />
            </template>
            <template #default="{ row }">
              <el-tag v-if="row.type.status === 'asignado'" type="info">Asignado</el-tag>
              <el-tag v-if="row.type.status === 'desplegable'" type="success">Disponible</el-tag>
              <el-tag v-if="row.type.status === 'pendiente'" type="warning">Pendiente</el-tag>
              <el-tag v-if="row.type.status === 'archivado'" type="danger">Archivado</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Grupo" prop="group.name" min-width="120">
            <template #header>
              <el-input v-model="filters.group" placeholder="Grupo" clearable />
            </template>
            <template #default="{ row }">
              {{ row.group.code }} - {{ row.group.name }}
            </template>
          </el-table-column>
          <el-table-column label="Acciones" width="180">
            <template #default="props">
              <el-row>
                <el-button type="info" circle @click="editDeposit(props.row)" v-can="['locations:update']">
                  <Icon name="ep:edit" />
                </el-button>
                <NuxtLink :href="`/places/${props.row.id}`">
                  <el-button type="primary" circle>
                    <Icon name="ep:view" />
                  </el-button>
                </NuxtLink>
                <el-button type="danger" circle @click="removeWarehouse(props.row.id)" v-can="['locations:delete']">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="warehouse.total" />
      </el-col>
      <el-container>
        <el-dialog v-model="modals.filters">
          <template #header>
            <h2 class="text-xl font-bold">Filtros</h2>
          </template>
          <el-form label-position="top">
            <el-row>
              <el-col :span="12">
                <el-form-item label="Zona">
                  <el-input v-model="filters.zone" placeholder="Zona" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tipo">
                  <el-input v-model="filters.type" placeholder="Tipo" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Grupo">
                  <el-input v-model="filters.group" placeholder="Código o nombre" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Fecha de inicio">
                  <el-date-picker v-model="filters.startDate" type="datetime" placeholder="Fecha de inicio"
                    format="YYYY/MM/DD" value-format="x" :shortcuts="shortcuts" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Fecha limite">
                  <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite"
                    format="YYYY/MM/DD" value-format="x" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row justify="end">
              <el-button type="primary" @click="modals.filters = false">Cerrar</el-button>
            </el-row>
          </el-form>
        </el-dialog>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear nuevo deposito</h2>
          </template>
          <template #default>
            <LocationFormSave :status="['desplegable', 'archivado', 'pendiente']" @submit="submitHandler">
            </LocationFormSave>
          </template>
        </el-dialog>
        <el-dialog v-model="modals.edit">
          <template #header>
            <h2>Editar deposito</h2>
          </template>
          <template #default>
            <LocationFormSave :status="['desplegable', 'archivado', 'pendiente']" @submit="submitHandler"
              :id="locationToEdit">
            </LocationFormSave>
          </template>
        </el-dialog>
      </el-container>
      <LeftButton v-can="['locations:create']" @click="modals.create = true">
        <Icon name="ep:plus" size="2rem" color="white" />
      </LeftButton>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations:read', 'locations:create', 'locations:update', 'locations:delete']
});

const LocationsServices = useLocation();
const locationsServices = new LocationsServices();

const locationToEdit = ref<number>(0);

const loadingWarehouse = ref(false);
const loadingGroup = ref(false);

const filters = reactive({
  limit: 10,
  offset: 1,
  code: '',
  group: '',
  name: '',
  manager: '',
  address: '',
  email: '',
  startDate: '',
  endDate: ''
});

const warehouse = reactive<{
  rows: Warehouse[],
  total: number
}>({
  rows: [],
  total: 0
})
const groups = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  edit: false,
  create: false,
  filters: false,
});

const deposit = reactive<{
  id?: number,
  name: string,
  state: string,
  groupId?: number,
}>({
  id: undefined,
  name: '',
  state: '',
  groupId: undefined,
});


const setWarehouses = async () => {
  try {
    loadingWarehouse.value = true;
    const query = {
      name: filters.name,
      code: filters.code,
      limit: filters.limit,
      offset: filters.offset,
      group: filters.group,
      status: ['desplegable', 'pendiente', 'archivado'],
      zone: filters.zone,
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate
    }
    const { data } = await locationsServices.getLocations(query);

    loadingWarehouse.value = false;
    const rta = data.value;
    warehouse.rows = rta?.rows || []
    warehouse.total = rta?.total || 0
  } catch (error) {
    loadingWarehouse.value = false;
    console.error(error);
  }
}


const editDeposit = (row: Place) => {
  if (!row) return;
  locationToEdit.value = row.id || 0;
  modals.edit = true;
}

const removeWarehouse = async (id: number) => {
  await locationsServices.removePlace(id);
  await setWarehouses();
}

const getGroups = async ({
  id,
  name,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
      {
        params: {
          ...(name != '' && !name && id && {
            id
          }),
          ...(name != '' && name && {
            name
          }),
          ...(offset && {
            offset: (offset - 1) * limit
          }),
          ...(limit && {
            limit
          })
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingGroup.value = false;
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}


const setGroup = async (query?: string) => {
  const search = {
    name: query,
    id: deposit.groupId
  }
  const rta = await getGroups(search);
  groups.rows = rta?.rows || []
  groups.total = rta?.total || 0
}

const submitHandler = async () => {
  await setWarehouses()
  locationToEdit.value = 0;
}

watch(filters, useDebounce(async () => {
  await setWarehouses()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
    await setGroup()
  } else {
    deposit.id = undefined;
    deposit.state = '';
    deposit.name = '';
    deposit.groupId = undefined;
  }
})

onMounted(async () => {
  await setWarehouses();
});
</script>