<template>
  <el-container>
    <div id="print" class="print text-xs">
      <el-col>
        <PrintHeader />
        <br />
        <el-row class="text-xs">
          <el-col :span="7">
            <strong>Datos de la orden</strong>
            <br />
            {{
              order.type == "checkout"
              ? "Reporte de salida"
              : "Reporte de entrada"
            }}
            <br />
            Realizado por:
            <b> {{ order.createdBy?.username }} </b>
            <br />
            Fecha de impresión: {{ new Date().toLocaleString() }} <br />
            Creado el: {{ new Date(order.createdAt || '').toLocaleString() }}
          </el-col>

          <el-col :span="9" v-if="order.type == 'checkout'">
            <strong>Datos de la {{ order.location?.type?.name }}</strong> <br />
            {{ order.location?.code }} - {{ order.location?.name }} | Grupo:
            {{ order.location?.group?.code }} - {{ order.location?.group?.name }}
            <br />
            Dirección: <b> {{ order.location?.address }} </b><br />
            Numero de la {{ order.location?.type?.name }}:
            <b> {{ order.location?.phone }}</b>
          </el-col>
          <el-col :span="6" v-if="order.type == 'checkout'">
            <strong>
              Datos del responsable de la
              {{ order.location?.type?.name || '' }}: </strong><br />
            Nombre: <b> {{ order.location?.manager?.name || '' }}</b> <br />
            Teléfono: <b>{{ order.location?.manager?.phone || '' }}</b> <br />
          </el-col>
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
          <tr v-for="(assignment, index) in assignments" v-bind:key="index" :class="assignment.current ? '' : 'is-not-current'">
            <td>{{ index + 1 }}</td>
            <td>{{ new Date(assignment.createdAt).toLocaleString() }}</td>
            <td>{{ assignment.asset?.serial }}</td>
            <td>
              {{ assignment.asset.model?.category.name || '' }} -
              {{ assignment.asset.model?.brand.name || '' }} -
              {{ assignment.asset.model?.name || '' }}
            </td>
            <td v-if="order.type == 'checking'">
              <template v-if="assignment.from">
                <b>
                  {{ assignment.from?.code }}
                </b> -
                {{ assignment.from?.name }}
              </template>
            </td>
          </tr>
          <tr>
            <th colspan="4" class="text-center">
              <b>
                Cantidad de activos asignados: {{ assignments.length }}
              </b>
            </th>
          </tr>
        </table>

        <table class="w-full signs mt-20">
          <tr>
            <th v-if="order.type == 'checking'">Recibido por:</th>
            <th v-else>Firma del cliente</th>
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

const MovementsService = useMovements();
const OrderService = useOrders();
const orderService = new OrderService();

definePageMeta({
  layout: 'print',
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
})

const assignments = ref<Assignments[]>([])


const order = reactive<Order>({
  type: '',
  description: '',
  content: '',
  count: 0,
  delivered: false,
  closed: false,
  location: undefined,
  createdAt: '',
});

const getOrder = async () => {
  try {
    const data = await orderService.getOrder({ id: route.params.id });
    order.type = data?.value?.type || '';
    order.description = data?.value?.description || '';
    order.content = data?.value?.content;
    order.count = data?.value?.count || 0;
    order.delivered = data?.value?.delivered || false;
    order.closed = data?.value?.closed || false;
    order.location = data?.value?.location;
    order.createdAt = data?.value?.createdAt;
    order.createdBy = data?.value?.createdBy;
  } catch (error) {

  }
}

const getMovements = async () => {
  try {
    const data = await orderService.getOrderMovements({ id: Number(route.params.id), limit: order.count })

    assignments.value = data?.value?.rows || [];

  } catch (error) {

  }
}

onMounted(async () => {
  await getOrder().then(async () => {
    await getMovements()
  }).then(() => {
    setTimeout(()=> {
      window.print();
      setTimeout(window.close, 500);
    }, 1000);
  }).catch(() => { setTimeout(window.close, 500) });
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