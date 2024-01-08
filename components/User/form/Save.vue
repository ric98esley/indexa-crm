<script lang="ts" setup>
import type { FormInstance, FormItemProp } from 'element-plus';
import { useUserStore } from '~/stores/userStore.js';

const userFormRef = ref<FormInstance>()

const allowSubmit = ref<boolean>(false);

const userStore = useUserStore();
const UserService = useUsers();
const GroupsService = useGroups();

const userService = new UserService();
const groupService = new GroupsService();

const loadingGroup = ref(false);

const props = defineProps({
  loadingUser: Boolean,
  editUser: Boolean,
  userId: Number,
  groups: Array
})

const emit = defineEmits(['update:loadingUser', 'onSubmit'])

const loadingUser = computed({
  get() {
    return props.loadingUser
  },
  set(loadingUser) {
    emit('update:loadingUser', loadingUser)
  }
})

const groups = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
});

const roles = [
  { label: "Taquilla", value: "taquilla" },
  { label: "Técnico", value: "tecnico" },
  { label: "Auditor", value: "auditor" },
  { label: "Receptor", value: "receptor" },
  { label: "Asistente", value: "asistente" },
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
      limit: 10,
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


const createUser = async () => {
  try {
    loadingUser.value = true;

    const { data, error } = await userService.createUser(userStore.user);

    if (error.value) throw new Error();

    userStore.$reset();

  } catch (error) {
    loadingUser.value = false;
  }
}

const editUser = async () => {
  try {
    loadingUser.value = true;
    await userService.editUser(userStore.user);
    userStore.$reset()
  } catch (error) {
    loadingUser.value = false
  }
}

const saveUser = async () => {
  if(props.editUser) {
    await editUser()
  } else {
    await createUser()
  }
  emit('onSubmit')
}

const validateUser = (props: FormItemProp, isValid: boolean, message: string) => {
  allowSubmit.value = isValid;
}

watch(() => props.editUser ,async () => {
  if(props.editUser == true) {
    await setGroup(userStore.user.group?.code);
  }
})

onMounted(async () => {
  if(props.editUser == true) {
    await setGroup(userStore.user.group?.code);
  }
})

</script>

<template>
  <el-form ref="userFormRef" @validate="validateUser" label-position="top" label-width="auto" autocomplete="off"
    status-icon require-asterisk-position="right" @submit.prevent="saveUser()" :rules="rules" :model="userStore.user">
    <h3 class="text-lg">Datos de usuario</h3>
    <p class="mb-4">Credenciales para entrar al sistema</p>

    <el-row :gutter="20">
      <el-col :md="18">
        <el-form-item label="Usuario" prop="username">
          <el-input v-model="userStore.user.username" placeholder="joe"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="Activar" prop="isActive">
          <el-switch v-model="userStore.user.isActive" class="ml-2" />
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="Correo electrónico" prop="email">
          <el-input v-model="userStore.user.email" placeholder="ejemplo@ejemplo.com"></el-input>
        </el-form-item>
      </el-col>
      <el-col v-if="!props.editUser">
        <el-form-item label="Contraseña (Obligatoria)" prop="password">
          <el-input v-model="userStore.user.password" placeholder="Clave ultra secreta"></el-input>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="Rol" prop="role">
          <el-select class="w-full" v-model="userStore.user.role" filterable placeholder="Elige el rol">
            <el-option v-for="item in roles" :key="item.label" :label="item.label" :value="item.value!"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item label="Grupo">
          <el-select class="w-full" v-model="userStore.user.groupId" filterable remote placeholder="Elige un grupo"
            :loading="loadingGroup" :remote-method="setGroup">
            <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right;">{{ item.code }}</span> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-col v-if="!props.editUser">
      <div class="mt-2 mb-4">
        <h3 class="text-lg">Perfil del usuario</h3>
        <p>Refiere a datos de contacto</p>
      </div>
      <el-form-item label="Nombre" prop="profile.name">
        <el-input v-model="userStore.user.profile.name" placeholder="Ingrese el nombre"></el-input>
      </el-form-item>
      <el-form-item label="Apellido" prop="profile.lastName">
        <el-input v-model="userStore.user.profile.lastName" placeholder="Ingrese el apellido"></el-input>
      </el-form-item>
      <el-form-item label="Cédula o RIF" prop="profile.cardId" type="number">
        <el-input v-model="userStore.user.profile.cardId" placeholder="Ingrese la cédula"></el-input>
      </el-form-item>
      <el-form-item label="Teléfono" prop="profile.phone">
        <el-input v-model="userStore.user.profile.phone" placeholder="Ingrese el teléfono" prop="profile.phone"
          type="number"></el-input>
      </el-form-item>
    </el-col>
    <el-form-item>
      <el-button type="primary" native-type="submit"
        :disabled="!allowSubmit || !userStore.user.username || !userStore.user.email || !(props.editUser || userStore.user.password)">
        Guardar
      </el-button>
    </el-form-item>
  </el-form>
</template>