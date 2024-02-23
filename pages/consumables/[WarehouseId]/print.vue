<template>
  <el-container>
    <div id="print" class="print text-xs w-full">
      <el-col>
        <PrintHeader />
        <br />
        <el-row class="text-xs" justify="space-between">
          <el-col :span="24">
            <strong> Reporte de inventario</strong>
            <br />
            Fecha de reporte: {{ new Date().toLocaleString() }} <br />
            Impreso por <b>{{ user?.username }}</b> <br />
            Lugar: {{ place.code }} - {{ place.name }}
          </el-col>
        </el-row>
        <br /><br />
        <table class="w-full table-print">
          <tr>
            <th></th>
            <th>Fecha</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Cantidad</th>
          </tr>
          <tr v-for="(movement, index) in inventory.rows" v-bind:key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ new Date(movement.createdAt!).toLocaleString() }}</td>
            <td>{{ movement.product.code }}</td>
            <td>
              {{ movement.product.name || '' }} -
              {{ movement.product.category?.name || '' }}
            </td>
            <td>
              {{ movement.quantity || '' }} - {{ movement.product.unit }}
            </td>
          </tr>
          <tr>
            <th colspan="4">
              <b>
                Cantidad de insumos: {{ inventory.total }}
              </b>
            </th>
          </tr>
        </table>

        <table class="w-full table-print mt-10">
          <tr class="mt-5">
            <th><b>Nota:</b></th>
          </tr>
          <tr>
            <th>Este reporte declara la cantidad de insumos en el sistema. Los cuales deben ser verificados por el responsable del lugar</th>
          </tr>
        </table>
        <table class="w-full signs mt-10">

          <tr class="mt-5">
            <th>Firma del responsable: {{ user?.username }}</th>
          </tr>
        </table>
      </el-col>
    </div>
  </el-container>
</template>

<script lang="ts" setup>
const route = useRoute();
import { useAuthStore } from '@/stores/authStore';

definePageMeta({
  layout: 'print',
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['consumables:read']
});

const auth = useAuthStore();

const user = auth.getUser;

const LocationService = useLocation();
const ConsumableService = useConsumable();
const locationService = new LocationService();
const consumableService = new ConsumableService();

const loadingInventory = ref(false);

const inventoryFilter = reactive({
  offset: 1,
  limit: Number(route.query.total) ?? 10,
  code: '',
  name: '',
  search: ''
});
const inventory = reactive<{
  rows: Consumable[],
  total: number
}>({
  rows: [],
  total: 0
});

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

const setData = async  () => {
  await setPlace(Number(route.params.WarehouseId));
  await setInventory();
}

watch(inventoryFilter, () => {
  setData();
})

onMounted(async () => {
  await setData().then(() => {
    window.print();
    setTimeout(window.close, 500);
  });
})
</script>

<style>
.print {
  color: black;
}

.print h1 {
  color: black;
}

.print h4 {
  line-height: 22px;
  font-weight: bold;
  color: black;
  font-size: 12px;
}

.table-print {
  text-align: left;
  padding: 3px 2px;
}

.table-print tr th {
  font-weight: normal;
}

.table-print tr td {
  font-weight: normal;
}

.table-print__header tr td {
  font-weight: normal;
  vertical-align: top;
}

.table-print tr:first-child th {
  font-weight: bold;
}

.disclaimer {
  text-align: center;
}

.disclaimer tr th {
  font-weight: normal;
}

.signs {
  text-align: center;
}

.logo-print {
  width: 150px;
}
</style>