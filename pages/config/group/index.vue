<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="groups.rows" stripe v-loading="loadingGroup">
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
        <el-table-column prop="name" label="Nombre">
          <template #header>
            <el-input v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Codigo" prop="code">
          <template #header>
            <el-input v-model="filters.code" placeholder="Código" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Padre">
          <template #header>
            <el-input v-model="filters.parent" placeholder="Padre" clearable />
          </template>
          <template #default="{ row }">
            {{ row?.parent?.code }} - {{ row?.parent?.name }}
          </template>
        </el-table-column>
        <el-table-column label="Receptor">
          <template #header>
            <el-input v-model="filters.manager" placeholder="Receptor" clearable />
          </template>
          <template #default="{ row }">
            {{ row.manager?.username }} - {{ row?.manager?.name }} {{ row?.manager?.lastName }}
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editGroup(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeGroup(props.row.id)">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="groups.total" />
    </el-row>
    <el-container>
      <!-- crear grupo -->
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nuevo grupo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="group"
            @submit.prevent="createGroup()">
            <el-form-item label="Nombre">
              <el-input v-model="group.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Código">
              <el-input v-model="group.code" placeholder="Ingrese aqui el código"></el-input>
            </el-form-item>
            <el-form-item label="Padre">
              <el-select class="w-full" v-model="group.parentId" filterable remote effect="dark"
                placeholder="Elige un grupo padre" :loading="loadingParent" :remote-method="setParent">
                <el-option v-for="item in parents.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Receptor">
              <el-select class="w-full" v-model="group.managerId" filterable remote effect="dark"
                placeholder="Elige un receptor" :loading="loadingUser" :remote-method="setUser">
                <el-option v-for="item in users.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }} {{ item.lastName }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.username }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!group.name && !group.code" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <!-- editar grupo -->
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar grupo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="group"
            @submit.prevent="patchGroup()">
            <el-form-item label="Nombre">
              <el-input v-model="group.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Código">
              <el-input v-model="group.code" placeholder="Ingrese aqui el código"></el-input>
            </el-form-item>
            <el-form-item label="Padre">
              <el-select class="w-full" v-model="group.parentId" filterable remote effect="dark"
                placeholder="Elige un padre" :loading="loadingParent" :remote-method="setParent">
                <el-option v-for="item in parents.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Receptor">
              <el-select class="w-full" v-model="group.managerId" filterable remote effect="dark"
                placeholder="Elige un receptor" :loading="loadingUser" :remote-method="setUser">
                <el-option v-for="item in users.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }} {{ item.lastName }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.username }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!group.name && !group.code" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
    <el-row justify="end" :span="24">
      <div
        class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
        @click="modals.create = true">
        <Icon name="ep:plus" size="2rem" color="white" />
      </div>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const loadingGroup = ref(false);
const loadingParent = ref(false);
const loadingUser = ref(false);

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
const parents = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
})
const users = reactive<{
  rows: User[],
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


const group = reactive<{
  id?: number,
  name: string,
  code: string,
  parentId?: number,
  managerId?: number,
}>({
  id: undefined,
  name: '',
  code: '',
  parentId: undefined,
  managerId: undefined
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
const getUser = async ({
  search,
  limit = 10,
  offset = 0
}: {
  search?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingUser.value = true;
    const { data, error } = await useFetch<{ total: number, rows: User[] }>('/users',
      {
        params: {
          ...(search != '' && search && {
            search
          }),
          role: 'receptor',
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
      throw new Error()
    }

    loadingUser.value = false;
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      title: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const createGroup = async () => {
  try {
    loadingGroup.value = true;

    const { data, error } = await useFetch<Group>('/groups',
      {
        method: 'post',
        body: {
          name: group.name,
          code: group.code,
          parentId: group.parentId,
          managerId: group.managerId
        }
      },
    )
    loadingGroup.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear marcas intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setGroups()
    ElNotification({
      title: 'Grupo creado correctamente',
      message: `${data.value?.name}`
    })
    group.id = undefined;
    group.name = '';
    group.code = '';
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      title: 'Error al crear marcas intente de nuevo mas tarde',
    })
  }
}

const patchGroup = async () => {
  try {
    loadingGroup.value = true;

    const body = {
      name: group.name,
      code: group.code,
      parentId: group.parentId,
      managerId: group.managerId
    }

    const { data, error } = await useFetch<Group>(`/groups/${group.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingGroup.value = false;


    if (error.value) {
      throw error
    }
    await setGroups()
    ElNotification({
      title: 'Grupo modificado correctamente',
      message: `${data.value?.name}`
    })

    group.id = undefined;
    group.name = '';
    group.code = '';
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      title: 'Error al modificar el grupo intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editGroup = (row: Group) => {
  modals.edit = true;
  group.id = row.id;
  group.name = row.name || '';
  group.code = row.code || '';
  group.parentId = row.parent?.id;
  group.managerId = row.manager?.id;
  if(row.parent) {
    parents.rows = []
    parents.rows.push(row.parent)
  };
  if(row.manager) {
    users.rows = []
    users.rows.push(row.manager)
  }
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

const setUser = async (query?: string) => {
  const search = {
    search: query
  }
  const rta = await getUser(search);
  users.rows = rta?.rows || []
  users.total = rta?.total || 0
}
const setParent = async (query?: string) => {
  const search = {
    name: query,
    id: group.parentId
  }
  const rta = await getGroups(search);
  parents.rows = rta?.rows || []
  parents.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setGroups()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
  } else {
    group.id = undefined;
    group.code = '';
    group.name = '';
    group.parentId = undefined;
    group.managerId = undefined;
  }
})

onMounted(async () => {
  await setGroups();
});
</script>