<script setup lang="ts">

const props = defineProps({
  form: {
    type: Object as PropType<MaintenanceType>,
    default: () => ({
      name: '',
      description: ''
    })
  }
})

const emit = defineEmits(['submit'])

const formState = reactive({
  name: props.form.name,
  description: props.form.description ?? ''
})

const rules = {
  name: [
    { required: true, message: 'Por favor escriba el nombre del tipo de mantenimiento', trigger: 'blur' },
    { min: 5, message: 'Debe tener al menos 5 caracteres', trigger: 'blur' },
  ],
  description: [
    { required: true, message: 'Por favor escriba una descripción del tipo de mantenimiento', trigger: 'blur' },
    { min: 10, message: 'Debe tener al menos 10 caracteres', trigger: 'blur' },
  ]
}

const submit = () => {
  emit('submit', {
    name: formState.name,
    description: formState.description
  })

  formState.description = ''
  formState.name = ''
}
</script>


<template>
  <el-form :rules="rules" :model="formState" label-position="top" require-asterisk-position="right" @submit.prevent="submit" >
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="formState.name"></el-input>
    </el-form-item>
    <el-form-item label="Descripción" prop="description">
      <el-input v-model="formState.description"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">
        Guardar
      </el-button>
    </el-form-item>
  </el-form>
</template>