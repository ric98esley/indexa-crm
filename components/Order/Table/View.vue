<script setup lang="ts">
const OrderService = useOrders();
const orderService = new OrderService();
const enumOrderDescription = {
  sale: 'Venta',
  warranty: 'Garantía',
  purchase: 'Compra',
  request: 'Solicitud',
  borrowing: 'Préstamo',
  checking: 'Entrada'
}
const loadingAssignments = ref(true)

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number
  }
});

const emit = defineEmits(['update:open'])

const orderModal = computed(
  {
    get() {
      return props.open
    },
    set(open) {
      emit('update:open', open)
    }
  }
)

const order = reactive<{
  data: Order,
  assignments: Assignments[],
  total: number
}>(
  {
    data: {
      type: '',
      delivered: false,
      closed: false,
      description: '',
      count: 0
    },
    assignments: [],
    total: 0
  }
)

const setOrder = async ()  => {
  try {
    loadingAssignments.value = true;
    if(!props.id) throw new Error('Se debe proporcionar un id');
    const data = await orderService.getOrder({ id: Number(props.id) });

    if(data?.value) {
      order.data = data?.value;
    }

    const assignments = await orderService.getOrderMovements({ id: Number(props.id) })

    if(assignments?.value){
      order.assignments = assignments.value.rows || [];
      order.total = assignments.value.total || 0;
    }

    loadingAssignments.value = false
  } catch (error) {
    loadingAssignments.value = false
  }
}

const print = (total: number, id?: number, type?: string) => {
  if (!id) return
  if (type == 'order') {
    return navigateTo(
      {
        path: `/assignments/${id}/print`,
        query: {
          total: total,
        }
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
  }
  // if (type == 'place') {
  //   return navigateTo(
  //     {
  //       path: `/places/${id}/print`,
  //       query: {
  //         total: total,
  //         type: route.query.type,
  //         startDate: dateFilter.date[0],
  //         endDate: dateFilter.date[1],
  //         all: 'true'
  //       }
  //     },
  //     {
  //       open: {
  //         target: '_blank',
  //         windowFeatures: {
  //           popup: true,
  //           noopener: true,
  //           noreferrer: true,
  //         }
  //       }
  //     })
  // }
}

watch(() => props.id , async () => {
  await setOrder()
})
</script>
<template>
  <el-dialog v-model="orderModal">
    <template #header>
      <el-row justify="space-between">
        {{ order.data.type == 'checking'? 'Entrada': 'Salida' }} Orden {{ order.data?.id }} tipo: {{ enumOrderDescription[order.data.description] ?? ''}}
        <el-button class="mx-4" @click="print(order.total, props.id, 'order')" type="primary">Imprimir</el-button>
      </el-row>
    </template>
    <el-table :data="order.assignments" v-loading="loadingAssignments">
      <el-table-column type="index" width="50" label="id"></el-table-column>
      <el-table-column label="serial" prop="asset.serial">
      </el-table-column>
      <el-table-column label="Descripción">
        <template #default="{ row }">
          {{ row.asset?.model.category.name }} - {{ row.asset.model.name }} - {{ row.asset.model.brand.name }}
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>