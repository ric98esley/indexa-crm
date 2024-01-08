<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <PageHeader name="Usuarios" />
      <el-col :span="24">
        <el-col>
          <el-table :data="users.rows" v-loading="loadingUser">
            <el-table-column type="index" width="50" />
            <el-table-column type="expand" width="50">
              <template #default="{ row }">
                <el-row :span="24" :gutter="24">
                  <el-col :span="22" :offset="2">
                    Fecha de creación: {{ new Date(row.createdAt).toLocaleString('es-VE') }}
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="Usuario" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.name" placeholder="Nombre" clearable />
              </template>
            </el-table-column>
            <el-table-column prop="profile.name" label="Nombre" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.name" placeholder="Nombre" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Apellido" prop="profile.lastName" :min-width="minWidth">
              <template #header>
                <el-input v-model="filters.lastName" placeholder="Apellido" clearable />
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
            <el-table-column label="Acciones" width="140">
              <template #default="{ row }">
                <el-row justify="space-between">
                  <el-button type="info" circle @click="editUser(row)" v-can="['users:update']">
                    <Icon name="ep:edit" />
                  </el-button>
                  <NuxtLink :to="`/users/${row.id}`">
                    <el-button type="primary" circle>
                      <Icon name="ep:view" />
                    </el-button>
                  </NuxtLink>
                  <el-button type="danger" circle @click="removeUser(row.id)" v-can="['users:delete']">
                    <Icon name="ep:delete" />
                  </el-button>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
          <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="users.total" />
        </el-col>
      </el-col>
      <el-col>
        <el-dialog v-model="modals.create" @close="edit = false">
          <template #header>
            <h2 class="text-xl">{{ edit == true ? 'Editar el usuario ' : 'Crear Usuario' }}</h2>
          </template>
          <template #default>
            <UserFormSave v-model:loading-user="loadingUser" v-model:edit-user="edit" :on-submit="setUsers()" />
          </template>
        </el-dialog>
      </el-col>
      <el-col justify="end" :span="24">
        <div
          class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
          @click="() => {
            edit = false
            modals.create = true
          }">
          <Icon name="ep:plus" size="2rem" color="white" />
        </div>
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore.js';
const userStore = useUserStore();


definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
  ]
});

const loadingUser = ref(false);
const minWidth = ref(120);

const edit = ref(false);

const UserService = useUsers();
const userService = new UserService();

const filters = reactive({
  limit: 10,
  offset: 1,
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

const modals = reactive({
  details: false,
  edit: false,
  create: false,
  menu: false
});

const editUser = (row: User) => {
  edit.value = true;

  userStore.setUser(row)

  modals.create = true;
}

const removeUser = async (id: number) => {
  try {
    await userService.removeUser({ id })

    loadingUser.value = true;
  } catch (error) {
    console.log(error)
  }
}

const setUsers = async () => {
  try {
    const query = {
      name: filters.name,
      code: filters.lastName,
      limit: filters.limit,
      offset: filters.offset,
      username: filters.username,
      role: filters.role,
      group: filters.group,
    }

    const rta = await userService.getUsers(query);
    loadingUser.value = false;
    users.rows = rta?.rows || []
    users.total = rta?.total || 0
  } catch (error) {
    loadingUser.value = false;
  }
}

watch(filters, useDebounce(async () => {
  await setUsers()
}, 500)
)

watch(loadingUser, useDebounce(async () => {
  if (loadingUser.value == true) {
    await setUsers()
  };
}))

watch(edit, async () => {
  if (!edit.value) userStore.resetUser();
})

onMounted(async () => {
  loadingUser.value = true;
});
</script>