<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <PageHeader class="mb-4">
        <template #title>
          Recibir total: <strong>{{ assetsCount }}</strong>
        </template>
        <template #buttons>
          <el-button type="warning" @click="modals.confirm = true" :disabled="assetsCount == 0">Guardar</el-button>
        </template>
      </PageHeader>
      <el-col class="lg:p-4">
        <el-card class="w-full">
          <el-form label-position="top" @submit.prevent="() => { }">
            <el-form-item label="Status del activo a recibir">
              <el-select class="w-full" v-model="status">
                <el-option label="Asignado (Desde taquillas)" value="asignado" />
                <el-option label="Desplegable (Desde depósitos)" value="desplegable" />
                <el-option label="Pendiente (Desde depósitos de revisión)" value="pendiente" />
              </el-select>
            </el-form-item>
            <el-form-item label="Deposito (Por defecto)">
              <el-select class="w-full" v-model="assignments.place" filterable remote placeholder="Elige un deposito"
                :loading="loadingPlace" :remote-method="setPlaces">
                <el-option v-for="item in places.rows" :key="item.id" :label="`${item.id}- ${item.code} - ${item.name}`"
                  :value="item.id!">
                  {{ item.id }} - {{ item.code }} - {{ item.name }}
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Serial" v-if="assignments.place">
              <el-autocomplete v-model="filters.serial" highlight-first-item value-key="serial"
                :fetch-suggestions="setAssets" @select="handleSelectAsset" class="w-full">
                <template #default="{ item }">
                  <div :class="assetStatus({ row: item })">
                    <li><strong>{{ item.serial }}</strong> - {{ item.model.category.name }} - {{ item.model.brand.name
                      }}
                      -
                      {{
                        item.model.name }}</li>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="24" class="md:p-4">
        <el-table :data="assignments.assets">
          <el-table-column type="index" width="50" />
          <el-table-column label="Serial" prop="serial" min-width="120">
          </el-table-column>
          <el-table-column label="Lugar" min-width="120">
            <template #default="{ row }">
              {{ row.location?.code }} - {{ row.location?.name }}
            </template>
          </el-table-column>
          <el-table-column label="Estado" prop="location.name" min-width="120">
            <template type="text" #default="{ row }">
              <el-select v-model="row.locationId" class="select-success" placeholder="Selecciona un estado"
                label="Estados" style="width: 100%" name="assetDeposit" filterable>
                <el-option v-for="option in places.rows" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Categoría" prop="model.category.name" min-width="120">
          </el-table-column>
          <el-table-column label="Marca" prop="model.brand.name" min-width="120">
          </el-table-column>
          <el-table-column label="Modelo" prop="model.name" min-width="120">
          </el-table-column>
          <el-table-column width="50">
            <template #default="{ row }">
              <el-button type="danger" circle @click="deleteAssignment(row)">
                <Icon name="ep:delete" />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog v-model="modals.confirm">
      <OrderFormSave default-type="checking" @submit="checking" />
    </el-dialog>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['assets:checking']
})

const loadingAssets = ref(true)
const loadingPlace = ref(false);

const status = ref('asignado');

const AssetsServices = useAssets();
const LocationsServices = useLocation();
const OrdersServices = useOrders();
const locationsServices = new LocationsServices();
const assetService = new AssetsServices();
const orderService = new OrdersServices();

const assets = reactive<{
  rows: Asset[],
  total: number
}>({
  rows: [],
  total: 0
})

const places = reactive<{
  rows: Place[],
  total: number
}>({
  rows: [],
  total: 0
});

const assignments = reactive<{
  assets: Asset[],
  place?: number,
  locationId?: number,
  groupId?: number
}>({
  assets: [],
  place: undefined,
  locationId: undefined
})

const modals = reactive({
  assign: false,
  confirm: false,
})

const filters = reactive({
  limit: 2,
  offset: 0,
  serial: '',
})

const assetStatus = ({
  row,
}: {
  row: Asset,
}) => {
  if (row.location && row.location.type && row.location.type.status === 'archivado') {
    return 'danger-row'
  } else if (row.location && row.location.type && row.location.type.status === 'pendiente') {
    return 'warning-row'
  } else if (row.location && row.location.type && row.location.type.status == 'asignado') {
    return 'success-row'
  }
  return ''
}

const handleSelectAsset = (row: Asset) => {
  if (assignments.assets.some(e => e.id === row.id)) return ElMessage({
    message: 'Activo ya agregado a la lista.',
    type: 'warning',
  });

  if (row.location?.type?.status != status.value) {
    return ElMessage({
      message: `Activo no se encuentra en estado ${status.value}`,
      type: 'warning',
    });
  }

  assignments.assets.unshift({ ...JSON.parse(JSON.stringify(row)), locationId: assignments.place });

  filters.serial = '';
}

const deleteAssignment = (row: Asset) => {
  const index = assignments.assets.indexOf(row);
  if (index !== -1) {
    assignments.assets.splice(index, 1);
  }
}

const assetsCount = computed(() => {
  return assignments.assets.length
})


const setPlaces = async (search: string) => {
  try {
    const query = {
      search,
      status: ['desplegable', 'archivado', 'pendiente']
    }
    loadingPlace.value = true;
    const { data } = await locationsServices.getLocations(
      query,
    )

    places.rows = data?.value.rows || [];
    places.total = data?.value.total || 0;

    loadingPlace.value = false;
  } catch (error) {
    loadingPlace.value = false;
  }
}

const setAssets = async (query: string, cb: (arg: Asset[]) => void) => {
  try {
    loadingAssets.value = true;
    const data = await assetService.getAssets({ serial: query })

    loadingAssets.value = false;

    cb(data?.value?.rows || [])
  } catch (error) {
    loadingAssets.value = false;
  }
}

const checking = async (orderData: OrderData) => {
  const targets = assignments.assets.map((asset) => {
    const assetId = asset.id;
    const locationId = asset.locationId;
    const target = {
      assetId,
      locationId
    };
    return target
  });
  try {
    await orderService.checking({
      ...orderData,
      targets
    })

    modals.assign = false
    assignments.assets = [];
    assets.rows = [];
    assignments.place = undefined;
    assignments.locationId = undefined;
  } catch (error) {
    const { $errorHandler } = useNuxtApp();
    $errorHandler(error);
  }
}

onMounted(() => {
  setPlaces('')
})

</script>

<style>
.warning-row {
  background-color: var(--el-color-warning-light-5);
}

.success-row {
  background-color: var(--el-color-success-light-5);
}

.danger-row {
  background-color: var(--el-color-danger-light-5);
}

.info-row {
  background-color: var(--el-color-info-light-5);
}

.cell {
  display: flex;
  align-items: center;
}
</style>
