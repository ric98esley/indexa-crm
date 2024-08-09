<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <!-- Esta componente tiene el PageHeader -->
      <AssetsDescription :id="Number(route.params.id)"></AssetsDescription>
      <el-tabs v-model="activeName" class="w-full">
        <el-tab-pane label="Historial" name="history">
          <el-col v-can="['movements:read']">
            <h2 class="m-4">Historial de prestamos</h2>
            <el-row>
              <el-table :data="movements.rows" v-loading="loadingAssignments">
                <el-table-column type="index" width="50" />
                <el-table-column type="expand">
                  <template #default="{ row }">
                    Lugar de origen: {{ row.from.code }} - {{ row.from.name }}
                  </template>
                </el-table-column>
                <el-table-column label="Fecha" min-width="120">
                  <template #default="{ row }">
                    {{ new Date(row.createdAt).toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column label="Tipo" width="80">
                  <template #default="{ row }">
                    {{ row.order.type == 'checkout' ? 'Salida' : 'Entrada' }}
                  </template>
                </el-table-column>
                <el-table-column label="Procedencia" min-width="120">
                  <template #default="{ row }">
                    <Nuxt-Link :to="`/places/${row.to.id}`">
                      <span class="text-teal-500 underline">
                        {{ row.to?.code }} - {{ row.to?.name }} / {{ row.to?.group?.code }} {{
                          row.to?.group.name }}
                      </span>
                    </Nuxt-Link>
                  </template>
                </el-table-column>
                <el-table-column label="Realizado por" min-width="120">
                  <template #default="{ row }">
                    {{ row.createdBy.username }}
                  </template>
                </el-table-column>
              </el-table>
              <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="movements.total" />
            </el-row>
          </el-col>
        </el-tab-pane>
        <el-tab-pane label="Bitácora" name="log">
          <el-col v-can="['assets:read']">
            <h2 class="m-4">Bitácora del activo</h2>
            <el-row>
              <AssetsTableLogs :data="logs.rows"></AssetsTableLogs>
            </el-row>
          </el-col>
        </el-tab-pane>
        <el-tab-pane label="Especificaciones" name="spec">
          <el-col v-can="['assets:read']">
            <div class="flex items-center justify-between">
              <h2> Especificaciones del activo</h2>
              <el-button type="primary" @click="addSpecificationModal = true" v-can="['assets:update']">Agregar o
                Modificar</el-button>
            </div>
            <AssetsTableSpecs :data="spec?.rows" @delete="handlerDeleteSpecification" />
          </el-col>
        </el-tab-pane>
        <el-tab-pane label="Mantenimientos" name="maintenance">
          <el-col v-can="['maintenances:read']">
            <h2 class="m-4">Mantenimientos del activo</h2>
            <el-row>
              <MaintenanceTable :data="maintenances.rows" :total="maintenances.total"
                v-model:filters="maintenanceFilters" @refresh="getData" />
            </el-row>
          </el-col>
        </el-tab-pane>
        <el-tab-pane label="Alertas" name="alerts">
          <el-col v-can="['assets:read']">
            <h2 class="m-4">Alertas del activo</h2>
            <el-row>
              <GeoTable :data="geoAlerts.rows" :total="geoAlerts.total"
                @filters="(filters) => getGeoAlerts(Number(route.params.id), filters)" />
            </el-row>
          </el-col>
        </el-tab-pane>
        <el-tab-pane label="Mapa" name="map">
          <el-alert title="Primero carga las alertas para mostrar las ubicaciones" type="warning" />
          <div style="height:80vh; width:100vw">
            <LMap ref="map" :zoom="13" :center="[7.766944, -72.225]" :use-global-leaflet="false">
              <LMarker v-for="alert in geoAlerts.rows" :lat-lng="[Number(alert.latitude), Number(alert.longitude)]">
                <LIcon v-if="alert.alert" class-name="bg-transparent text-red-500 text-4xl" :icon-size="[40, 80]">
                  <Icon name="material-symbols:location-on" />
                </LIcon>
                <LIcon v-else class-name="bg-transparent text-blue-600 text-xl" :icon-size="[21, 21]">
                  <Icon name="material-symbols:location-on" />
                </LIcon>
              </LMarker>
              <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                layer-type="base" name="OpenStreetMap" />
            </LMap>
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-col>
      </el-col>
      <el-dialog v-model="addSpecificationModal">
        <AssetsFormSpec @submit="handlerAddSpecification" />
      </el-dialog>
    </el-row>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['assets:read']
});

