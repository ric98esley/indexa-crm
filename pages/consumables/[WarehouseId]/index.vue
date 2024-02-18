<template>
  <el-container class="p-4">
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
            <LocationDescription :place="place" />
            <template #extra>
              <el-row>
                <NuxtLink type="button" :href="`/consumables/${route.params.WarehouseId}/checking`">
                  <el-button type="primary" class="ml-4">
                    Entrada
                  </el-button>
                </NuxtLink>
                <NuxtLink type="button" :href="`/consumables/${route.params.WarehouseId}/checkout`">
                  <el-button type="warning" class="ml-4">
                    Salida
                  </el-button>
                </NuxtLink>
              </el-row>
            </template>
          </el-page-header>
        </el-row>
      </el-col>
      <el-col>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="Inventario" name="inventory">
            <h2 class="m-4">Inventario de consumibles</h2>
            <ConsumableTableView :data="inventory.rows" :loading="loadingInventory" :total="inventory.total"
              :filters="inventoryFilter" @refresh="setInventory"></ConsumableTableView>
          </el-tab-pane>
          <el-tab-pane label="Lotes" name="lots">
            <h2 class="m-4">Historial de lotes de asignación o recepción</h2>
            <ConsumableTableLot :data="lot.rows" :total="lot.total" v-model:filters="lotFilters" />
          </el-tab-pane>
          <el-tab-pane label="Historial" name="history">
            <h2 class="m-4">Historial de movimientos de productos</h2>
            <ConsumableTableHistory :data="history.rows" v-model:filters="historyFilter" :total="history.total" />
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
  permissions: ['consumables:read']
});

const route = useRoute();
const router = useRouter();
const LocationService = useLocation();
const ConsumableService = useConsumable();
const locationService = new LocationService();
const consumableService = new ConsumableService();

const activeTab = ref('inventory');

const loadingInventory = ref(false);

const inventoryFilter = reactive({
  offset: 1,
  limit: 10,
  code: '',
  name: '',
  search: ''
});
const historyFilter = reactive({
  offset: 1,
  limit: 10,
  code: '',
  name: '',
  search: ''
});
const lotFilters = reactive({
  limit: 10,
  offset: 1,
  warehouseId: Number(route.params.WarehouseId),
  customer: '',
  description: '',
});

const inventory = reactive<{
  rows: Consumable[],
  total: number
}>({
  rows: [],
  total: 0
});
const history = reactive<{
  rows: Consumable[],
  total: number
}>({
  rows: [],
  total: 0
});

const lot = reactive<{
  rows: Lot[],
  total: number
}>({
  rows: [],
  total: 0
})

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

const onBack = () => {
  router.back();
}

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

const setInventory = async () => {
  try {
    loadingInventory.value = true;
    const data = await consumableService.findOneInventory({
      id: route.params.WarehouseId.toString(),
      ...inventoryFilter
    })

    inventory.rows = data?.rows || [];
    inventory.total = data?.total || 0;
  } catch (error) {
    console.log(error)
  } finally {
    loadingInventory.value = false;
  }
}

const setLots = async () => {
  const rta = await consumableService.getLots(
    lotFilters
  );
  lot.rows = rta?.rows || []
  lot.total = rta?.total || 0
}

const setHistory = async () => {
  const rta = await consumableService.findOneHistory({
    id: route.params.WarehouseId.toString(),
    ...historyFilter
  });

  history.rows = rta?.rows || [];
  history.total = rta?.total || 0;
}

const setData = () => {
  if (activeTab.value == 'inventory') {
    setInventory();
  }
  if (activeTab.value == 'lots') {
    setLots();
  }
  if (activeTab.value == 'history') {
    setHistory();
  }
}

watch(activeTab, () => {
  setData()
})

watch(historyFilter, () => {
  setData();
})
watch(inventoryFilter, () => {
  setData();
})
watch(lotFilters, () => {
  setLots();
})

onMounted(() => {
  setPlace(Number(route.params.WarehouseId));
  setData()
})
</script>