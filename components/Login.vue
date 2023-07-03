<script setup lang="ts" >
import { FormInstance, FormRules } from 'element-plus';

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
      message: "El usuario debe de ser minimo de 4 letras",
      trigger: "blur"
    }
  ],
  password: [
    { required: true, message: "Contraseña requerida", trigger: "blur" },
    {
      min: 5,
      message: "Minimo 5 caracteres",
      trigger: "blur"
    }
  ]
})

const user = reactive<UserForm>(
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

  const options = {
    method: 'post',
    body: {
      user: user.username,
      password: user.password,
    }
  }
  loading.value = true;
  const { data, pending, error } = useIndexa('/login', options);

  watch(pending, (newPending) => {
    loading.value = newPending;
  });

  console.log("1")
  console.log(loading.value)
  setTimeout(() => {

    console.log("5")
    console.log(loading.value)
  }, 5000);
}


</script>

<template>
  <div class="login">
    <el-card>
      <h2>Indexa</h2>
      <el-form class="login-form" :model="user" :rules="rules" ref="formUser" status-icon
        @submit.native.prevent="login(formUser)">
        <el-form-item prop="username">
          <el-input v-model="user.username" placeholder="Nombre de usuario">
            <template #prepend>
              <Icon name="carbon:user"></Icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="user.password" placeholder="Contraseña" type="password">
            <template #prepend>
              <Icon name="carbon:password"></Icon>
            </template></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="login-button" type="primary" native-type="submit" block>Iniciar
            seccion</el-button>
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
