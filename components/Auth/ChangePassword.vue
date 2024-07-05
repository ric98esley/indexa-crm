<script setup lang="ts" >
const props = defineProps({
  token: {
    type: String,
    required: true
  }
})

const formUser = ref()

const AuthService = useAuth();
const authService = new AuthService();

const password = reactive<{
  confirm?: string
  password: string,
  token: string
}>({
  confirm: '',
  password: '',
  token: props.token
})

const rules = reactive({
  password: [
    { required: true, message: "Contraseña requerida", trigger: "blur" },
    {
      min: 8,
      message: "Mínimo 8 caracteres",
      trigger: "blur"
    }
  ],
  recovery: [
    { required: true, message: "Contraseña requerida", trigger: "blur" },
    {
      min: 8,
      message: "Mínimo 8 caracteres",
      trigger: "blur"
    }
  ],
})

let loading = ref(false);

const recovery = async () => {
  try {
    loading.value = true;
    const data = await authService.changePassword(password);
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login">
    <el-card>
      <Logo width="w-32" margin="m-3" />
      <el-form class="login-form" :model="password" :rules="rules" ref="formUser" status-icon
        @submit.native.prevent="recovery()">
        <el-form-item prop="password">
          <el-input v-model="password.password" placeholder="Contraseña nueva" type="password" show-password>
            <template #prepend>
              <Icon name="carbon:password"></Icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirm">
          <el-input v-model="password.confirm" placeholder="Confirme la Contraseña" type="password" show-password>
            <template #prepend>
              <Icon name="carbon:password"></Icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="login-button" type="primary" native-type="submit" block
            :disabled="!(password.confirm == password.password) || !password.password">Enviar</el-button>
        </el-form-item>
      </el-form>
      <el-row justify="center">
        <NuxtLink href="/login">Volver al inicio</NuxtLink>
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
