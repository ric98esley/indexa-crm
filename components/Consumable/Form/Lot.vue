<script setup lang="ts">
interface lote {
  customer: string;
  description: string;
}

const target = reactive({
  customer: '',
  description: ''
})

const lotFormRef = ref();

const rules = {
  customer: [
    { required: true, message: 'Por favor escriba a quien va dirigido', trigger: 'blur' },
    { min: 8, message: 'Debe tener al menos 8 caracteres', trigger: 'blur' },
  ],
  description: [
    { required: true, message: 'Por favor escribe una nota de entrega o recepción', trigger: 'blur' },
    { min: 10, message: 'Debe tener al menos 10 caracteres', trigger: 'blur' },
  ]
}



const emit = defineEmits({
  submit: ({ customer, description }: lote) => {
    if (!customer && !description) {
    } else {
      return true
    }
  }
})

const submit = async () => {
  await lotFormRef.value?.validate((valid: any) => {
    if (valid) {
      emit('submit', {
        customer: target.customer,
        description: target.description
      });
      lotFormRef.value?.resetFields();
    }
  })
}

</script>

<template>
  <el-form label-position="top" require-asterisk-position="right" @submit.prevent="submit" :model="target" :rules="rules"
    ref="lotFormRef">
    <el-form-item label="Dirigido a" prop="customer">
      <el-input v-model="target.customer" />
    </el-form-item>
    <el-form-item label="Nota" prop="description">
      <el-input v-model="target.description" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">
        Guardar
      </el-button>
    </el-form-item>
  </el-form>
</template>