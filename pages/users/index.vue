<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <PageHeader name="Usuarios">
        <template #buttons>
          <NuxtLink href="/users/roles" v-role="['superuser']">
            <el-button type="primary">Roles</el-button>
          </NuxtLink>
        </template>
      </PageHeader>
      <el-col :span="24">
        <el-col>
          <UserView :data="users.rows" v-model:filters="filters" :total="users.total" @refresh="setUsers" />
        </el-col>
      </el-col>
      <el-col>
        <el-dialog v-model="modals.create" @close="edit = false">
          <template #header>
            <h2 class="text-xl">Crear Usuario</h2>
          </template>
          <template #default>
            <UserFormSave v-model:loading-user="loadingUser"  @submit="handlerSubmit" />
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

const createUser = async (user: CreateUser) => {
  await userService.createUser(user);
}

const handlerSubmit = async (user: CreateUser) => {
  await createUser(user)
  modals.create = false
  setUsers()
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
})

onMounted(async () => {
  loadingUser.value = true;
});
</script>