<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <PageHeader name="Recibir" class="mb-4" />
      <el-col class="lg:p-4">
        <el-card class="w-full">
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
      <el-col :span="24" class="md:p-4">
        <el-card class="w-full">
          <template #header>
            <el-row>
              <el-descriptions class="margin-top w-full" :column="3" border>
                <template #title>
                  Datos de la asignación - activos {{ assetsCount }}
                </template>
                <template #extra>
                  <el-select v-model="assignments.locationId" class="select-success" placeholder="Selecciona un estado"
                    label="Estados" style="width: 100%" name="assetDeposit" filterable>
                    <el-option v-for="option in places.rows" :key="option.id" :value="option.id!"
                      :label="`${option.id} - ${option.name}`">
                      {{ option.id }} - {{ option.name }}
                    </el-option>
                  </el-select>
                  <el-button type="primary" v-if="assignments.place" :disabled="assetsCount == 0"
                    @click="checking()">Recibir</el-button>
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
            </el-row>
          </template>
          <template #default>
            <el-table :data="assignments.assets">
              <el-table-column type="index" width="50" />
              <el-table-column type="expand" width="50">
                <template #default="props">
                  <el-table :data="props.row.specifications" :border="true">
                    <el-table-column label="Campo" prop="type.name"></el-table-column>
                    <el-table-column label="Valor" prop="value"></el-table-column>
                  </el-table>
                </template>
              </el-table-column>
              <el-table-column label="Serial" prop="serial">
              </el-table-column>
              <el-table-column label="Estado" prop="location.name">
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
              <el-table-column label="Categoría" prop="model.category.name">
              </el-table-column>
              <el-table-column label="Marca" prop="model.brand.name">
              </el-table-column>
              <el-table-column label="Modelo" prop="model.name">
              </el-table-column>
              <el-table-column>
                <template #default="{ row }">
                  <el-button type="danger" circle @click="deleteAssignment(row)" v-role="['superuser', 'auditor']">
                    <Icon name="ep:delete" />
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-col>
      <el-container>
        <el-dialog v-model="modals.assign">
          <template #header>
            <h2>Buscar</h2>
          </template>
          <template #default>
            <el-form label-width="120px">
              <el-form-item label="Agencia">
                <el-select class="w-full" v-model="assignments.place" filterable remote effect="dark"
                  placeholder="Elige una agencia" :loading="loadingPlace" :remote-method="setPlaces">
                  <el-option v-for="item in places.rows" :key="item.id"
                    :label="`${item.code} - ${item.name} -  ${item.group?.code}`" :value="item">
                    <span style="float: left">{{ item.code }} {{ item.name }}</span>
                    <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.group?.code }}</span> </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </template>
        </el-dialog>
      </el-container>
    </el-row>
  </el-container>
</template>

<script lang="ts" setup>

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico', 'receptor', 'auditor'],
})

const loadingAssets = ref(true)
const loadingPlace = ref(false);

const AssetsServices = useAssets();
const LocationsServices = useLocation();
const locationsServices = new LocationsServices();
const assetService = new AssetsServices();



const response = reactive<{
  rows: Asset[],
  total: number
}>({
  rows: [],
  total: 0
});

const places = reactive<{
  rows: Place[],
  total: number
}>({
  rows: [],
  total: 0
});

const assignments = reactive<{
  assets: Asset[],
  place?: Place,
  locationId?: number,
  groupId?: number
}>({
  assets: [],
  place: undefined,
  locationId: undefined
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
  location: ''
})

const getAssets = async (query: string, cb: (arg: any) => void) => {
  try {
    loadingAssets.value = true;
    const { data, error } = await assetService.getAssets({ serial: query, status: 'desplegable' })
    const rows = data.value?.rows || [];
    loadingAssets.value = false;

    cb(rows)
  } catch (error) {
    loadingAssets.value = false;
  }
}

const handleSelectAsset = (row: Asset) => {
  if (targets.value.some(e => e.assetId === row.id)) return;

  assignments.assets.push(row);
  filters.serial = '';
}

const deleteAssignment = (row: Asset) => {
  const index = assignments.assets.indexOf(row);
  if (index !== -1) {
    assignments.assets.splice(index, 1);
  }
}

const getPlaces = async ({
  search,
  groupId,
}: {
  id?: number,
  search?: string,
  groupId?: number
}) => {
  try {
    loadingPlace.value = true;
    const { data, error } = await locationsServices.getLocations({
      search,
      groupId,
      status: ['desplegable', 'archivado', 'pendiente']
    })

    if (error.value) {
      throw new Error('Error al cargar los agencias')
    }

    loadingPlace.value = false;
    return data.value
  } catch (error) {
    loadingPlace.value = false;
    ElNotification({
      message: 'Error al obtener las agencia intente de nuevo mas tarde'
    })
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


const setPlaces = async (search: string) => {
  try {
    const query = {
      search,
      groupId: assignments.groupId
    }
    loadingPlace.value = true;
    const { data, error } = await locationsServices.getLocations({
      ...query,
      status: ['asignado']
    })

    places.rows = data?.rows || []
    places.total = data?.total || 0

    loadingPlace.value = false;
  } catch (error) {
    loadingPlace.value = false;
  }
}


const checking = async () => {
  try {

    const { data, error } = await useFetch<Order>(
      '/orders/checking',
      {
        method: 'post',
        body: {
          targets: targets.value,
          locationId: assignments.place!.id,
          description: 'borrowing'
        }
      }
    );

    if (error.value) {
      throw new Error()
    }
    ElNotification({
      message: "Activos asignado correctamente",
    });

    await getAssets();

    modals.assign = false
    assignments.assets = [];
    assignments.place = undefined;
    assignments.locationId = undefined;

    if (data.value && data.value.id) return navigateTo(
      {
        path: `/assignments/${data.value.id}/print`,
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

  } catch (error) {
    ElNotification({
      message: "Vuelve a intentarlo mas tarde",
    });
    console.log(error);
  }
}

</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-5);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-5);
}

.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-5);
}
</style>