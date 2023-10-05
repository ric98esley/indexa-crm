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
            <strong>Datos de la orden</strong>
            <br />
            {{
              order.type == "checkout"
              ? "Reporte de salida"
              : "Reporte de entrada"
            }}
            <br />
            Fecha de impresión: {{ new Date().toLocaleString() }} <br />
            Creado el: {{ new Date(order.createdAt || '').toLocaleString() }} <br />
            Realizado por:
            <b> {{ order.createdBy?.name }} {{ order.createdBy?.lastName }} </b>
          </el-col>
          <template v-if="order.assignmentType == 'user'">
            <el-col :span="16">
              <strong>Datos de {{ order.user?.username }}</strong> <br />
              {{ order.user?.name }} {{ order.user?.lastName }} <br />
              <b>Teléfono:</b> {{ order.user?.phone }} <br />
              <b>Email:</b> {{ order.user?.email }} <br />
              <b>Cédula:</b> {{ order.user?.cardId }}
            </el-col>
          </template>
          <template v-if="order.assignmentType == 'location'">
            <el-col :span="10">
              <strong>Datos de la {{ order.location?.type?.name }}</strong> <br />
              {{ order.location?.code }} - {{ order.location?.name }} | Grupo:
              {{ order.location?.group?.code }} - {{ order.location?.group?.name }}
              <br />
              Dirección: <b> {{ order.location?.address }} </b><br />
              Numero de la {{ order.location?.type?.name }}:
              <b> {{ order.location?.phone }}</b>
            </el-col>
            <el-col :span="6">
              <strong>
                Datos del responsable de la
                {{ order.location?.type?.name || '' }}: </strong><br />
              Nombre: <b> {{ order.location?.manager?.name || '' }}</b> <br />
              Teléfono: <b>{{ order.location?.manager?.phone || '' }}</b> <br />
            </el-col>
          </template>
        </el-row>
        <br /><br />
        <table class="w-full table-print">
          <tr>
            <th></th>
            <th>Fecha</th>
            <th>Serial</th>
            <th>Descripción</th>
            <template v-if="order.type == 'checking'">
              <th>Lugar</th>
            </template>
          </tr>
          <tr v-for="(assignment, index) in order.assignments" v-bind:key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ new Date(assignment.checkoutAt).toLocaleString() }}</td>
            <td>{{ assignment.target?.serial }}</td>
            <td>
              {{ assignment.target.model?.category.name || '' }} -
              {{ assignment.target.model?.brand.name || '' }} -
              {{ assignment.target.model?.name || '' }}
            </td>
            <td v-if="order.type == 'checking'">
              <template v-if="assignment.user">
                <b>
                  {{ assignment.user?.username }}
                </b> -
                {{ assignment.user?.name }} {{ assignment.user?.lastName }}
              </template>
              <template v-if="assignment.location">
                <b>
                  {{ assignment.location?.code }}
                </b> -
                {{ assignment.location?.name }}
              </template>
              <template v-if="assignment.asset">
                <b>
                  Serial:
                </b>
                {{ assignment.asset?.serial }}
              </template>
            </td>
          </tr>
          <tr>
            <th colspan="4">
              <b>
                Cantidad de activos asignados: {{ order.assignments.length }}
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

const route = useRoute()

definePageMeta({
  layout: 'print',
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
})


const order = reactive<Order>({
  type: '',
  assignmentType: '',
  delivered: false,
  closed: false,
  user: undefined,
  location: undefined,
  asset: undefined,
  assignments: []
});

const getOrder = async () => {
  try {
    const { data, pending, error } = await useFetch<Order>(`/orders/${route.params.id}`)
    order.type = data.value?.type || '';
    order.assignmentType = data.value?.assignmentType || '';
    order.delivered = data.value?.delivered || false;
    order.user = data.value?.user;
    order.location = data.value?.location;
    order.asset = data.value?.asset;
    order.assignments = data.value?.assignments || [];
  } catch (error) {

  }
}

onMounted(async () => {
  await getOrder().then(() => {
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