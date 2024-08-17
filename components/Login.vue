<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore();

const formUser = ref()

interface UserForm {
  username: string,
  password: string
}

const rules = reactive({
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

const userCredencial = reactive<UserForm>(
  {
    username: "",
    password: ""
  },
)
let loading = ref(false);

const login = async (formEl: any | undefined) => {
  if (!formEl) return

  await formEl.validate((valid: any, fields: any) => {
    if (!valid) return;
  })

  loading.value = true;

  const data = await useLogin(userCredencial.username, userCredencial.password)

  if (!data) return loading.value = false;

  auth.setAuthState(data);

  loading.value = false;
  navigateTo('/');
}
</script>

<template>
  <div class="login">
    <el-card>
      <Logo width="w-32" margin="m-3" />
      <el-form class="login-form" :model="userCredencial" :rules="rules" ref="formUser" status-icon
        @submit.native.prevent="login(formUser)">
        <el-form-item prop="username">
          <el-input v-model="userCredencial.username" placeholder="Nombre de usuario">
            <template #prepend>
              <Icon name="carbon:user"></Icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="userCredencial.password" placeholder="Contraseña" type="password" show-password>
            <template #prepend>
              <Icon name="carbon:password"></Icon>
            </template></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="login-button" type="primary" native-type="submit" block>Iniciar
            sección</el-button>
        </el-form-item>
      </el-form>
      <el-row justify="center">
        <NuxtLink href="/recovery">
          Recuperar contraseña
        </NuxtLink>
      </el-row>
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
