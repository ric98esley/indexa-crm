<script setup lang="ts" >
import { FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/authStore'
import { title } from 'process';
const auth = useAuthStore();

const formUser = ref<FormInstance>()

interface UserForm {
  username: string,
  password: string
}

const rules = reactive<FormRules<UserForm>>({
  username: [
    {
      required: true,
      message: "Usuario es requerido",
      trigger: "blur"
    },
    {
      min: 4,
      message: "El usuario debe de ser mínimo de 4 letras",
      trigger: "blur"
    }
  ],
  password: [
    { required: true, message: "Contraseña requerida", trigger: "blur" },
    {
      min: 5,
      message: "Mínimo 5 caracteres",
      trigger: "blur"
    }
  ]
})

const userCredencials = reactive<UserForm>(
  {
    username: "",
    password: ""
  },
)
let loading = ref(false);

const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (!valid) return;
  })

  loading.value = true;

  try {
    const { data, pending, error } = await useFetch<{ token: string, user: User }>('/login', {
      method: 'post',
      body: {
        user: userCredencials.username,
        password: userCredencials.password,
      }
    });
    if (error.value) {
      throw new Error('Usuario o contraseña incorrecto');
    }
    const token = data.value?.token;
    const user = data.value?.user;

    const userRoles = useRoles()

    userRoles.value = [user!.role]  //

    auth.setAuthState(token, user);
    loading.value = false;
    navigateTo('/');
  } catch (error) {
    ElNotification({
      title: 'Ha ocurrido un error',
      message: error?.message || ''
    })
    loading.value = false;
  }
}
</script>

<template>
  <div class="login">
    <el-card>
      <Logo width="w-40" margin="m-3" />
      <el-form class="login-form" :model="userCredencials" :rules="rules" ref="formUser" status-icon
        @submit.native.prevent="login(formUser)">
        <el-form-item prop="username">
          <el-input v-model="userCredencials.username" placeholder="Nombre de usuario">
            <template #prepend>
              <Icon name="carbon:user"></Icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="userCredencials.password" placeholder="Contraseña" type="password" show-password>
            <template #prepend>
              <Icon name="carbon:password"></Icon>
            </template></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="login-button" type="primary" native-type="submit" block>Iniciar
            sección</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-button {
  width: 100%;
  margin-top: 40px;
}

.login-form {
  width: 290px;
}

.forgot-password {
  margin-top: 10px;
}
</style>
<style lang="scss">
$teal: rgb(0, 124, 137);

.el-button--primary {
  background: $teal;
  border-color: $teal;

  &:hover,
  &.active,
  &:focus {
    background: lighten($teal, 7);
    border-color: lighten($teal, 7);
  }
}

.login .el-input__inner:hover {
  border-color: $teal;
}

.login .el-input__prefix {
  background: rgb(238, 237, 234);
  left: 0;
  height: calc(100% - 2px);
  left: 1px;
  top: 1px;
  border-radius: 3px;

  .el-input__icon {
    width: 30px;
  }
}

.login .el-input input {
  padding-left: 35px;
}

.login .el-card {
  padding-top: 0;
  padding-bottom: 30px;
}

h2 {
  font-family: "Open Sans";
  letter-spacing: 1px;
  font-family: Roboto, sans-serif;
  padding-bottom: 20px;
}

a {
  color: $teal;
  text-decoration: none;

  &:hover,
  &:active,
  &:focus {
    color: lighten($teal, 7);
  }
}

.login .el-card {
  width: 340px;
  display: flex;
  justify-content: center;
}
</style>
