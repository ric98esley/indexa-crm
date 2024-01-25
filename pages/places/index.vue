<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <PageHeader name="Agencias" />
      <el-col>
        <LocationTableView :filters="filters" :loading="loadingPlace" :total="places.total" @refresh="setPlaces" :locations="places.rows" />
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