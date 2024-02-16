<script setup lang="ts">

const props = defineProps({
  defaultType: {
    type: String,
    default: () => ''
  }
});

const emit = defineEmits({
  submit: ({
    description,
    notes,
    content
  }: OrderData) => {
    if (!description) return false
    return true
  }
});

const checkType: { value: string, label: string }[] = [
  {
    value: 'sale',
    label: 'Venta'
  },
  {
    value: 'purchase',
    label: 'Compra'
  },
  {
    value: 'checking',
    label: 'Entrada',
  },
  {
    value: 'warranty',
    label: 'Garantía',
  },
  {
    value: 'request',
    label: 'Solicitud'
  },
  {
    value: 'borrowing',
    label: 'Préstamo'
  },
]

const orderData = reactive<OrderData>({
  description: props.defaultType,
  notes: '',
  content: ''
});

const submit = () => {
  emit('submit', orderData)
}


</script>

<template>
  <el-form label-position="top" @submit.prevent="submit()">
    <el-form-item label="Tipo">
      <el-select v-model="orderData.description" class="w-full">
        <el-option v-for="item in checkType" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="Nota">
      <el-input v-model="orderData.notes" />
    </el-form-item>
    <el-form-item label="Contenido">
      <el-input type="textarea" v-model="orderData.content" />
    </el-form-item>
    <el-form-item>
      <el-button native-type="submit" :disabled="!orderData.description" type="primary">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>