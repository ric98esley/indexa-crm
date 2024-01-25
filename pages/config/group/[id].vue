<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader>
        <template #title>
          Grupo <el-tag>{{ group.code }}</el-tag> {{ group.name }}
        </template>
      </PageHeader>
      <el-col :span="24" class="mt-4">
        <GroupDescription :group="group" />
      </el-col>
      <el-col>
        <h2 class="m-4">Lugares del grupo</h2>
        <el-row>
          <el-table :data="places.rows" stripe v-loading="loadingPlaces">
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
            <el-table-column label="Grupo" prop="group.name" min-width="120">
              <template #header>
                <el-input v-model="filters.group" placeholder="Grupo" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Acciones" width="120">
              <template #default="{ row }">
                <el-row justify="space-around">
                  <el-button type="info" circle @click="editPlace(row)" v-can="['locations:update']">
                    <Icon name="ep:edit" />
                  </el-button>
                  <NuxtLink :href="`/places/${row.id}`">
                    <el-button type="primary" circle>
                      <Icon name="ep:view" />
                    </el-button>
                  </NuxtLink>
                  <el-button type="danger" circle @click="removePlace(row.id)" v-can="['locations:update']">
                    <Icon name="ep:delete" />
                  </el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['groups:read', 'groups:update', 'groups:delete', 'groups:create'],
});

const route = useRoute();

const GroupService = useGroups();
const groupService = new GroupService();

const placeToEdit = ref<number>(0)

const group = reactive<{
  name: string,
  manager?: Profile,
  code: string,
  parent?: Group,
  parentId: number | undefined,
  isActive: boolean
}>({
  name: '',
  manager: undefined,
  code: '',
  parent: undefined,
  parentId: undefined,
  isActive: false
});

const modals = reactive({
  create: false
})

const filters = reactive({
  limit: 10,
  offset: 1,
  code: '',
  group: '',
  name: '',
  address: '',
  email: '',
});

const places = reactive<{
  rows: Place[],
  total: number
}>({
  rows: [],
  total: 0
})

const loadingGroup = ref(false);
const loadingPlaces = ref(false);

const editPlace = (row: Place) => {
  modals.create = true;
  placeToEdit.value = row.id || 0;
};

const setGroup = async () => {
  try {
    if (!route.params.id) return;
    const res = await groupService.getGroup(route.params.id.toString());
    if (!res) return;
    group.name = res.name || '';
    group.manager = res.manager || undefined;
    group.code = res.code;
    group.parent = res.parent;
    group.parentId = res.parentId;
  } catch (error) {

  }
}

const setLocationsByGroup = async () => {
  try {
    const id = route.params.id.toString();
    const locations = await groupService.getGroupLocation(id)

    places.rows = locations?.rows || [];
    places.total = locations?.total || 0;
  } catch (error) {
    
  }
}


onMounted(async () => {
  await setGroup();
  await setLocationsByGroup();
})



</script>