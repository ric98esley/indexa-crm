<template>
  <el-col :gutter="20">
    <el-row :span="24" class="p-4">
      <el-card class="w-full">
        <el-table :data="response.rows" v-loading="loadingAssets" :row-class-name="assetStatus">
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
            <template #header>
              <el-input v-model="filters.serial" placeholder="Serial" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Estado" prop="location.name">
            <template #header>
              <el-input v-model="filters.deposit" placeholder="Estado" clearable />
            </template>
            <template #default="{ row }">
              {{ row.location.code }} - {{ row.location.name }}
            </template>
          </el-table-column>
          <el-table-column label="Categoría" prop="model.category.name">
            <template #header>
              <el-input v-model="filters.category" placeholder="Categoría" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Marca" prop="model.brand.name">
            <template #header>
              <el-input v-model="filters.brand" placeholder="Marca" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Modelo" prop="model.name">
            <template #header>
              <el-input v-model="filters.model" placeholder="Modelo" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
            <template #default="{ row }">
              <el-row>
                <el-button type="primary" circle @click="addAssignment(row)"
                  :disabled="targets.some(e => e.assetId === row.id)">
                  <Icon name="ep:plus" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[2, 5, 10]" :background="true" layout="total, sizes, prev, pager, next, jumper"
          :total="response.total" />
      </el-card>

    </el-row>
    <el-row :span="24" class="p-4">
      <el-card class="w-full">
        <template #header>
          <el-row>
            <el-descriptions class="margin-top w-full" :column="3" border>
              <template #title>
                Datos de la asignación - activos {{ assetsCount }}
              </template>
              <template #extra>
                <el-button @click="modals.assign = true">Elige la agencia</el-button>
                <el-button type="primary" v-if="assignments.place" :disabled="assetsCount == 0"
                  @click="checkout()">Asignar</el-button>
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
    </el-row>
    <el-container>
      <el-dialog v-model="modals.assign">
        <template #header>
          <h2>Buscar </h2>
        </template>
        <template #default>
          <el-form label-width="120px">
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
              <el-select class="w-full" v-model="assignments.place" filterable remote effect="dark"
                placeholder="Elige una agencia" :loading="loadingPlace" :remote-method="setPlaces"
                @change="(value) => console.log(value)">
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
  </el-col>
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
const loadingGroup = ref(false);

const LocationsServices = useLocation();
const locationsServices = new LocationsServices();

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
  deposit: ''
})

const assetStatus = ({
  row,
  rowIndex,
}: {
  row: Asset,
  rowIndex: number
}) => {
  if (row.location && row.location.type && row.location.type.status === 'archivado') {
    return 'danger-row'
  } else if (row.location && row.location.type && row.location.type.status === 'pendiente') {
    return 'warning-row'
  } else if (row.location && row.enabled === false) {
    return 'success-row'
  }
  return ''
}

const getAssets = async () => {
  try {
    loadingAssets.value = true;
    const { data, pending, error } = await useFetch<{ rows: Asset[], total: number }>('/assets',
      {
        params: {
          ...(filters.serial != '' && filters.serial && {
            serial: filters.serial
          }),
          ...(filters.model != '' && filters.model && {
            model: filters.model
          }),
          ...(filters.deposit != '' && filters.deposit && {
            deposit: filters.deposit
          }),
          ...(filters.category != '' && filters.category && {
            category: filters.category
          }),
          ...(filters.brand != '' && filters.brand && {
            brand: filters.brand
          }),
          enabled: true,
          status: 'desplegable',
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit
          })
        }
      }
    );
    response.rows = data.value?.rows || [];
    response.total = data.value?.total || 0;
    loadingAssets.value = false;

    return { data, error, pending }
  } catch (error) {
    loadingAssets.value = false;
  }
}

const addAssignment = (row: Asset) => {
  if (targets.value.some(e => e.assetId === row.id)) return;

  assignments.assets.push(row);
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
      status: ['asignado']
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

const getGroups = async ({
  name,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  code?: string,
  parent?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
      {
        params: {
          ...(name != '' && name && {
            name
          }),
          ...(offset && {
            offset: (offset - 1) * limit
          }),
          ...(limit && {
            limit
          })
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingGroup.value = false;
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
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


const setGroup = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getGroups(search);
  groups.rows = rta?.rows || []
  groups
}

const setPlaces = async (search: string) => {
  const query = {
    search,
    groupId: assignments.groupId
  }
  const rta = await getPlaces(query);
  places.rows = rta?.rows || []
  places.total = rta?.total || 0
}

const checkout = async () => {
  try {

    const { data, error } = await useFetch<Order>(
      '/orders/checkout',
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

watch(filters, useDebounce(async () => {
  await getAssets()
}, 500))

onMounted(async () => {
  await getAssets();
})

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