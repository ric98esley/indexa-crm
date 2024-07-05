<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <PageHeader name="Asignar" class="mb-4 h-8 items-center">
          <template #buttons>
            <el-button type="warning" v-if="assignments.place" :disabled="assetsCount == 0"
              @click="modals.confirm = true">Asignar</el-button>
          </template>
        </PageHeader>
      </el-col>
      <el-col>
        <el-card class="w-full">
          <el-form label-width="120px" @submit.prevent="() => { }" label-position="top">
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="assignments.groupId" filterable remote placeholder="Elige un grupo"
                :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="`${item.code} - ${item.name}`"
                  :value="item.id!">
                  <span style="float: left">{{ item.code }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.name }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Lugar o agencia" v-if="assignments.groupId">
              <el-autocomplete v-model="assignments.location" value-key="name" :fetch-suggestions="setPlaces"
                @select="handleSelectPlace" class="w-full">
                <template #default="{ item }">
                  <span style="float: left">{{ item.code }} {{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.group?.code }}</span>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="Serial" v-if="assignments.place">
              <el-select
                v-model="selectedAsset"
                class="w-full"
                filterable
                remote
                placeholder="Busca un serial"
                :loading="loadingAssets"
                :remote-method="setAssets">
                <el-option
                  :class="assetStatus({ row: item })"
                  v-for="item in assets.rows" :key="item.id"
                  :label="`${item.id}- ${item.serial} - ${item.location?.name}`"
                  :disabled="assignments.assets.some(e => e.id === item.id) || item.location?.type?.status != 'desplegable'"
                  :value="item.serial">
                  <div class="flex justify-between">
                    <span><b>{{ item.serial }}</b>- {{ item?.model?.category.name }} - {{ item?.model?.brand.name }} -
                      {{ item.model?.name }}</span>
                    <span>{{ item.location?.type?.status }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="24" class="mt-4 md:p-4">
        <el-descriptions class="w-full" :column="width > 768 ? 3 : 1" border>
          <template #title>
            Datos de la asignación - activos {{ assetsCount }}
          </template>
          <template v-if="assignments.place">

            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <Icon name="ep:user" />
                  Responsable
                </div>
              </template>
              {{ assignments.place?.manager?.name }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <Icon name="mdi-light:eye" />
                  Código
                </div>
              </template>
              {{ assignments.place?.code }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <Icon name="ep:phone" />
                  Teléfono
                </div>
              </template>
              {{ assignments.place?.phone }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <Icon name="ep:school" />
                  Agencia
                </div>
              </template>
              {{ assignments.place?.name }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <Icon name="ep:connection" />
                  Grupo
                </div>
              </template>
              {{ assignments.place?.group?.code }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <Icon name="ep:place" />
                  Dirección
                </div>
              </template>
              {{ assignments.place?.address }}
            </el-descriptions-item>
          </template>
        </el-descriptions>
        <el-table :data="assignments.assets">
          <el-table-column type="index" width="50" label="id" />
          <el-table-column label="Serial" prop="serial" min-width="120">
          </el-table-column>
          <el-table-column label="Procedencia">
            <template #default="{ row }">
              {{ row.location?.code }} - {{ row.location?.name }}
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
      <OrderFormSave default-type="borrowing" @submit="checkout" />
    </el-dialog>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['assets:checkout']
});

const AssetsServices = useAssets();
const GroupsServices = useGroups();
const OrdersServices = useOrders();
const assetService = new AssetsServices();
const groupService = new GroupsServices();
const orderService = new OrdersServices();

const loadingAssets = ref(true)
const loadingPlace = ref(false);
const loadingGroup = ref(false);

const width = ref<number>(window.screen.width);

const LocationsServices = useLocation();
const locationsServices = new LocationsServices();

const assets = reactive<{
  rows: Asset[],
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

const assignments = reactive<{
  assets: Asset[],
  place?: Place,
  location?: string,
  groupId?: number
}>({
  assets: [],
  place: undefined,
  location: undefined
})

const modals = reactive({
  confirm: false
})

const filters = reactive({
  limit: 2,
  offset: 0,
  serial: '',
  category: '',
  brand: '',
  model: '',
  deposit: ''
})

const handleSelectAsset = (row: Asset) => {
  if (targets.value.some(e => e.assetId === row.id)) return;

  assignments.assets.unshift(row);
  filters.serial = '';
}

const selectedAsset = computed<string>({
  get() {
    return '';
  },
  set(value: string ) {
    const item = assets.rows.filter((asset) => asset.serial == value)[0];
    if(item) handleSelectAsset(item)
  }
})

const deleteAssignment = (row: Asset) => {
  const index = assignments.assets.indexOf(row);
  if (index !== -1) {
    assignments.assets.splice(index, 1);
  }
}

const targets = computed(() => {
  return assignments.assets.map((asset) => {
    const assetId = asset.id;
    const locationId = assignments.place?.id || undefined;
    const target = {
      assetId,
      locationId
    };
    return target
  });
})

const assetsCount = computed(() => {
  return assignments.assets.length
})


const setGroup = async (query?: string) => {
  try {
    loadingGroup.value = true;

    const search = {
      name: query,
    }
    const data = await groupService.getGroups(search);
    groups.rows = data?.rows || []
    loadingGroup.value = false;
  } catch (error) {
    loadingGroup.value = false;
  }
}

const setPlaces = async (search: string, cb: (arg: any) => void) => {
  try {
    const query = {
      search,
      groupId: assignments.groupId
    }
    loadingPlace.value = true;
    const { data } = await locationsServices.getLocations({
      ...query,
      status: ['asignado', 'desplegable', 'pendiente']
    })

    cb(data.value.rows);
  } catch (error) {
  }
}

const setAssets = async (query: string) => {
  try {
    loadingAssets.value = true;
    const data = await assetService.getAssets({ serial: query })

    assets.rows = data?.value?.rows || [];
    assets.total = data?.value?.total || 0;
    loadingAssets.value = false;
  } catch (error) {
    loadingAssets.value = false;
  }
}

const resize = (e: any) => {
  width.value = window.screen.width;
}

const handleSelectPlace = (row: Place) => {
  assignments.location = `${row.name} - ${row.code}`;
  assignments.place = row;
}

const checkout = async (orderData: OrderData) => {
  await orderService.checkout({
    targets: targets.value,
    placeId: assignments.place?.id,
    ...orderData
  })

  assignments.assets = [];
  assets.rows = [];
  assignments.groupId = undefined;
  assignments.location = undefined;
  assignments.place = undefined
}


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

onMounted(() => {
  window.addEventListener("resize", resize);
})

onUnmounted(() => {
  window.removeEventListener("resize", resize);
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