<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <el-col :span="24" class="md:p-4">
        <PageHeader name="Asignar" class="mb-4" />
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
              <el-form-item label="Agencia" v-if="assignments.groupId">
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
            </el-form>
            <el-form label-position="top" @submit.prevent="() => { }">
              <el-form-item label="Serial">
                <el-autocomplete v-model="filters.serial" value-key="serial" :fetch-suggestions="getAssets"
                  @select="handleSelectAsset" class="w-full">
                  <template #default="{ item }">
                    <li>{{ item.serial }} - {{ item.model.category.name }} - {{ item.model.brand.name }} - {{
                      item.model.name }}</li>
                  </template>
                </el-autocomplete>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

      </el-col>
      <el-col :span="24" class="mt-4 md:p-4">
        <el-descriptions class="w-full" :column="width > 768 ? 3 : 1" border>
          <template #title>
            Datos de la asignación - activos {{ assetsCount }}
          </template>
          <template #extra>
            <el-row justify="end" class="gap-y-4">
              <el-button type="primary" v-if="assignments.place" :disabled="assetsCount == 0"
                @click="checkout()">Asignar</el-button>
            </el-row>
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
              <el-button type="danger" circle @click="deleteAssignment(row)" v-role="['superuser', 'auditor']">
                <Icon name="ep:delete" />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
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
  edit: false,
  assign: false
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

const getAssets = async (query: string, cb: (arg: any) => void) => {
  try {
    loadingAssets.value = true;
    const data = await assetService.getAssets({ serial: query, status: 'desplegable' })
    const rows = data?.value?.rows || [];
    loadingAssets.value = false;

    cb(rows)
  } catch (error) {
    loadingAssets.value = false;
  }
}

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
      status: ['asignado', 'disponible', 'pendiente']
    })

    cb(data.value.rows);
  } catch (error) {
  }
}

const resize = (e: any) => {
  width.value = window.screen.width;
}

const handleSelectPlace = (row: Place) => {
  assignments.location = `${row.name} - ${row.code}`;
  assignments.place = row;
}

const checkout = async () => {
  await orderService.checkout({
    targets: targets.value,
    placeId: assignments.place?.id,
  })

  assignments.assets = [];
  assignments.groupId = undefined;
  assignments.location = undefined;
  assignments.place = undefined
}

onMounted(() => {
  window.addEventListener("resize", resize);
})

onUnmounted(() => {
  window.removeEventListener("resize", resize);
})
</script>