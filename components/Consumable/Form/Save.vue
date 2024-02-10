<template>
  <el-form label-position="top" @submit.prevent="patchMin()">
    <el-form-item label="Mínimo">
      <el-input v-model="min"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button native-type="submit" type="primary">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">

const props = defineProps({
  productId: {
    type: Number
  },
  locationId: {
    type: Number
  },
  min: {
    type: String,
    default: () => ''
  }
});

const emit = defineEmits(['submit']);

const ConsumableService = useConsumable();
const consumableService = new ConsumableService();

const min = ref(props.min)

const patchMin = async () => {
  await consumableService.updateInventory({
    productId: props.productId || 0,
    locationId: props.locationId || 0,
    min: min.value
  });

  emit('submit');
}
</script>