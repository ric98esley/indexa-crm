<script setup lang="ts">
const props = defineProps({
  form: {
    type: Object as PropType<CreatePaths>,
    default: () => ({
      name: '',
      path: '',
      isAllow: false,
    }),
  },
});

const emit = defineEmits(['submit']);

const ruleFormRef = ref()

const formState = reactive({
  name: props.form.name,
  path: props.form.path,
  isAllow: props.form.isAllow,
});

const rules = {
  name: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
  ],
  path: [
    { required: true, message: 'La ruta es requerida', trigger: 'blur' },
  ],
};


const handlerSubmit = async () => {
  if (!formState.name || !formState.path) return;
  emit('submit', {
    name: formState.name,
    path: formState.path,
    isAllow: formState.isAllow,
  });

  formState.name = '';
  formState.path = '';
  formState.isAllow = false;
};

</script>

<template>
  <el-form ref="ruleFormRef" :model="formState" label-position="top" :rules="rules" @submit.prevent="handlerSubmit">
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="formState.name" />
    </el-form-item>
    <el-form-item label="Ruta" prop="path">
      <el-input v-model="formState.path" />
    </el-form-item>
    <el-form-item label="Permitir">
      <el-switch v-model="formState.isAllow" active-text="Si" inactive-text="No" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>