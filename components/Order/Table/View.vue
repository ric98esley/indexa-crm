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

const filters = reactive<{
  paranoid: boolean,
  all: boolean,
  current: boolean,
  location: string,
  group: string,
  serial: string,
  category: string,
  model: string,
  brand: string,
  limit: number,
  offset: number,
  sort: string,
  order: string,
  type: string,
  startDate: string,
  endDate: string,
}>({
  paranoid: false,
  all: true,
  current: true,
  location: '',
  group: '',
  serial: '',
  category: '',
  model: '',
  brand: '',
  type: '',
  limit: 10,
  offset: 1,
  startDate: '',
  endDate: '',
  sort: 'createdAt',
  order: 'DESC',
})

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

const setOrder = async () => {
  if (!props.id) throw new Error('Se debe proporcionar un id');
  const data = await orderService.getOrder({ id: Number(props.id) });

  if (data?.value) {
    order.data = data?.value;
  }
}

const getMovementsOrder = async () => {
  const movement = await orderService.getOrderMovements({ id: Number(props.id), ...filters })
  if (movement?.value) {
    order.assignments = movement.value.rows || [];
    order.total = movement.value.total || 0;
  }

}

const print = (total: number, id?: number, type?: string) => {
  if (!id) return
  if (type == 'order') {
    return navigateTo(
      {
        path: `/assignments/${id}/print`,
        query: {
          ...filters,
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
}

watch(() => props.id, async () => {
  try {
    loadingAssignments.value = true;

    await setOrder();
    await getMovementsOrder()

  } catch (error) {
    console.log(error)
  } finally {
    loadingAssignments.value = false
  }
})

watch(filters, async () => {
  try {
    loadingAssignments.value = true;

    await getMovementsOrder()

  } catch (error) {
    console.log(error)
  } finally {
    loadingAssignments.value = false
  }
} )
</script>
<template>
  <el-dialog v-model="orderModal">
    <template #header>
      <el-row justify="space-between">
        {{ order.data.type == 'checking' ? 'Entrada' : 'Salida' }} Orden {{ order.data?.id }} tipo: {{
          enumOrderDescription[order.data.description] ?? '' }}
        <el-button class="mx-4" @click="print(order.total, props.id, 'order')" type="primary">Imprimir</el-button>
      </el-row>
    </template>
    <AssignmentsTableView :assignments="order.assignments" v-model:limit="filters.limit" v-model:filters="filters"
      :total="order.total" :loading="loadingAssignments" />
  </el-dialog>
</template>