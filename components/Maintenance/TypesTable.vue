<script setup lang="ts">

const props = defineProps({
  data: {
    type: Array as PropType<MaintenanceType[]>,
    required: true
  },
  loading: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  filters: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({
      limit: 10,
      offset: 1,
      sort: 'createdAt',
      order: 'DESC',
      name: '',
      description: '',
      all: false,
    })
  },
  total: {
    type: Number as PropType<number>,
    default: 1
  }
})
const emit = defineEmits(['refresh'])

const editModal = ref(false)
const selectedRow = ref<MaintenanceType | undefined>(undefined)
const editHandler = (row: MaintenanceType) => {
  selectedRow.value = row; // Almacena los datos de la fila seleccionada
  editModal.value = true; // Muestra el diálogo
}

const editType = async (data: CreateMaintenanceType) => {
  if (!selectedRow.value) return
  const type = await useUpdateMaintenanceType(selectedRow.value.id, data)
  emit('refresh')
}

const deleteHandler = async (row: MaintenanceType) => {
  if (!row) return
  const type = await useDeleteMaintenanceType(row.id)
  emit('refresh')
}
</script>

<template>
  <el-col>
    <el-table :data="props.data">
      <el-table-column prop="index" type="index"></el-table-column>
      <el-table-column prop="name"></el-table-column>
      <el-table-column prop="description"></el-table-column>
      <el-table-column width="140">
        <template #default="{ row }">
          <el-row justify="space-around">
            <el-button type="info" @click="editHandler(row)" circle v-can="['maintenances:update']">
              <Icon name="ip:edit" />
            </el-button>
            <el-button type="danger" @click="deleteHandler(row)" circle v-can="['maintenances:delete']">
              <Icon name="ep:delete" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    <el-dialog v-model="editModal" destroy-on-close>
      <MaintenanceFormType :form="selectedRow" @submit="editType"/>
    </el-dialog>
  </el-col>
</template>