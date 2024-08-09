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

const emit = defineEmits(['refresh', 'update:filters'])

const filters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})

const editHandler = async (row: Maintenance) => {
  console.log(row)
}
const deleteHandler = async (row: Maintenance) => {
  console.log(row)
}
</script>

<template>
  <el-col>
    <el-table :data="props.data">
      <el-table-column prop="index" type="index"></el-table-column>
      <el-table-column prop="asset.serial" label="Serial" min-width="200">
        <template #header>
          <el-input v-model="filters.serial" placeholder="Buscar por serial" clearable/>
        </template>
        <template #default="{ row }">
          <NuxtLink class="text-blue-600" :to="`/assets/${row.asset.id}`">{{ row.asset.serial }} - {{ row.asset?.model?.category.name }} - {{
            row.asset?.model.brand.name }} - {{ row.asset.model.name }}</NuxtLink>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="Descripción" min-width="200">
        <template #header>
          <el-input v-model="filters.description" placeholder="Buscar por descripción" clearable/>
        </template>
      </el-table-column>
      <el-table-column prop="createdBy.username" label="Creado por" min-width="120">
        <template #header>
          <el-input v-model="filters.createdBy" placeholder="Buscar por usuario" clearable/>
        </template>
      </el-table-column>
      <el-table-column prop="maintenanceType.name" label="Tipo" min-width="120"></el-table-column>
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
            <el-button type="danger" @click="deleteHandler(row)" circle v-can="['maintenances:delete']">
              <Icon name="ep:delete" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
  </el-col>
</template>