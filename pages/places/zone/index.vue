<template>
  <el-container direction="vertical" class="p-3">
    <PageHeader name="Zonas"></PageHeader>
    <el-row :span="24" :gutter="12">
      <el-table :data="response.rows" stripe v-loading="loadingZone">
        <el-table-column type="expand" width="50">
          <template #default="props">
            <el-row :span="24" :gutter="24">
              <el-col :span="22" :offset="2">
                Creado por: {{ props.row.createdBy.name }} {{ props.row.createdBy.lastName }}
              </el-col>
              <el-col :span="22" :offset="2">
                Fecha de creación: {{ new Date(props.row.createdAt).toLocaleString('es-VE') }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="Nombre" min-width="150">
          <template #header>
            <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="150">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editZone(props.row)" v-can="['zones:delete']">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeZone(props.row.id)" v-can="['zones:read']">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="response.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nueva tipo</h2>
        </template>
        <template #default>
          <ZoneFormSave @submit="setZones" v-model:id="zone.id" v-model:name="zone.name" />
        </template>
      </el-dialog>
    </el-container>
    <LeftButton @click="modals.create = true"  v-can="['zones:read']"/>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['zones:read', 'zones:update', 'zones:delete', 'zones:create']
});

const loadingZone = ref(false);

const ZoneServices = useZones();
const zoneServices = new ZoneServices();

const filters = reactive({
  limit: 10,
  offset: 0,
  name: ''
});

const response = reactive<{
  rows: Zone[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  create: false,
});

const zone = reactive<{
  id?: number,
  name: string
}>({
  id: undefined,
  name: ''
});

const editZone = (row: Zone) => {
  modals.create = true;
  zone.id = row.id;
  zone.name = row.name || '';
}

const setZones = async () => {
  loadingZone.value = true;
  const rta = await zoneServices.getZones({
    name: filters.name,
    offset: (filters.offset - 1) * filters.limit,
    limit: filters.limit
  })
  loadingZone.value = false;
  response.rows = rta?.rows || []
  response.total = rta?.total || 0
}

const removeZone = async (id: number) => {
  await zoneServices.removeZone(id)
  setZones()
}

watch(filters, useDebounce(async () => {
  await setZones()
}, 500)
)

watch(() => modals.create, async () => {
  if (modals.create) {
  } else {
    zone.id = undefined;
    zone.name = '';
  }
})

onMounted(async () => {
  await setZones();
});
</script>