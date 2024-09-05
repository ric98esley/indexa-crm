<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['maintenances:create', 'maintenances:read']
});
const maintenances = reactive<{
  rows: Maintenance[],
  total: number
}>({
  rows: [],
  total: 0
})

const filters = reactive<FindMaintenance>({
  limit: 10,
  offset: 1,
  serial: '',
  description: '',
  startDate: '',
  endDate: ''
})

const modals = reactive({
  filters: false
})



const shortcuts = [
  {
    text: 'Hoy',
    value: new Date(),
  },
  {
    text: 'Ayer',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: 'Semana pasada',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: 'Mes pasado',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 30)
      return date
    },
  },
  {
    text: 'Trimestre pasado',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 90)
      return date
    },
  }
]

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
      <el-col class="mt-4">
        <h2 class="mb-4">Filtros</h2>
        <el-row>
          <el-form>
            <el-row>
              <el-form-item class="ml-4 w-10">
                <el-button @click="modals.filters = true" type="primary" circle class="">
                  <Icon name="ep:filter" />
                </el-button>
              </el-form-item>
              <el-form-item class="w-64 sm:w-auto ml-4">
                <el-date-picker v-model="filters.startDate" type="datetime" placeholder="Fecha de inicio"
                  format="YYYY/MM/DD" value-format="x" :shortcuts="shortcuts" />
              </el-form-item>
              <div class="ml-4 w-10 flex items-center sm:items-start sm:mt-1">
                <span class="ml-2">al</span>
              </div>
              <el-form-item class="w-64 sm:w-auto ml-4 sm:ml-0 sm:mr-4">
                <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite" format="YYYY/MM/DD"
                  value-format="x" />
              </el-form-item>
            </el-row>
          </el-form>
        </el-row>
      </el-col>
      <el-col>
        <MaintenanceTable :data="maintenances.rows" :total="maintenances.total" v-model:filters="filters"
          @refresh="getMaintenances" />
      </el-col>
    </el-row>
    <LeftButton @click="createModal = true" />
    <el-dialog v-model="createModal" destroy-on-close>
      <template #header>
        <h2>Crear mantenimiento</h2>
      </template>
      <MaintenanceForm @submit="create" />
    </el-dialog>
    <el-dialog v-model="modals.filters">
      <template #header>
        <h2 class="text-xl font-bold">Filtros</h2>
      </template>
      <el-form label-position="top">
        <el-col>
          <el-form-item label="Serial">
            <el-input v-model="filters.serial" placeholder="Serial" clearable />
          </el-form-item>
          <el-form-item label="Categoría">
            <el-input v-model="filters.category" placeholder="Categoría" clearable />
          </el-form-item>
          <el-form-item label="Marca">
            <el-input v-model="filters.brand" placeholder="Marca" clearable />
          </el-form-item>
          <el-form-item label="Modelo">
            <el-input v-model="filters.model" placeholder="Modelo" clearable />
          </el-form-item>
          <el-form-item label="Tipo">
            <el-input v-model="filters.type" placeholder="Tipo" clearable />
          </el-form-item>
          <el-form-item label="Fecha de inicio">
            <el-date-picker v-model="filters.startDate" type="datetime" placeholder="Fecha de inicio"
              format="YYYY/MM/DD" value-format="x" :shortcuts="shortcuts" />
          </el-form-item>
          <el-form-item label="Fecha limite">
            <el-date-picker v-model="filters.endDate" type="datetime" placeholder="Fecha limite" format="YYYY/MM/DD"
              value-format="x" />
          </el-form-item>
        </el-col>
        <el-row justify="end">
          <el-button type="primary" @click="modals.filters = false">Cerrar</el-button>
        </el-row>
      </el-form>
    </el-dialog>
  </el-container>
</template>