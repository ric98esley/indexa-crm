<script setup lang="ts">
const MovementServices = useMovements();
const movementsServices = new MovementServices();

const props = defineProps({
  total: {
    type: Number,
    default: () => 0
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
  },
  orderType: {
    type: String
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 1,
      startDate: '',
      endDate: ''
    })
  }
});


const emit = defineEmits(['update:filters']);

const placeId = ref(0);
const loadingAssignments = ref(false);

const filtersByLocation = computed({
  get() {
    return props.filters
  },
  set(value) {
    emit('update:filters', value)
  }
});

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
  startDate: filtersByLocation.value.startDate,
  endDate: filtersByLocation.value.endDate,
  sort: 'createdAt',
  order: 'DESC',
});



const movements = reactive<{
  total: number, rows: Assignments[]
}>({
  total: 0,
  rows: []
});

const modals = reactive({
  place: false,
});

const setPlace = (row: LocationMovementCount) => {
  placeId.value = row.id;
  filters.location = row.code;
  modals.place = true;
};

const print = () => {
  return navigateTo(
    {
      path: `/places/${placeId.value}/print`,
      query: {
        total: movements.total,
        ...filters,
        orderType: props.orderType,
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


const setAssignments = async () => {
  try {
    if (filters.endDate < filters.startDate) {
      throw new Error('La fecha de inicio no puede ser mayor a la fecha limite')
    }
    loadingAssignments.value = true;

    const orderType = props.orderType;

    const res = await movementsServices.getMovements({ ...filters, orderType });
    loadingAssignments.value = false;

    movements.total = res?.value?.total || 0;
    movements.rows = res?.value?.rows || []
  } catch (error) {
    loadingAssignments.value = false;
    ElNotification({
      title: 'Error',
      message: error.message,
      type: 'error'
    })
  }
}

watch(filters, useDebounce(async () => {
  await setAssignments()
}, 500
));

</script>
<template>
  <el-col>
    <el-table :data="props.data" v-loading="loading">
      <el-table-column label="Código" prop="code" />
      <el-table-column label="Agencia" prop="name" />
      <el-table-column label="Grupo" prop="group.name" />
      <el-table-column label="Código de grupo" prop="group.code" />
      <el-table-column label="Total" prop="total" />
      <el-table-column label="Acciones" width="120">
        <template #default="{ row }">
          <el-row>
            <el-button type="primary" circle @click="setPlace(row)">
              <Icon name="ep:view" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:limit="filtersByLocation.limit" v-model:offset="filtersByLocation.offset" :total="props.total" />
    <el-dialog v-model="modals.place">
      <template #header>
        <el-row justify="space-between">
          Agencia
          <el-button @click="print()" type="primary">Imprimir</el-button>
        </el-row>
      </template>
      <AssignmentsTableView :assignments="movements.rows" v-model:limit="filters.limit" v-model:filters="filters"
        :total="movements.total" :loading="loadingAssignments" />
    </el-dialog>
  </el-col>
</template>