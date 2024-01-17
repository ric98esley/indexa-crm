<template>
  <el-container>
    <div id="print" class="print text-xs">
      <el-col>
        <el-row>
          <el-col :span="12">
            <el-row class="p-3" justify-content="start">
              <el-image class="w-32 m-0" src="/img/gana_logo.png" fit="contain" />
            </el-row>
          </el-col>
          <el-col :span="12" class="text-right text-xs">
            <strong>Comercializadora la excelencia (Gana loterías)</strong>
            <address>
              Rif: J-29401587-5 <br />
              Departamento técnico <br />
              Calle 15, Barrio Obrero - San Cristóbal <br />
              Teléfono: 0276-355-6947 <br />
            </address>
          </el-col>
        </el-row>
        <br />
        <el-row class="text-xs">
          <el-col :span="8">
            <strong> Reporte de inventario</strong>

            <br />
            Fecha de impresion: {{ new Date().toLocaleString() }} <br />
          </el-col>

          <el-col :span="10">
            <strong>Datos de la {{ response.place?.type?.name }}</strong> <br />
            {{ response.place?.code }} - {{ response.place?.name }} | Grupo:
            {{ response.place?.group?.code }} - {{ response.place?.group?.name }}
            <br />
            Dirección: <b> {{ response.place?.address }} </b><br />
            Numero de {{ response.place?.type?.name }}:
            <b> {{ response.place?.phone }}</b>
          </el-col>
          <el-col :span="6">
            <strong>
              Datos del responsable de la
              {{ response.place?.type?.name || '' }}: </strong><br />
            Nombre: <b> {{ response.place?.manager?.name || '' }}</b> <br />
            Teléfono: <b>{{ response.place?.manager?.phone || '' }}</b> <br />
          </el-col>
        </el-row>
        <br /><br />
        <table class="w-full table-print">
          <tr>
            <th></th>
            <th>Fecha</th>
            <th>Serial</th>
            <th>Descripción</th>
          </tr>
          <tr v-for="(assignment, index) in response.rows" v-bind:key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ new Date(assignment?.createdAt).toLocaleString() }}</td>
            <td>{{ assignment.asset?.serial }}</td>
            <td>
              {{ assignment.asset.model?.category.name || '' }} -
              {{ assignment.asset.model?.brand.name || '' }} -
              {{ assignment.asset.model?.name || '' }}
            </td>
          </tr>
          <tr>
            <th colspan="4">
              <b>
                Cantidad de activos asignados: {{ response.rows.length }}
              </b>
            </th>
          </tr>
        </table>

        <table class="w-full signs mt-5">
          <tr class="mt-5">
            <th>Firma del cliente</th>
            <th>Firma del técnico</th>
          </tr>
        </table>
      </el-col>
    </div>
  </el-container>
</template>

<script setup lang="ts">

const route = useRoute()

definePageMeta({
  layout: 'print',
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations:read', 'locations:create', 'locations:update', 'locations:delete']
})

const LocationService = useLocation();
const locationService = new LocationService();

const response = reactive<{
  rows: Assignments[],
  place: Place,
  total?: number,
}>({
  place: {
    isActive: false,
    code: '',
    phone: '',
    rif: '',
    address: ''
  },
  total: undefined,
  rows: []
});

const setAssignments = async () => {
  const queries = {
    id: route.params.id,
    type: route.query.type,
    serial: route.query.serial,
    deposit: route.query.deposit,
    category: route.query.category,
    brand: route.query.brand,
    model: route.query.model,
    limit: route.query.total,
    startDate: route.query.startDate,
    endDate: route.query.endDate,
    all: route.query.all
  }
  const assets = await locationService.getLocationAssets(queries);

  response.rows = assets?.rows || [];
  response.total = assets?.total || 0;
}

const setPlace = async () => {
  const place = await locationService.getLocation({id: route.params.id});
  response.place = place;
}

onMounted(async () => {
  await setAssignments()
  await setPlace()
  .then(() => {
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
  text-align: center;
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