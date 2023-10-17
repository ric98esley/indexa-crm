<template>
  <el-container class="p-4">
    <el-row :gutter="10">
      <el-col :span="24">
        <el-row>
          <el-page-header @back="onBack" class="w-full">
            <template #content>
              <div class="flex items-center">
                <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                  Usuario
                </span>
              </div>
            </template>
            <template #extra>
              <div class="flex items-center">
                <el-button type="primary" class="ml-2">Exportar a excel</el-button>
              </div>
            </template>
          </el-page-header>
        </el-row>
      </el-col>
      <el-col :span="24">
        <el-row>
          <el-table :data="users.rows" v-loading="loadingUser">
            <el-table-column type="index" width="50" />
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
            <el-table-column prop="name" label="Nombre" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.name" placeholder="Nombre" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Cédula" prop="cardId" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.cardId" placeholder="Cédula" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Rol" prop="role" v-role="['superuser', 'auditor']" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.role" placeholder="Rol" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Grupo" prop="group.name" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.group" placeholder="Grupo" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Activar" :min-width="minWidth">
              <template #default="{ row }">
                <el-switch v-model="row.isActive" class="ml-2"
                  @change="(val) => (updateUserStatus({ active: val || false, userId: row.id }))" />
              </template>
            </el-table-column>
            <el-table-column label="Acciones" :min-width="minWidth * 1.5">
              <template #default="props">
                <el-row>
                  <el-button type="info" circle @click="editUser(props.row)">
                    <Icon name="ep:edit" />
                  </el-button>
                  <el-button type="danger" circle @click="removeUser(props.row.id)">
                    <Icon name="ep:delete" />
                  </el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
            :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
            layout="total, sizes, prev, pager, next, jumper" :total="users.total" />
        </el-row>
      </el-col>
      <el-col>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear nuevo usuario</h2>
          </template>
          <template #default>
            <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="user"
              @submit.prevent="createUser()">
              <el-row :gutter="20">
                <el-col :span="18">
                  <el-form-item label="Usuario">
                    <el-input v-model="user.username" placeholder="Ingrese el usuario"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="Activar">
                    <el-switch v-model="user.isActive" class="ml-2" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="Nombre">
                <el-input v-model="user.name" placeholder="Ingrese el nombre"></el-input>
              </el-form-item>
              <el-form-item label="Apellido">
                <el-input v-model="user.lastName" placeholder="Ingrese el apellido"></el-input>
              </el-form-item>
              <el-form-item label="Cédula o RIF">
                <el-input v-model="user.cardId" placeholder="Ingrese la cédula"></el-input>
              </el-form-item>
              <el-form-item label="Correo">
                <el-input v-model="user.email" placeholder="Ingrese el email"></el-input>
              </el-form-item>
              <el-form-item label="Teléfono">
                <el-input v-model="user.phone" placeholder="Ingrese el teléfono"></el-input>
              </el-form-item>
              <el-form-item label="Rol">
                <el-select class="w-full" v-model="user.role" filterable placeholder="Elige un rol">
                  <el-option v-for="item in roles" :key="item.label" :label="item.label" :value="item.value!"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Grupo">
                <el-select class="w-full" v-model="user.groupId" filterable remote placeholder="Elige un grupo"
                  :loading="loadingGroup" :remote-method="setGroup">
                  <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
                    <span style="float: left">{{ item.name }}</span>
                    <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Contraseña">
                <el-input v-model="user.password" placeholder="Ingrese la contraseña"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!user.name && !user.username && !user.password && !user.email"
                  native-type="submit">Crear</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-dialog>
        <el-dialog v-model="modals.edit">
          <template #header>
            <h2>Editar usuario</h2>
          </template>
          <template #default>
            <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="user"
              @submit.prevent="patchUser()">
              <el-row :gutter="20">
                <el-col :span="18">
                  <el-form-item label="Usuario">
                    <el-input v-model="user.username" placeholder="Ingrese el usuario" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="Activar">
                    <el-switch v-model="user.isActive" class="ml-2" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="Nombre">
                <el-input v-model="user.name" placeholder="Ingrese el nombre"></el-input>
              </el-form-item>
              <el-form-item label="Apellido">
                <el-input v-model="user.lastName" placeholder="Ingrese el apellido"></el-input>
              </el-form-item>
              <el-form-item label="Cédula o RIF">
                <el-input v-model="user.cardId" placeholder="Ingrese la cedula"></el-input>
              </el-form-item>
              <el-form-item label="Correo electrónico">
                <el-input v-model="user.email" placeholder="Ingrese el email"></el-input>
              </el-form-item>
              <el-form-item label="Teléfono">
                <el-input v-model="user.phone" placeholder="Ingrese el teléfono"></el-input>
              </el-form-item>
              <el-form-item label="Rol">
                <el-select class="w-full" v-model="user.role" filterable placeholder="Elige un rol">
                  <el-option v-for="item in roles" :key="item.label" :label="item.label" :value="item.value!"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Grupo">
                <el-select class="w-full" v-model="user.groupId" filterable remote placeholder="Elige un grupo"
                  :loading="loadingGroup" :remote-method="setGroup">
                  <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
                    <span style="float: left">{{ item.name }}</span>
                    <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Contraseña">
                <el-input v-model="user.password" placeholder="Ingrese la contraseña"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" native-type="submit">Editar</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-dialog>
      </el-col>
      <el-col justify="end" :span="24">
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
import { useFetch } from 'nuxt/app';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const loadingUser = ref(false);
const loadingGroup = ref(false);
const minWidth = ref(120);


