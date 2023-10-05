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
            Numero de la {{ response.place?.type?.name }}:
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
            <td>{{ new Date(assignment.checkoutAt).toLocaleString() }}</td>
            <td>{{ assignment.target?.serial }}</td>
            <td>
              {{ assignment.target.model?.category.name || '' }} -
              {{ assignment.target.model?.brand.name || '' }} -
              {{ assignment.target.model?.name || '' }}
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
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
})

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

const getAssignment = async () => {
  try {
    const { data: place } = await useFetch<Place>(`/locations/${route.params.id}`);
    const { data } = await useFetch<{ total: number, rows: Assignments[] }>(`/locations/${route.params.id}/assets`, {
      params: {
        limit: route.query.total
      }
    });

    response.place = place.value;

    response.rows = data.value?.rows || [];
    response.total = data.value?.total
  } catch (error) {
    console.log(error);
  }
}

onMounted(async () => {
  await getAssignment()
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