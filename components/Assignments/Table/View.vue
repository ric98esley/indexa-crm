<script setup lang="ts">
const props = defineProps({
  assignments: {
    type: Array,
    default: []
  },
  loading: {
    type: Boolean,
    default: true
  },
  allowChecking: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 0,
      serial: '',
      category: '',
      brand: '',
      model: '',
      location: '',
      group: ''
    })
  }
})

const orderId = ref(0);
const minWidth = ref(150);


const modals = reactive({
  order: false,
  checking: false
});

const emit = defineEmits(['update:filters']);

const setOrder = async (id: number) => {
  try {
    modals.order = true;
    orderId.value = id;

  } catch (error) {
    console.log(error)
  }
}

const filters = computed({
  get() {
    return props.filters
  },
  set(value) {
    emit('update:filters', value)
  }
});


const movementStatus = ({
  row,
  rowIndex,
}: {
  row: Assignments,
  rowIndex: number
}) => {
  if (!row.current) {
    return 'info-row'
  }

  if (row.asset.deletedAt) {
    return 'danger-row'
  }

  return ''
}


</script>

<template>
  <el-row>
    <el-table :data="props.assignments" v-loading="loading" :row-class-name="movementStatus">
      <el-table-column type="index" width="50" />
      <el-table-column type="expand" width="50">
        <template #default="{ row }">
          realizado por: {{ row.createdBy.username }}
        </template>
      </el-table-column>
      <el-table-column label="Fecha" :min-width="minWidth">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="Serial" prop="asset.serial" :min-width="minWidth" sortable>
        <template #header>
          <div>
            <el-input v-model="filters.serial" placeholder="Serial" clearable />
          </div>
        </template>
        <template #default="{ row }">
          <Copy :text="row.asset?.serial" />
        </template>
      </el-table-column>
      <el-table-column label="Categoría" prop="asset.model.category.name" :min-width="minWidth" sortable>
        <template #header>
          <div>
            <el-input v-model="filters.category" placeholder="Categoría" clearable />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Marca" prop="asset.model.brand.name" :min-width="minWidth" sortable>
        <template #header>
          <div>
            <el-input v-model="filters.brand" placeholder="Marca" clearable />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Modelo" prop="asset.model.name" :min-width="minWidth" sortable>
        <template #header>
          <div>
            <el-input v-model="filters.model" placeholder="Modelo" clearable />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Agencia" prop="to.code" :min-width="minWidth" sortable>
        <template #header>
          <el-input v-model="filters.location" placeholder="Agencia" clearable />
        </template>
        <template #default="{ row }">
          {{ row.to?.code }}
          - {{ row.to?.name }}
        </template>
      </el-table-column>
      <el-table-column label="group" :min-width="minWidth" sortable prop="to.group.code" resizable class-name="break-words">
        <template #header>
          <el-input v-model="filters.group" placeholder="Grupo" clearable />
        </template>
        <template #default="{ row }">
          <p>
            <b>
              {{ row.to?.group.code }}
            </b>
            - {{ row.to?.group.name }}
          </p>
        </template>
      </el-table-column>
      <el-table-column width="120">
        <template #default="{ row }">
          <el-row>
            <el-button type="primary" circle @click="setOrder(row.order.id)">
              <Icon name="ep:view" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="props.total" />
    <el-container>
      <OrderTableView v-model:open="modals.order" :id="orderId" />
    </el-container>
  </el-row>
</template>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-5);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-5);
}

.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-5);
}

.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-5);
}

.cell {
  display: flex;
  align-items: center;
}
</style>