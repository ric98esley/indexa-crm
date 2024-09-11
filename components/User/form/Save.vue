<script lang="ts" setup>
const props = defineProps({
  editUser: {
    type: Boolean,
    default: false
  },
  userId: Number,
  groups: Array
})

const user = reactive<CreateUser>({
  username: '',
  email: '',
  password: '',
  role: '',
  isActive: true,
  groupId: undefined,
  profile: {
    name: '',
    lastName: '',
    cardId: '',
    phone: ''
  }
})

const userFormRef = ref()

const allowSubmit = ref<boolean>(false);

const UserService = useUsers();
const userService = new UserService();

const GroupsService = useGroups();
const groupService = new GroupsService();

const loadingGroup = ref(false);


const setUser = (data: User) => {
  user.username = data.username;
  user.email = data.email;
  user.role = data.role;
  user.isActive = data.isActive;
  user.groupId = data.group?.id;
  user.profile = {
    name: data.profile?.name,
    lastName: data.profile?.lastName,
    cardId: data.profile?.cardId,
    phone: data.profile?.phone
  }
}

const getUser = async (id?: number) => {
  if (!id) return;
  if (id === 0) return;
  if (props.editUser) {
    const rta = await userService.getUser(id);
    if (!rta) return;
    setUser(rta);
  }
}


const emit = defineEmits(['update:loadingUser', 'submit'])

const groups = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
});

const roles = [
  { label: "Auditor", value: "auditor" },
  { label: "Receptor", value: "receptor" },
  { label: "Asistente", value: "asistente" },
  { label: "Observador", value: "observador" },
  { label: "Administrador", value: "administrador" },
  { label: "Taquilla", value: "taquilla" },
  { label: "Técnico", value: "tecnico" },
  { label: "Secretaria", value: "secretaria" },
];

const rules = {
  username: [
    { required: true, message: 'Debes ingresar un usuario', trigger: 'blur' },
    { min: 3, max: 15, message: 'El usuario debe de tener entre 3 y 15 caracteres' },
    { pattern: /^[a-z]+$/, message: 'Debe de contener solo letras en minúscula' },
  ],
  email: [
    { required: true, message: 'Debes ingresar un correo electrónico' },
    { type: 'email', message: 'El correo debe de ser un email valido' },
  ],
  password: [
    { min: 8, max: 20, message: 'La contraseña debe de tener entre 8 y 20 caracteres' }
  ],
  'profile.name': [
    { min: 3, message: 'El nombre debe tener mas de 3 caracteres' },
    { type: 'string', message: 'El nombre debe ser de tipo texto' }
  ],
  'profile.lastName': [
    { min: 3, message: 'El apellido debe tener mas de 3 caracteres' },
    { type: 'string', message: 'El apellido debe ser de tipo texto' }
  ],
  'profile.cardId': [
    { min: 3, message: 'La cédula debe tener mas de 3 caracteres' },
    { pattern: /^[0-9]+$/, message: 'La cédula debe ser de tipo numérico' }
  ],
  'profile.phone': [
    { min: 3, message: 'El teléfono debe tener mas de 3 caracteres' },
    { pattern: /^[0-9]+$/, message: 'El teléfono debe ser de tipo numérico' }
  ],
}

const setGroup = async (query?: string) => {
  try {
    const search = {
      name: query,
      limit: 200,
      offset: 0
    }
    loadingGroup.value = true;
    const rta = await groupService.getGroups(search);
    loadingGroup.value = false;
    groups.rows = rta?.rows || []
  } catch (error) {
    loadingGroup.value = false;
  }
}


const saveUser = () => {
  emit('submit', user);
}

watch(() => props.userId, async () => {
  await getUser(props.userId);
})

onMounted(async () => {
  await setGroup('');
  await getUser(props.userId);
})

</script>

<template>
  <el-form ref="userFormRef" label-position="top" label-width="auto" autocomplete="off"
    status-icon require-asterisk-position="right" @submit.prevent="saveUser()" :rules="rules" :model="user">
    <h3 class="text-lg">Datos de usuario</h3>
    <p class="mb-4">Credenciales para entrar al sistema</p>

    <el-row :gutter="20">
      <el-col :md="18">
        <el-form-item label="Usuario" prop="username">
          <el-input v-model="user.username" placeholder="joe"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="Activar" prop="isActive">
          <el-switch v-model="user.isActive" class="ml-2" />
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="Correo electrónico" prop="email">
          <el-input v-model="user.email" placeholder="ejemplo@ejemplo.com"></el-input>
        </el-form-item>
      </el-col>
      <el-col v-if="!props.editUser">
        <el-form-item label="Contraseña (Obligatoria)" prop="password">
          <el-input v-model="user.password" placeholder="Clave ultra secreta"></el-input>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="Rol" prop="role">
          <el-select class="w-full" v-model="user.role" filterable placeholder="Elige el rol">
            <el-option v-for="item in roles" :key="item.label" :label="item.label" :value="item.value!"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="Grupo">
          <el-select class="w-full" v-model="user.groupId" filterable remote placeholder="Elige un grupo"
            :loading="loadingGroup" :remote-method="setGroup">
            <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right;">{{ item.code }}</span> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-col>
      <div class="mt-2 mb-4">
        <h3 class="text-lg">Perfil del usuario</h3>
        <p>Refiere a datos de contacto</p>
      </div>
      <el-form-item label="Nombre" prop="profile.name">
        <el-input v-model="user.profile.name" placeholder="Ingrese el nombre"></el-input>
      </el-form-item>
      <el-form-item label="Apellido" prop="profile.lastName">
        <el-input v-model="user.profile.lastName" placeholder="Ingrese el apellido"></el-input>
      </el-form-item>
      <el-form-item label="Cédula o RIF" prop="profile.cardId" type="number">
        <el-input v-model="user.profile.cardId" placeholder="Ingrese la cédula"></el-input>
      </el-form-item>
      <el-form-item label="Teléfono" prop="profile.phone">
        <el-input v-model="user.profile.phone" placeholder="Ingrese el teléfono" prop="profile.phone"
          type="number"></el-input>
      </el-form-item>
    </el-col>
    <el-form-item>
      <el-button type="primary" native-type="submit"
        :disabled="!user.username || !user.email">
        Guardar
      </el-button>
    </el-form-item>
  </el-form>
</template>