<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['maintenances:read', 'maintenances:create']
});

const types = reactive<{
  rows: MaintenanceType[],
  total: number
}>({
  rows: [],
  total: 0
})

const filters = reactive({
  limit: 10,
  offset: 1,
  search: ''
})

const createModal = ref(false)

const getTypes = async () => {
  try {
    const data = await useFindMaintenanceType();

    if (!data) return;

    types.rows = data.rows;
    types.total = data.total;
  } catch (error) {
    console.error(error);
  }
}

const createType = async (data: CreateMaintenanceType) => {
  const type = await useCreateMaintenanceType(data)
  await getTypes();
  createModal.value = false
}

onMounted(() => {
  getTypes();
})

</script>

<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="12">
      <PageHeader name="Mantenimientos" />
      <el-col>
        <MaintenanceTypesTable :data="types.rows" :total="types.total" @refresh="getTypes"/>
      </el-col>
    </el-row>
    <LeftButton @click="createModal = true"/>
    <el-dialog v-model="createModal" destroy-on-close>
      <MaintenanceFormType @submit="createType"/>
    </el-dialog>
  </el-container>
</template>