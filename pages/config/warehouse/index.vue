<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader name="Depósitos de activos" />
      <el-col :span="24" :gutter="12">
        <el-table :data="warehouse.rows" stripe v-loading="loadingWarehouse">
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
          <el-table-column prop="name" label="Nombre" min-width="180">
            <template #header>
              <el-input v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Estatus" prop="type.status" min-width="120">
            <template #header>
              <el-input v-model="filters.status" placeholder="Estatus" clearable />
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
                <el-button type="info" circle @click="editDeposit(props.row)">
                  <Icon name="ep:edit" />
                </el-button>
                <el-button type="primary" circle>
                  <Icon name="ep:view" />
                </el-button>
                <el-button type="danger" circle @click="removeDeposit(props.row.id)">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="warehouse.total" />
      </el-col>
      <el-container>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear nuevo deposito</h2>
          </template>
          <template #default>
            <LocationFormSave :status="['desplegable', 'archivado', 'pendiente']" @submit="setWarehouses"></LocationFormSave>
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
  roles: ['superuser', 'admin', 'auditor'],
});

const LocationsServices = useLocation();
const locationsServices = new LocationsServices();


const loadingWarehouse = ref(false);
const loadingGroup = ref(false);
const loadingUser = ref(false);

const filters = reactive({
  limit: 10,
  offset: 1,
  name: '',
  code: '',
  status: '',
  group: ''
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
  details: false,
  edit: false,
  create: false,
  menu: false
});


const place = reactive<Place>({
  id: undefined,
  name: '',
  code: '',
  isActive: true,
  zoneId: undefined,
  typeId: undefined,
  managerId: undefined,
  groupId: undefined,
  rif: '',
  phone: '',
  address: '',
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

const status = [
  { label: "Desplegable", value: "desplegable" },
  { label: "Archivado", value: "archivado" },
  { label: "Pendiente", value: "pendiente" },
];


const setWarehouses = async () => {
  try {
    loadingWarehouse.value = true;
    const query = {
      name: filters.name,
      code: filters.code,
      limit: filters.limit,
      offset: filters.offset,
      group: filters.group,
      status: ['desplegable', 'pendiente', 'archivado']
    }
    const { data, error } = await locationsServices.getLocations(query);

    if (error.value) {
      throw new Error('Error al cargar los agencias')
    }

    loadingWarehouse.value = false;
    const rta = data.value;
    warehouse.rows = rta?.rows || []
    warehouse.total = rta?.total || 0
  } catch (error) {
    loadingWarehouse.value = false;
    console.error(error);
  }
}
const getUser = async ({
  id,
  name,
  code,
  parent,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  code?: string,
  parent?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingWarehouse.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Warehouse[] }>('/warehouse',
      {
        params: {
          ...(name != '' && !name && id && {
            id
          }),
          ...(name != '' && name && {
            name
          }),
          ...(code != '' && code && {
            code
          }),
          ...(parent != '' && parent && {
            parent
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

    loadingWarehouse.value = false;
    return data.value
  } catch (error) {
    loadingWarehouse.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const createWarehouse = async () => {
  try {
    loadingWarehouse.value = true;

    const { data, error } = locationsServices.createLocation(place);
    loadingWarehouse.value = false;

    await setPlaces()

    place.id = undefined;
    place.name = '';
    place.phone = '';
    place.isActive = false
    return data.value
  } catch (error) {
    loadingWarehouse.value = false;
    ElNotification({
      title: 'Error al crear agencia intente de nuevo mas tarde',
    })
  }
}

const patchDeposit = async () => {
  try {
    loadingWarehouse.value = true;

    const body = {
      name: deposit.name,
      state: deposit.state,
      groupId: deposit.groupId
    }

    const { data, error } = await useFetch<Warehouse>(`/assets/warehouse/${deposit.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingWarehouse.value = false;


    if (error.value) {
      throw error
    }
    await setWarehouses()
    ElNotification({
      title: 'Categoria modificada correctamente',
      message: `${data.value?.name}`
    })

    deposit.id = undefined;
    deposit.name = '';
    deposit.groupId = undefined;

    return data.value
  } catch (error) {
    loadingWarehouse.value = false;
    ElNotification({
      title: 'Error al modificar la deposito intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editDeposit = (row: Warehouse) => {
  modals.edit = true;
  deposit.id = row.id;
  deposit.name = row.name || '';
  deposit.state = row.state || '';
  deposit.groupId = row.group?.id;
}

const removeDeposit = async (id: number) => {
  try {
    const { data, error } = await useFetch<Warehouse>(`/assets/warehouse/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingWarehouse.value = false;
      ElNotification({
        message: 'Error al borrar la deposito intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La deposito ha sido borrada.'
    })
    await setWarehouses()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la deposito intente de nuevo mas tarde.'
    })
  }
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