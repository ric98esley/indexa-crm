<script lang="ts" setup>
const props = defineProps({
  form : {
    type: Object as PropType<CreateMaintenance>,
    default: () => ({
      description: '',
      maintenanceTypeId: undefined,
      assetId: undefined,
    })
  }
})

const emit = defineEmits(['submit'])

const formState = reactive<CreateMaintenance>({
  description: props.form.description,
  cost: props.form.cost,
  maintenanceTypeId: props.form.maintenanceTypeId,
  assetId: props.form.assetId,
})

const rules = {
  description: [
    { required: true, message: 'Por favor escriba una descripción del mantenimiento', trigger: 'blur' },
    { min: 10, message: 'Debe tener al menos 10 caracteres', trigger: 'blur' },
  ],
  maintenanceTypeId: [
    { required: true, message: 'Por favor seleccione un tipo de mantenimiento', trigger: 'change' },
  ],
  assetId: [
    { required: true, message: 'Por favor seleccione un activo', trigger: 'change' },
  ],
}

const submit = () => {
  if (formState.description && formState.maintenanceTypeId && formState.assetId) {
    emit('submit', {
      description: formState.description,
      maintenanceTypeId: formState.maintenanceTypeId,
      assetId: formState.assetId,
    })

    formState.description = ''
    formState.maintenanceTypeId = undefined
    formState.assetId = undefined
  }
}

</script>

<template>
  <el-form :rules="rules" :model="formState" label-position="top" require-asterisk-position="right" @submit.prevent="submit">
    <el-form-item prop="assetId" label="Activo">
      <AssetsSelect v-model="formState.assetId" />
    </el-form-item>
    <el-form-item prop="maintenanceTypeId" label="Tipo de mantenimiento">
      <MaintenanceSelectType v-model="formState.maintenanceTypeId" />
    </el-form-item>
    <el-form-item prop="description" label="Descripción">
      <el-input v-model="formState.description" placeholder="Descripción del mantenimiento"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>