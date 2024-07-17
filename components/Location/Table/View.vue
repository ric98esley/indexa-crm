<script setup lang="ts">

const props = defineProps({
  locations: {
    type: Array,
    default: []
  },
  redirect: {
    type: String,
    default: 'places'
  },
  loading: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 1,
      code: '',
      group: '',
      manager: '',
      name: '',
      address: '',
      email: '',
    })
  }
});

const LocationsServices = useLocation();
const locationsServices = new LocationsServices();

const modals = reactive({
  edit: false
})

const placeId = ref(0);

const emit = defineEmits(['update:filters', 'refresh',]);

const setPlace = async (id: number) => {
  try {
    modals.edit = true;
    placeId.value = id;
  } catch (error) {
    console.log(error)
  }
}

const removePlace = async (id: number) => {
  try {
    await locationsServices.removePlace(id);
  } catch (error) {
    console.log(error);
  } finally {
    emit('refresh')
  }
}

const filters = computed({
  get() {
    return props.filters
  },
  set(value) {
    emit('update:filters', value)
  }
})
</script>

<template>
  <el-container>
    <el-col>
      <el-table :data="props.locations" stripe v-loading="props.loading">
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <el-row :span="24" :gutter="24">
              <el-col :span="22" :offset="2">
                Creado por: {{ row.createdBy.username }}
              </el-col>
              <el-col :span="22" :offset="2">
                Fecha de creación: {{ new Date(row.createdAt).toLocaleString('es-VE') }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="Nombre" min-width="120">
          <template #header>
            <el-input v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Código" prop="code" min-width="120">
          <template #header>
            <el-input v-model="filters.code" placeholder="Código" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Grupo" prop="group.code" min-width="120">
          <template #header>
            <el-input v-model="filters.group" placeholder="Grupo" clearable />
          </template>
          <template #default="{ row }">
            {{ row.group.code }} - {{ row.group.name }}
          </template>
        </el-table-column>
        <el-table-column label="Responsable" min-width="120">
          <template #header>
            <el-input v-model="filters.manager" placeholder="Responsable" clearable />
          </template>
          <template #default="{ row }">
            {{ row.manager?.name }} {{ row.manager?.lastName }}
          </template>
        </el-table-column>
        <el-table-column label="Zona" min-width="120">
          <template #header>
            <el-input v-model="filters.zone" placeholder="Zona" clearable />
          </template>
          <template #default="{ row }">
            <el-row>
              <el-col :span="24">
                <Icon name="ep:location" />
                {{ row.zone.name }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="150">
          <template #default="{ row }">
            <el-row justify="space-around">
              <el-button type="info" circle @click="setPlace(row.id)" v-can="['locations:update']">
                <Icon name="ep:edit" />
              </el-button>
              <NuxtLink :href="`/${props.redirect}/${row.id}`">
                <el-button type="primary" circle>
                  <Icon name="ep:view" />
                </el-button>
              </NuxtLink>
              <el-button type="danger" circle @click="removePlace(row.id)" v-can="['locations:delete']">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="props.total" />
    </el-col>
    <el-container>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar agencia</h2>
        </template>
        <template #default>
          <LocationFormSave @submit="emit('refresh')" :id="placeId" />
        </template>
      </el-dialog>
    </el-container>
  </el-container>
</template>