<script setup lang="ts">
const maintenances = reactive<{
  rows: Maintenance[],
  total: number
}>({
  rows: [],
  total: 0
})

const filters = reactive<FindMaintenance>({
  limit: 10,
  offset: 0,
  serial: '',
  description: '',
})

const createModal = ref(false)

const getMaintenances = async () => {
  try {
    const data = await useFindMaintenance(filters);

    if (!data) return;
    maintenances.rows = data.rows;
    maintenances.total = data.total;
  } catch (error) {
    console.error(error);
  }
}

const create = async (data: CreateMaintenance) => {
  const res = await useCreateMaintenance(data)
  await getMaintenances();
  createModal.value = false
}

onMounted(() => {
  getMaintenances();
})

watch(filters, () => {
  getMaintenances();
})

</script>

<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="12">
      <PageHeader name="Mantenimientos" />
      <el-col>
        <MaintenanceTable :data="maintenances.rows" :total="maintenances.total" v-model:filters="filters"/>
      </el-col>
    </el-row>
    <LeftButton @click="createModal = true" />
    <el-dialog v-model="createModal" destroy-on-close>
      <template #header>
        <h2>Crear mantenimiento</h2>
      </template>
      <MaintenanceForm @submit="create" />
    </el-dialog>
  </el-container>
</template>