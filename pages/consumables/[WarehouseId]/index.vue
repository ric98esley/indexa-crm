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
          </el-page-header>
        </el-row>
      </el-col>
      <el-col>
        <h2 class="m-4">Inventario de consumibles</h2>
        <ConsumableTableView :data="inventory.rows"></ConsumableTableView>
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

const loadingInventory = ref(false);

const inventory = reactive<{
  rows: Consumable[],
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
    name: ''
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
    const data = await consumableService.findOneInventory({
      id: route.params.WarehouseId.toString(),
    })

    inventory.rows = data?.rows || [];
    inventory.total = data?.total || 0;
  } catch (error) {

  }
}

onMounted(() => {
  setPlace(Number(route.params.WarehouseId));
  setInventory()
})
</script>