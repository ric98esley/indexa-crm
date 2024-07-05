<script setup lang="ts" >
import { useAuthStore } from '@/stores/authStore'

const formUser = ref()

const AuthService = useAuth();
const authService = new AuthService();

const user = reactive({
  email: ''
})

const rules = reactive({
  email: [
    { required: true, message: 'Debes ingresar un correo electrónico', trigger: 'blur' },
    { type: 'email', message: 'El correo debe de ser un email valido' },
  ]
})

let loading = ref(false);

const recovery = async () => {
  try {
    loading.value = true;
    const data = await authService.recovery(user.email);
    user.email = '';
  } catch (error) {
    ElNotification({
      title: 'Ha ocurrido un error',
      message: error?.message || ''
    })
    console.log(error)
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login">
    <el-card>
      <Logo width="w-32" margin="m-3" />
      <el-form class="login-form" :model="user" :rules="rules" ref="formUser" status-icon
        @submit.native.prevent="recovery()">
        <el-form-item prop="username">
          <el-input v-model="user.email" placeholder="Correo de verificación">
            <template #prepend>
              <Icon name="carbon:email"></Icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="login-button" type="primary" native-type="submit" block>Enviar</el-button>
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
