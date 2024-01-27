<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
    required: true,
    default: () => 0
  }
})

const AssetServices = useAssets();
const assetService = new AssetServices();

const emit = defineEmits([
  'submit'
])

const body = reactive<{ message: string }>({
  message: ''
})

const removeAsset = async () => {
  try {
    await assetService.delete({
      id: props.id,
      message: body.message
    })
  } catch (error) {
    console.log(error);
  } finally {
    emit('submit')
  }
}

const rules = {
  message: [
    { min: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
    { type: 'string', message: 'El mensaje debe ser de tipo texto' },
    { required: true, message: 'El mensaje es obligatorio' }
  ],
}
</script>

<template>
  <el-form label-position="top"  :model="body" :rules="rules" @submit.prevent="removeAsset">
    <el-form-item label="Motivo" prop="message">
      <el-input v-model="body.message" />
    </el-form-item>
    <el-form-item>
      <el-button type="danger" native-type="submit" :disabled="(!body.message || body.message.length < 10)">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>