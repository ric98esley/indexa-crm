<template>
  <NuxtLayout :name="404">
    <div class="container">
      <div class="text-4xl">Parece que no podemos encontrar lo que estas buscando.</div>
      <el-button @click="goBack" type="primary">
        Regresar
      </el-button>
    </div>
  </NuxtLayout>
</template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.text-4xl {
  text-align: center;
  margin-bottom: 20px;
}

.button {
  padding: 4px 6px;
  margin: 10px 0px;
  background: black;
  color: white;
}
</style>
