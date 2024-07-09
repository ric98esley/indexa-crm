<template>
  <el-container direction="vertical" class="p-4">
    <el-row :gutter="10">
      <el-col :span="24">
        <el-row>
          <el-page-header @back="onBack" class="w-full">
            <template #content>
              <div class="flex items-center">
                <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                  {{ place.code }} - {{ place.name }}
                </span>
                <el-tag>{{ place.type?.name }}</el-tag>
              </div>
            </template>
            <template #extra>
              <div class="flex items-center">
                <el-button @click="print()" :disabled="currentAssignments.total == 0">Imprimir inventario</el-button>
              </div>
            </template>
            <LocationDescription :place="place" />
          </el-page-header>
        </el-row>
      </el-col>
      <el-col>
        <el-tabs v-model="activeName" class="w-full">
          <el-tab-pane label="Inventario" name="current">
            <h2 class="m-4">Activos en préstamo</h2>
            <AssignmentsTableView :assignments="currentAssignments.rows" :loading="loadingAssignments"
              v-model:filters="filters" :total="currentAssignments.total" />
          </el-tab-pane>
          <el-tab-pane label="Historial" name="lasted">
            <h2 class="m-4">Préstamos anteriores</h2>
            <AssignmentsTableView :assignments="lastAssignments.rows" :loading="loadingAssignmentsLast"
              v-model:filters="filters2" :total="lastAssignments.total" />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations:read']
});

const route = useRoute();
const router = useRouter();
const LocationService = useLocation();
const locationService = new LocationService();

const activeName = ref('current');

const loadingAssignments = ref(false);
const loadingAssignmentsLast = ref(false);

const place = reactive<Place>({
  isActive: false,
  code: '',
  phone: '',
  rif: '',
  address: '',
  group: {
    code: '',
    name: ''
  },
  zone: {
    name: ''
  },
  type: {
    name: '',
    status: ''
  },
  manager: {
    name: ''
  }
})

const currentAssignments = reactive<{ total: number, rows: Assignments[] }>({
  total: 0,
  rows: []
})

const lastAssignments = reactive<{ total: number, rows: Assignments[] }>({
  total: 0,
  rows: []
})

const onBack = () => {
  router.back();
}


const filters = reactive<{
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  model: string,
  limit: number,
  offset: number
}>({
  serial: '',
  deposit: '',
  category: '',
  brand: '',
  model: '',
  limit: 10,
  offset: 1
})

const filters2 = reactive<{
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  model: string,
  limit: number,
  offset: number
}>({
  serial: '',
  deposit: '',
  category: '',
  brand: '',
  model: '',
  limit: 10,
  offset: 1
})


const setPlace = async (placeId: number) => {
  const data = await locationService.getLocation({ id: placeId });
  if (data) {
    place.isActive = data.isActive;
    place.code = data.code;
    place.phone = data.phone;
    place.rif = data.rif;
    place.address = data.address;
    place.manager = data.manager;
    place.name = data.name;
    place.group = data.group;
    place.zone = data.zone;
    place.type = data.type;
  }
}
const setPlaceAssignments = async (placeId: number) => {
  loadingAssignments.value = true;

  const queries = {
    id: placeId,
    serial: filters.serial,
    deposit: filters.deposit,
    category: filters.category,
    current: true,
    paranoid: true,
    brand: filters.brand,
    model: filters.model,
    limit: filters.limit,
    offset: filters.offset
  }
  const res = await locationService.getLocationAssets(queries);

  currentAssignments.total = res?.total || 0;
  currentAssignments.rows = res?.rows || []
  loadingAssignments.value = false;
}
const setPlaceAssignmentsLast = async (placeId: number) => {
  loadingAssignmentsLast.value = true;

  const queries = {
    id: placeId,
    serial: filters2.serial,
    deposit: filters2.deposit,
    category: filters2.category,
    brand: filters2.brand,
    model: filters2.model,
    type: 'checking',
    all: true,
    limit: filters2.limit,
    offset: filters2.offset
  }
  const res = await locationService.getLocationAssets(queries);

  lastAssignments.total = res?.total || 0;
  lastAssignments.rows = res?.rows || []

  loadingAssignmentsLast.value = false;
}

const print = () => {
  return navigateTo(
    {
      path: `/places/${route.params.id}/print`,
      query: {
        total: currentAssignments.total,
        all: 'false',
        paranoid: 'true',
        current: 'true',
        ...filters
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

watch(filters, useDebounce(async () => {
  await setPlaceAssignments(Number(route.params.id))
}, 500
))
watch(filters2, useDebounce(async () => {
  loadingAssignmentsLast.value = true;

  await setPlaceAssignmentsLast(Number(route.params.id))
  loadingAssignmentsLast.value = false;
}, 500
))

watch(activeName, () => {
  if (activeName.value == 'current') setPlaceAssignments(Number(route.params.id));
  if (activeName.value == 'lasted') setPlaceAssignmentsLast(Number(route.params.id));
})

onMounted(() => {
  setPlace(Number(route.params.id));

  if (activeName.value == 'current') setPlaceAssignments(Number(route.params.id));
  if (activeName.value == 'lasted') setPlaceAssignmentsLast(Number(route.params.id));
})
</script>