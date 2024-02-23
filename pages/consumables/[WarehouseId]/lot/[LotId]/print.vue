<template>
  <el-container>
    <div id="print" class="print text-xs w-full">
      <el-col>
        <PrintHeader />
        <br />
        <el-row class="text-xs" justify="space-between">
          <el-col :span="24">
            <strong> Reporte de {{ response.type == 'checking' ? 'entrada' : 'salida' }}</strong>
            <br />
            Fecha de reporte: {{ new Date().toLocaleString() }} <br />
            Fecha de asignación: {{ new Date(response.createdAt || '').toLocaleString() }} <br />
            Impreso por <b>{{ user?.username }}</b>
          </el-col>
        </el-row>
        <br /><br />
        <table class="w-full table-print">
          <tr>
            <th></th>
            <th>Fecha</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Cantidad</th>
          </tr>
          <tr v-for="(movement, index) in response.movements" v-bind:key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ new Date(movement.createdAt!).toLocaleString() }}</td>
            <td>{{ movement.target?.product.code }}</td>
            <td>
              {{ movement.target?.product.name || '' }} -
              {{ movement.target?.product.category?.name || '' }}
            </td>
            <td>
              {{ movement.quantity || '' }} - {{ movement.target?.product.unit }}
            </td>
          </tr>
          <tr>
            <th colspan="4">
              <b>
                Cantidad de asignados: {{ response.movements.length }}
              </b>
            </th>
          </tr>
        </table>

        <table class="w-full table-print mt-10">
          <tr class="mt-5">
            <th><b>Nota</b></th>
          </tr>
          <tr class="mt-5">
            {{ response.description }}
          </tr>
        </table>
        <table class="w-full signs mt-10">

          <tr class="mt-5" v-if="response.type == 'checking'">
            <th>Firma quien entrega: {{ response.customer }}</th>
            <th>Firma quien recibe: {{ response.createdBy?.username }}</th>
          </tr>
          <tr class="mt-5" v-if="response.type == 'checkout'">
            <th>Firma quien recibe: {{ response.customer }}</th>
            <th>Firma quien entrega: {{ response.createdBy?.username }}</th>
          </tr>
        </table>
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
  permissions: ['consumables:read']
})

const auth = useAuthStore();

const ConsumableService = useConsumable()
const consumableService = new ConsumableService();

const user = auth.getUser;

const response = reactive<Lot>({
  customer: '',
  type: '',
  description: '',
  movements: [],
  createdBy: undefined,
  createdAt: ''
});

const setLot = async () => {
  const lot = await consumableService.getOneLot({
    warehouseId: route.params.WarehouseId.toString(),
    id: route.params.LotId.toString()
  });
  if (lot) {
    response.customer = lot.customer;
    response.type = lot.type;
    response.description = lot.description;
    response.movements = lot.movements;
    response.createdBy = lot.createdBy;
    response.createdAt = lot.createdAt
  }
}

onMounted(async () => {
  await setLot()
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
</style>
