<script lang="ts" setup>
const props = defineProps({
  data: {
    type: Array as PropType<Maintenance[]>,
    required: true
  },
  total: {
    type: Number as PropType<number>,
    required: true
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 1,
      sort: 'createdAt',
      order: 'DESC',
      description: '',
      all: false
    })
  },
  loading: {
    type: Boolean as PropType<boolean>,
    default: false
  }
})

const toEdit = ref<CreateMaintenance | undefined>()
const idToEdit = ref<number>()
const editModal = ref(false)

const emit = defineEmits(['refresh', 'update:filters', 'refresh'])

const filters = computed({
  get: () => props.filters,
  set: (value) => {
    emit('update:filters', value)
    emit('refresh', value)
  }
})

const editHandler = async (row: Maintenance) => {
  toEdit.value = {
    description: row.description,
    maintenanceTypeId: row.maintenanceType.id,
    assetId: row.asset.id,
  }
  idToEdit.value = row.id
  editModal.value = true
}

const updateMaintenance = async (data: CreateMaintenance) => {
  if (!idToEdit.value) return
  const res = await useUpdateMaintenance(idToEdit.value, data)
  emit('refresh')
}
</script>

<template>
  <el-col>
    <el-table :data="props.data">
      <el-table-column prop="index" type="index"></el-table-column>
      <el-table-column prop="asset.serial" label="Serial" min-width="200">
        <template #header>
          <el-input v-model="filters.serial" placeholder="Buscar por serial" clearable />
        </template>
        <template #default="{ row }">
          <NuxtLink class="text-blue-600" :to="`/assets/${row.asset.id}`">{{ row.asset.serial }} - {{
            row.asset?.model?.category.name }} - {{
              row.asset?.model.brand.name }} - {{ row.asset.model.name }}</NuxtLink>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="Descripción" min-width="200">
        <template #header>
          <el-input v-model="filters.description" placeholder="Buscar por descripción" clearable />
        </template>
      </el-table-column>
      <el-table-column prop="createdBy.username" label="Creado por" min-width="120">
        <template #header>
          <el-input v-model="filters.createdBy" placeholder="Usuario" clearable />
        </template>
      </el-table-column>
      <el-table-column prop="maintenanceType.name" label="Tipo" min-width="120">
        <template #header>
          <el-input v-model="filters.type" placeholder="Tipo" clearable />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="Fecha" min-width="120">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column width="100">
        <template #default="{ row }">
          <el-row justify="space-around">
            <el-button type="info" @click="editHandler(row)" circle v-can="['maintenances:update']">
              <Icon name="ep:edit" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    <el-dialog v-model="editModal" destroy-on-close>
      <template #header>
        <h2>Editar mantenimiento</h2>
      </template>
      <MaintenanceForm :form="toEdit" @submit="updateMaintenance" :show-asset="false" />
    </el-dialog>
  </el-col>
</template>