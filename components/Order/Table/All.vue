<script setup lang="ts">

const route = useRoute();

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 1,
      location: '',
      sort: 'createdAt',
      order: 'DESC',
      type: '',
      notes: '',
      description: '',
    })
  },
  total: {
    type: Number,
    default: () => 0
  }
})

const emit = defineEmits([
  'refresh',
  'update:filters'
])

const checkType: { value: string, label: string }[] = [
  {
    value: '',
    label: 'Todos'
  },
  {
    value: 'sale',
    label: 'Venta'
  },
  {
    value: 'purchase',
    label: 'Compra'
  },
  {
    value: 'checking',
    label: 'Entrada',
  },
  {
    value: 'warranty',
    label: 'Garantía',
  },
  {
    value: 'request',
    label: 'Solicitud'
  },
  {
    value: 'borrowing',
    label: 'Préstamo'
  },
]

const orderId = ref(0);

const modals = reactive({
  order: false,
  checking: false
});

const enumOrderType: { [key: string]: string } = {
  checking: 'Entrada',
  checkout: 'Salida'
}

const enumOrderDescription: { [key: string]: string } = {
  sale: 'Venta',
  warranty: 'Garantía',
  purchase: 'Compra',
  request: 'Solicitud',
  borrowing: 'Préstamo',
  checking: 'Entrada'
}

const filters = computed({
  get() {
    return props.filters
  },
  set(value) {
    emit('update:filters', value)
  }
})

const setOrder = async (id: number) => {
  try {
    modals.order = true;
    orderId.value = id;

  } catch (error) {
    console.log(error)
  }
}

</script>

<template>
  <el-col>
    <el-table :data="props.data" v-loading="props.loading">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column type="expand" width="50">
        <template #default="{ row }">
          {{ row.content }}
        </template>
      </el-table-column>
      <el-table-column label="Tipo" prop="type">
        <template #default="{ row }">
          {{ enumOrderType[row.type] }}
        </template>
      </el-table-column>
      <el-table-column label="Descripción" prop="type">
        <template #header>
          <el-select v-model="filters.description" class="w-full" clearable>
            <el-option v-for="item in checkType" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
        <template #default="{ row }">
          {{ enumOrderDescription[row.description] }}
        </template>
      </el-table-column>
      <el-table-column label="Notas" prop="notes">
        <template #header>
          <el-input v-model="filters.notes" placeholder="Nota" clearable />
        </template>
      </el-table-column>
      <el-table-column label="Total" width="100" prop="count">

      </el-table-column>
      <el-table-column v-if="route.query.type == 'checkout'" label="Agencia" width="180" prop="count">
        <template #header>
          <el-input v-model="filters.location" placeholder="Lugar" clearable />
        </template>
        <template #default="{ row }">
          <p>
            <b>
              {{ row?.location?.code }}
            </b>
            - {{ row?.location?.name }}
          </p>
        </template>
      </el-table-column>
      <el-table-column width="120">
        <template #default="{ row }">
          <el-row>
            <el-button type="primary" circle @click="setOrder(row.id)">
              <Icon name="ep:view" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    <el-container>
      <OrderTableView v-model:open="modals.order" :id="orderId" />
    </el-container>
  </el-col>
</template>