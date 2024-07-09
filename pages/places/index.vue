<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <PageHeader name="Agencias" />
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
      <el-col>
        <LocationTableView :filters="filters" :loading="loadingPlace" :total="places.total" @refresh="setPlaces"
          :locations="places.rows" />
      </el-col>
      <el-container>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear agencia</h2>
          </template>
          <template #default>
            <LocationFormSave @submit="setPlaces" :id="placeToEdit" />
          </template>
        </el-dialog>
      </el-container>
      <LeftButton @click="modals.create = true" />
    </el-row>
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
                <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite" format="YYYY/MM/DD"
                  value-format="x" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row justify="end">
            <el-button type="primary" @click="modals.filters = false">Cerrar</el-button>
          </el-row>
        </el-form>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations:read', 'locations:update', 'locations:delete', 'locations:create']
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
  manager: '',
  address: '',
  email: '',
  startDate: '',
  endDate: ''
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
  filters: false
});

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
      manager: filters.manager,
      status: ['asignado'],
      zone: filters.zone,
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate
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