const route = useRoute();

const AssetServices = useAssets();
const assetServices = new AssetServices();

const addSpecificationModal = ref(false);
const map = ref(null) as any;

const activeName = ref('history')
const loadingAssignments = ref(false)

const movements = reactive<{
  rows: Assignments[],
  total: number
}>({
  rows: [],
  total: 0
})
const logs = reactive<{
  rows: object[],
  total: number
}>({
  rows: [],
  total: 0
})

const maintenances = reactive<{
  rows: Maintenance[],
  total: number
}>({
  rows: [],
  total: 0
})

const geoAlerts = reactive<{
  rows: GeoAlert[],
  total: number
}>({
  rows: [],
  total: 0
})

const spec = reactive<{
  rows: Specification[],
  total: number
}>({
  rows: [],
  total: 0
})


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
  offset: 0
})

const maintenanceFilters = reactive<FindMaintenance>({
  limit: 10,
  offset: 0,
  serial: '',
  description: '',
})

const getAssetMovements = async (assetId?: number) => {
  try {
    if (!assetId) return;
    const queries = {
      id: assetId,
      limit: filters.limit,
      offset: filters.offset,
      all: true,
      paranoid: false,
    }
    loadingAssignments.value = true;
    const res = await assetServices.getAssetMovements(queries);
    movements.rows = res?.value?.rows || [];
    movements.total = res?.value?.total || 0;
    loadingAssignments.value = false
  } catch (error) {
    loadingAssignments.value = false;
    console.log(error);
  }
}

const getLogs = async (id: number) => {
  try {
    const data = await assetServices.findOneLogs({
      id
    })

    logs.rows = data?.rows || [];
    logs.total = data?.total || 0;
  } catch (error) {

  } finally { }
}

const getMaintenances = async (id: number) => {
  try {
    const data = await assetServices.getAssetMaintenance(id, maintenanceFilters);

    maintenances.rows = data?.rows || [];
    maintenances.total = data?.total || 0;
  } catch (error) {

  } finally { }
}

const getGeoAlerts = async (id: number, filters = {}) => {
  try {
    const data = await assetServices.findOneGeo(id, filters);

    geoAlerts.rows = data?.rows || [];
    geoAlerts.total = data?.total || 0;
  } catch (error) {

  } finally { }
}

const handlerAddSpecification = async (data: { typeId: number, value: string }) => {
  try {
    const id = Number(route.params.id)
    await assetServices.addAssetSpecification({ id, ...data });
    await setSpecification(id);
  } catch (error) {
    console.log(error);
  }
}

const handlerDeleteSpecification = async (typeId: number) => {
  try {
    await assetServices.removeAssetSpecification({ id: Number(route.params.id), typeId });
    await setSpecification(Number(route.params.id));
  } catch (error) {
    console.log(error);
  }
}

const setSpecification = async (id: number) => {
  try {
    const res = await assetServices.getAssetSpecifications({ id });
    spec.rows = res?.rows || [];
  } catch (error) {
    console.log(error);
  }
}


watch(filters, useDebounce(async () => {
  await getAssetMovements(Number(route.params.id))
}, 500
))

const getData = async () => {
  if (!route.params.id) return;
  if (activeName.value === 'history') await getAssetMovements(Number(route.params.id));
  if (activeName.value === 'log') await getLogs(Number(route.params.id));
  if (activeName.value === 'alerts') await getGeoAlerts(Number(route.params.id));
  if (activeName.value === 'spec') await setSpecification(Number(route.params.id));
  if (activeName.value === 'maintenance') await getMaintenances(Number(route.params.id));
  if (activeName.value === 'map') {
    setTimeout(function () { window.dispatchEvent(new Event('resize')) }, 250);
  }
}

watch(activeName, () => {
  getData()
})

onMounted(async () => {
  await getData()
})
</script>