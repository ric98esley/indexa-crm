<template>
  <el-container>
    <div id="print" class="print text-xs">
      <el-col>
        <PrintHeader />
        <br />
        <el-row class="text-xs" justify="space-between">
          <el-col :span="7">
            <strong> Reporte de inventario</strong>
            <br />
            Fecha de reporte: {{ new Date().toLocaleString() }} <br />
            Impreso por <b>{{ user?.username }}</b>
          </el-col>

          <el-col :span="8">
            <strong>Datos de {{ response.place?.type?.name }}</strong> <br />
            {{ response.place?.code }} - {{ response.place?.name }} | Grupo:
            {{ response.place?.group?.code }} - {{ response.place?.group?.name }}
            <br />
            Dirección: <b> {{ response.place?.address }} </b><br />
            Numero de {{ response.place?.type?.name }}:
            <b> {{ response.place?.phone }}</b>
          </el-col>
          <el-col :span="6">
            <strong>
              Datos del responsable de
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
          <tr v-for="(assignment, index) in response.rows" v-bind:key="index" :class="assignment.current ? '' : 'is-not-current'">
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

        <table class="w-full signs mt-10">
          <tr class="mt-5">
            <th>Firma del cliente</th>
            <th>Firma del técnico</th>
          </tr>
        </table>
        <div>
          <br /><br />
          <strong>Nota:</strong> Con este documento se hace constar el buen
          funcionamiento de los activos asignados, así como también el compromiso
          por el cuidado de los mismos por parte de quien recibe. Es importante
          señalar que en caso de robo, pedida o mal uso, el cliente asume la
          responsabilidad ante la empresa.
        </div>
      </el-col>
    </div>
  </el-container>
</template>

<script setup lang="ts">

const route = useRoute();
import { useAuthStore } from '@/stores/authStore';

definePageMeta({
  layout: 'print',
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations:read', 'locations:create', 'locations:update', 'locations:delete']
})

const auth = useAuthStore();

const LocationService = useLocation();
const locationService = new LocationService();

const user = auth.getUser;

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
    id: route.params.id.toString(),
    orderType: route.query.orderType,
    serial: route.query.serial,
    deposit: route.query.deposit,
    category: route.query.category,
    brand: route.query.brand,
    model: route.query.model,
    limit: Number(route.query.total),
    startDate: route.query.startDate,
    endDate: route.query.endDate,
    all: route.query.all,
    paranoid: route.query.paranoid,
    current: route.query.current
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

.is-not-current {
    text-decoration:line-through;
}
</style>