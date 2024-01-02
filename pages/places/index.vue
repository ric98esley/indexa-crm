<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <PageHeader name="Agencias" />
      <el-col>
        <el-table :data="places.rows" stripe v-loading="loadingPlace">
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
          <el-table-column prop="name" label="Nombre" min-width="120">
            <template #header>
              <el-input v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Código" prop="code" min-width="120">
            <template #header>
              <el-input v-model="filters.code" placeholder="Código" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Grupo" prop="group.name" min-width="120">
            <template #header>
              <el-input v-model="filters.group" placeholder="Grupo" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Activar" min-width="80">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" class="ml-2"
                @change="(val) => (updatePlaceStatus({ active: val || false, placeId: row.id }))" />
            </template>
          </el-table-column>
          <el-table-column label="Acciones" width="150">
            <template #default="{ row }">
              <el-row justify="space-around">
                <el-button type="info" circle @click="editPlace(row)">
                  <Icon name="ep:edit" />
                </el-button>
                <NuxtLink :href="`/places/${row.id}`">
                  <el-button type="primary" circle>
                    <Icon name="ep:view" />
                  </el-button>
                </NuxtLink>
                <el-button type="danger" circle @click="removePlace(row.id)" v-role="['superuser', 'auditor']">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="places.total" />
      </el-col>
      <el-container>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear o editar agencia</h2>
          </template>
          <template #default>
            <LocationFormSave @submit="setPlaces" :id="placeToEdit"/>
          </template>
        </el-dialog>
      </el-container>
      <LeftButton @click="modals.create = true" />
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const LocationsServices = useLocation();
const locationsServices = new LocationsServices();

const placeToEdit = ref<number | undefined>(undefined);

const loadingPlace = ref(false);

const filters = reactive({
  limit: 10,
  offset: 1,
  code: '',
  group: '',
  name: '',
  address: '',
  email: '',
});

const places = reactive<{
  rows: Place[],
  total: number
}>({
  rows: [],
  total: 0
});

const modals = reactive({
  create: false,
});

const updatePlaceStatus = async ({ active, placeId }: { active: string | number | boolean, placeId: number }) => {

  await locationsServices.patchPlace({
    id: placeId,
    isActive: active
  })
  await setPlaces()
}

const editPlace = (row: Place) => {
  modals.create = true;
  placeToEdit.value = row.id;
};

const removePlace = async (id: number) => {
  try {
    await locationsServices.removePlace(id)
    await setPlaces()
  } catch (error) {
    loadingPlace.value = false;
  }
}

const setPlaces = async () => {
  try {
    loadingPlace.value = true;

    const query = {
      name: filters.name,
      code: filters.code,
      group: filters.group,
      limit: filters.limit,
      offset: filters.offset,
      parent: filters.name,
      status: ['asignado']
    }
    const { data } = await locationsServices.getLocations(query);

    loadingPlace.value = false;
    const rta = data.value;
    places.rows = rta?.rows || []
    places.total = rta?.total || 0
  } catch (error) {
    loadingPlace.value = false;
    console.error(error);
  }
}

watch(() => modals.create, (value) => {
  if (!value) {
    placeToEdit.value = undefined;
  }
})

watch(filters, useDebounce(async () => {
  await setPlaces()
}, 500)
)

onMounted(async () => {
  await setPlaces();
});
</script>