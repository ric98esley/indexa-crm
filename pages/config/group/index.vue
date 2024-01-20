<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader name="Grupos" />
      <el-col :span="24" :gutter="12">
        <el-table :data="groups.rows" stripe v-loading="loadingGroup">
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <el-row :span="24" :gutter="24">
                <el-col :span="22" :offset="2">
                  Creado por: {{ row.createdBy.name }} {{ row.createdBy.email }}
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
          <el-table-column label="Padre" min-width="120">
            <template #header>
              <el-input v-model="filters.parent" placeholder="Padre" clearable />
            </template>
            <template #default="{ row }">
              {{ row?.parent?.code }} - {{ row?.parent?.name }}
            </template>
          </el-table-column>
          <el-table-column label="Receptor" min-width="120">
            <template #header>
              <el-input v-model="filters.manager" placeholder="Receptor" clearable />
            </template>
            <template #default="{ row }">
              {{ row.manager?.username }} - {{ row?.manager?.profile?.name }} {{ row?.manager?.profile?.lastName }}
            </template>
          </el-table-column>
          <el-table-column label="Acciones" width="180">
            <template #default="props">
              <el-row justify="space-around">
                <el-button type="info" circle @click="editGroup(props.row)">
                  <Icon name="ep:edit" />
                </el-button>
                <NuxtLink :to="`/config/group/${props.row.id}`">
                  <el-button type="primary" circle>
                    <Icon name="ep:view" />
                  </el-button>
                </NuxtLink>
                <el-button type="danger" circle @click="removeGroup(props.row.id)">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="groups.total" />
      </el-col>
      <el-container>
        <!-- crear grupo -->
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear nuevo grupo</h2>
          </template>
          <template #default>
            <GroupFormSave @on-submit="submitHandler"/>
          </template>
        </el-dialog>
        <el-dialog v-model="modals.edit">
          <template #header>
            <h2>Editar grupo</h2>
          </template>
          <template #default>
            <GroupFormSave :id="groupToEdit" @on-submit="submitHandler"/>
          </template>
        </el-dialog>
      </el-container>
      <el-col justify="end" :span="24" v-can="['groups:create']">
        <div
          class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
          @click="modals.create = true">
          <Icon name="ep:plus" size="2rem" color="white" />
        </div>
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

const groupToEdit = ref<number | undefined>(undefined);

const loadingGroup = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  manager: '',
  code: '',
  parentId: undefined,
  parent: ''
});

const groups = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
  menu: false
});

const getGroups = async ({
  id,
  name,
  manager,
  code,
  parent,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  manager?: string,
  code?: string,
  parent?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
      {
        params: {
          ...(name != '' && !name && id && {
            id
          }),
          ...(name != '' && name && {
            name
          }),
          ...(code != '' && code && {
            code
          }),
          ...(parent != '' && parent && {
            parent
          }),
          ...(manager != '' && manager && {
            manager
          }),
          ...(offset && {
            offset: (offset - 1) * limit
          }),
          ...(limit && {
            limit
          })
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingGroup.value = false;
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}
const editGroup = (row: Group) => {
  modals.edit = true;
  groupToEdit.value = row.id;
}

const removeGroup = async (id: number) => {
  try {
    const { data, error } = await useFetch<Group>(`/groups/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingGroup.value = false;
      ElNotification({
        message: 'Error al borrar el grupo intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'El grupo ha sido borrada.'
    })
    await setGroups()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar el grupo intente de nuevo mas tarde.'
    })
  }
}

const submitHandler = async () => {
  await setGroups()
  groupToEdit.value = 0;
}

const setGroups = async () => {
  const query = {
    name: filters.name,
    code: filters.code,
    limit: filters.limit,
    offset: filters.offset,
    parent: filters.parent,
    manager: filters.manager
  }
  const rta = await getGroups(query);
  groups.rows = rta?.rows || []
  groups.total = rta?.total || 0
}


watch(filters, useDebounce(async () => {
  await setGroups()
}, 500)
)


onMounted(async () => {
  await setGroups();
});
</script>