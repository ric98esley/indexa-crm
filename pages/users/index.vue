<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="users.rows" stripe v-loading="loadingUser">
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
        <el-table-column label="Cedula" prop="cardId">
          <template #header>
            <el-input v-model="filters.cardId" placeholder="Cedula" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Padre" prop="email">
          <template #header>
            <el-input v-model="filters.email" placeholder="Email" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Activar">
          <template #default="{ row }">
            <el-switch v-model="row.isActive" class="ml-2" @change="(val) => (updateUserStatus({active: val, userId: row.id}))" />
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editUser(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeUser(props.row.id)">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="users.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nuevo grupo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="user"
            @submit.prevent="createUser()">
            <el-form-item label="Nombre">
              <el-input v-model="user.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Código">
              <el-input v-model="user.code" placeholder="Ingrese aqui el código"></el-input>
            </el-form-item>
            <el-form-item label="Padre">
              <el-select class="w-full" v-model="user.parentId" filterable remote placeholder="Elige un grupo padre"
                :loading="loadingParent" :remote-method="setParent">
                <el-option v-for="item in parents.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!user.name && !user.code" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar grupo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="user"
            @submit.prevent="patchUser()">
            <el-form-item label="Nombre">
              <el-input v-model="user.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Código">
              <el-input v-model="user.code" placeholder="Ingrese aqui el código"></el-input>
            </el-form-item>
            <el-form-item label="Padre">
              <el-select class="w-full" v-model="user.parentId" filterable remote placeholder="Elige un padre"
                :loading="loadingParent" :remote-method="setParent">
                <el-option v-for="item in parents.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!user.name && !user.code" native-type="submit">Editar</el-button>
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
import { useFetch } from 'nuxt/app';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
});

const loadingUser = ref(false);
const loadingParent = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  code: '',
  parentId: undefined,
  parent: ''
});

const users = reactive<{
  rows: User[],
  total: number
}>({
  rows: [],
  total: 0
});
const parents = reactive<{
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


const user = reactive<{
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

const updateUserStatus = async ({ active, userId }) => {
  try {
    let toSend = {
      isActive: active,
    };
    const { data, error } = await useFetch<User>(
      `/users/${userId}`,
      {
        method: 'patch',
        body: toSend
      }
    );
  } catch (error) {
    console.log(error);
  }
}


const getUsers = async ({
  id,
  name,
  code,
  parent,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  code?: string,
  parent?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingUser.value = true;
    const { data, error } = await useFetch<{ total: number, rows: User[] }>('/users',
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

    loadingUser.value = false;
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}
const getUser = async ({
  id,
  name,
  code,
  parent,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  code?: string,
  parent?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingUser.value = true;
    const { data, error } = await useFetch<{ total: number, rows: User[] }>('/users',
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

    loadingUser.value = false;
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const createUser = async () => {
  try {
    loadingUser.value = true;

    const { data, error } = await useFetch<User>('/assets/users',
      {
        method: 'post',
        body: {
          name: user.name,
          code: user.code,
          parentId: user.parentId,
          managerId: user.managerId
        }
      },
    )
    loadingUser.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear marcas intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setUsers()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data.value?.name}`
    })
    user.id = undefined;
    user.name = '';
    user.code = '';
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      title: 'Error al crear marcas intente de nuevo mas tarde',
    })
  }
}

const patchUser = async () => {
  try {
    loadingUser.value = true;

    const body = {
      name: user.name,
      code: user.code
    }

    const { data, error } = await useFetch<User>(`/users/${user.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingUser.value = false;


    if (error.value) {
      throw error
    }
    await setUsers()
    ElNotification({
      title: 'Categoria modificada correctamente',
      message: `${data.value?.name}`
    })

    user.id = undefined;
    user.name = '';
    user.code = '';
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      title: 'Error al modificar la categoria intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editUser = (row: User) => {
  modals.edit = true;
  user.id = row.id;
  user.name = row.name || '';
  user.code = row.code || '';
  user.parentId = row.parent.id;
  user.managerId = row.manager.id;
}

const removeUser = async (id: number) => {
  try {
    const { data, error } = await useFetch<User>(`/users/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingUser.value = false;
      ElNotification({
        message: 'Error al borrar la categoria intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La categoria ha sido borrada.'
    })
    await setUsers()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la categoria intente de nuevo mas tarde.'
    })
  }
}

const setUsers = async () => {
  const query = {
    name: filters.name,
    code: filters.code,
    limit: filters.limit,
    offset: filters.offset,
    parent: filters.parent
  }
  const rta = await getUsers(query);
  users.rows = rta?.rows || []
  users.total = rta?.total || 0
}

const setParent = async (query?: string) => {
  const search = {
    name: query,
    id: user.parentId
  }
  const rta = await getUsers(search);
  parents.rows = rta?.rows || []
  parents.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setUsers()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
    await setParent()
  } else {
    user.id = undefined;
    user.code = '';
    user.name = '';
    user.parentId = undefined;
    user.managerId = undefined;
  }
})

onMounted(async () => {
  await setUsers();
});
</script>