const filters = reactive({
  limit: 10,
  offset: 0,
  username: '',
  group: '',
  role: '',
  name: '',
  lastName: '',
  cardId: '',
  email: '',
});

const users = reactive<{
  rows: User[],
  total: number
}>({
  rows: [],
  total: 0
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

const roles = [
  { label: "Taquilla", value: "taquilla" },
  { label: "Técnico", value: "tecnico" },
  { label: "Auditor", value: "auditor" },
  { label: "Receptor", value: "receptor" },
  { label: "Asistente", value: "asistente" },
];


const user = reactive<User>({
  id: undefined,
  name: '',
  lastName: '',
  username: '',
  cardId: '',
  phone: '',
  email: '',
  role: '',
  password: '',
  isActive: false,
  groupId: undefined
});

const getUsers = async ({
  id,
  name,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
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
      throw new Error('Error al cargar los usuarios')
    }

    loadingUser.value = false;
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      message: 'Error al obtener las usuario intente de nuevo mas tarde'
    })
  }
}

const createUser = async () => {
  try {
    loadingUser.value = true;

    const body = useFilterObject(user);

    const { data, error } = await useFetch<User>('/users',
      {
        method: 'POST',
        body
      },
    )
    loadingUser.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear usuario intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setUsers()
    ElNotification({
      title: 'Usuario creada correctamente',
      message: `${data.value?.name}`
    })
    user.id = undefined;
    user.name = '';
    user.lastName = '';
    user.username = '';
    user.cardId = '';
    user.phone = '';
    user.email = '';
    user.role = '';
    user.password = '';
    user.isActive = false
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      title: 'Error al crear usuario intente de nuevo mas tarde',
    })
  }
}

const updateUserStatus = async ({ active, userId }: { active: string | number | boolean, userId: number }) => {
  try {
    let toSend = {
      isActive: active,
    };
    const { data, error } = await useFetch<User>(`/users/${userId}`,
      {
        method: 'PATCH',
        body: toSend
      }
    );

    if (error.value) {
      throw error
    }
    await setUsers()
    ElNotification({
      title: 'Usuario modificada correctamente',
      message: `${data.value?.name}`
    })
  } catch (error) {
  }
}

const patchUser = async () => {
  try {
    loadingUser.value = true;

    const body = useFilterObject(user);
    delete body.id
    delete body.username

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
      title: 'Usuario modificada correctamente',
      message: `${data.value?.name}`
    })

    user.id = undefined;
    user.name = '';
    user.lastName = '';
    user.username = '';
    user.cardId = '';
    user.phone = '';
    user.email = '';
    user.role = '';
    user.password = '';
    user.isActive = false
    return data.value
  } catch (error) {
    loadingUser.value = false;
    ElNotification({
      title: 'Error al modificar el usuario intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editUser = (row: User) => {
  modals.edit = true;
  user.id = row.id;
  user.username = row.username;
  user.name = row.name || '';
  user.lastName = row.lastName;
  user.phone = row.phone || '';
  user.cardId = row.cardId || '';
  user.email = row.email;
  user.role = row.role || '';
  user.groupId = row.group?.id;
  user.isActive = row.isActive;

  if (row.group) groups.rows.push(row.group)
}

const removeUser = async (id: number) => {
  try {
    const { data, error } = await useFetch<User>(`/users/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingUser.value = false;
      ElNotification({
        message: 'Error al borrar el usuario intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'El usuario ha sido borrada.'
    })
    await setUsers()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar el usuario intente de nuevo mas tarde.'
    })
  }
}

const setUsers = async () => {
  const query = {
    name: filters.name,
    code: filters.lastName,
    limit: filters.limit,
    offset: filters.offset,
    parent: filters.username
  }
  const rta = await getUsers(query);
  users.rows = rta?.rows || []
  users.total = rta?.total || 0
}

const getGroups = async ({
  name,
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
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
      {
        params: {
          ...(name != '' && name && {
            name
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

const onBack = () => {
  router.back();
}

const setGroup = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getGroups(search);
  groups.rows = rta?.rows || []
  groups
}

watch(filters, useDebounce(async () => {
  await setUsers()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
  } else {
    user.id = undefined;
    user.username = '';
    user.name = '';
    user.lastName = '';
    user.cardId = '';
  }
})

onMounted(async () => {
  await setUsers();
});
</script>