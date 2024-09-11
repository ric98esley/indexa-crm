<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array as PropType<User[]>,
    default: () => []
  },
  total: {
    type: Number as PropType<number>,
    default: 0
  },
  filters: {
    type: Object,
    default: () => ({
      limit: 10,
      offset: 1,
      username: '',
      group: '',
      role: '',
      name: '',
      lastName: '',
      cardId: '',
      email: '',
    })
  }
})

const modals = reactive({
  edit: false
})

const minWidth = ref(120);

const UserService = useUsers();
const userService = new UserService();

const userToEdit = ref<User | undefined>()

const emit = defineEmits(['refresh', 'update:filters', 'refresh'])

const handlerEdit = (row: User) => {
  userToEdit.value = row
  modals.edit = true
}

const removeUser = async (id: number) => {
  try {
    await userService.removeUser({ id })

    emit('refresh')
  } catch (error) {
    console.log(error)
  }
}

const filters = computed({
  get: () => props.filters,
  set: (value) => {
    emit('update:filters', value)
    emit('refresh', value)
  }
})

const editUser = async (user: CreateUser) => {
  if (!userToEdit.value?.id) return;
  await userService.editUser(userToEdit.value?.id, user);
  emit('refresh')
}

const handlerSubmit = async (user: CreateUser) => {
  await editUser(user)
  emit('refresh')
}

</script>

<template>
  <el-col>
    <el-table :data="props.data">
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
          <el-input v-model="filters.username" placeholder="Nombre" clearable />
        </template>
      </el-table-column>
      <el-table-column prop="profile.name" label="Nombre" :min-width="minWidth" />
      <el-table-column label="Apellido" prop="profile.lastName" :min-width="minWidth" />
      <el-table-column label="Rol" prop="role" :min-width="minWidth">
        <template #header>
          <el-input v-model="filters.role" placeholder="Rol" clearable />
        </template>
      </el-table-column>
      <el-table-column label="Grupo" prop="group.name" :min-width="minWidth">
        <template #header>
          <el-input v-model="filters.group" placeholder="Grupo" clearable />
        </template>
      </el-table-column>
      <el-table-column label="Acciones" min-width="100">
        <template #default="{ row }">
          <el-row justify="space-between">
            <el-button type="info" circle @click="handlerEdit(row)" v-can="['users:update']">
              <Icon name="ep:edit" />
            </el-button>
            <el-button type="danger" circle @click="removeUser(row.id)" v-can="['users:delete']">
              <Icon name="ep:delete" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    <el-container>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2 class="text-xl">Crear Usuario</h2>
        </template>
        <template #default>
          <UserFormSave :userId="userToEdit?.id" @submit="handlerSubmit" edit-user />
        </template>
      </el-dialog>
    </el-container>
  </el-col>
</template>