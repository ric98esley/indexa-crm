<template>
    <div class="print" v-if="pending">
    <div class="w-100 d-flex justify-content-between">
      <div class="col-6">
        <!-- <img :src="logo" alt="logo" class="logo-print" /> -->
      </div>
      <div class="col-6 text-right">
        <strong>Comercializadora la excelencia (Gana loterias)</strong>
        <address>
          Rif: J-29401587-5 <br />
          Departamento técnico <br />
          Calle 15, Barrio Obrero - San Cristobal <br />
          Teléfono: 0276-355-6947 <br />
        </address>
      </div>
    </div>
    <br />
    <div class="d-flex d-flex justify-content-between">
      <div class="col-3">
        <strong>Datos de la orden</strong>
        <br />
        {{
          order.type == "checkout"
            ? "Reporte de salida"
            : "Reporte de entrada"
        }}
        <br />
        Fecha de impresion: {{ new Date().toLocaleString() }} <br />
        Creado el: {{ new Date(order.createdAt).toLocaleString() }} <br />
        Realizado por:
        <b> {{ order.createdBy?.name }} {{ order.createdBy?.lastName }} </b>
      </div>
      <template v-if="order.assignmentType == 'user'">
        <div class="col-8">
          <strong>Datos de {{ order.user?.username }}</strong> <br />
          {{ order.user?.name }} {{ order.user?.lastName }} <br />
          <b>Teléfono:</b> {{ order.user?.phone }} <br />
          <b>Email:</b> {{ order.user?.email }} <br />
          <b>Cedula:</b> {{ order.user?.cardId }}
        </div>
      </template>
      <template v-if="order.assignmentType == 'location'">
        <div class="col-5">
          <strong>Datos de la {{ order.location?.type.name }}</strong> <br />
          {{ order.location?.code }} - {{ order.location?.name }} | Grupo:
          {{ order.location?.group.code }} - {{ order.location?.group.name }}
          <br />
          Dirección: <b> {{ order.location?.address }} </b><br />
          Numero de la {{ order.location?.type.name }}:
          <b> {{ order.location?.phone }}</b>
        </div>
        <div class="col-3">
          <strong>
            Datos del responsable de la
            {{ order.location?.type.name }}: </strong
          ><br />
          Nombre: <b> {{ order.location?.manager.name }}</b> <br />
          Teléfono: <b>{{ order.location?.manager.phone }}</b> <br />
        </div>
      </template>
    </div>
    <br /><br />
    <table class="w-100 table-print">
      <tr>
        <th></th>
        <th>Fecha</th>
        <th>Serial</th>
        <th>Descripción</th>
        <template v-if="order.transactionType == 'checking'">
          <th>Lugar</th>
        </template>
      </tr>
      <tr v-for="(assignment, index) in order.assignments" v-bind:key="index">
        <td>{{ index + 1 }}</td>
        <td>{{ new Date(assignment.checkoutAt).toLocaleString() }}</td>
        <td>{{ assignment.target?.serial }}</td>
        <td>
          {{ assignment.target.model.category.name }} -
          {{ assignment.target.model?.brand?.name }} -
          {{ assignment.target.model.name }}
        </td>
        <td v-if="order.transactionType == 'checking'">
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
            Cantidad de activos asignados: {{ order.assigned?.total }}
          </b>
        </th>
      </tr>
    </table>

    <table class="w-100 signs mt-5">
      <tr class="mt-5">
        <th>Firma del cliente</th>
        <th>Firma del tecnico</th>
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
  </div>
</template>

<script setup lang="ts">

const route = useRoute()

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
})


const { data , pending , error} = useFetch<Order>(`/orders/${route.params.id}`)

const order = reactive<{Order}>(data.value);


</script>

<style scoped>
.print {
  color: black;
  margin-top: -100px;
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