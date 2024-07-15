<script setup lang="ts">
const emit = defineEmits([
  'submit'
])

const SpecificationService = useSpecifications();
const specificationsService = new SpecificationService();

const form = reactive({
  typeId: '',
  value: ''
})

const types = ref<Specification[]>([])


const getSpecificationTypes = async (query: string) => {
  try {
    const res = await specificationsService.getSpecification({
      name: query
    });
    types.value = res?.rows ?? [];
  } catch (error) {
    console.log(error);
  }
}

const submit = async () => {
  try {
    emit('submit', form);
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  getSpecificationTypes('')
})


</script>

<template>
  <el-form label-position="top" :model="form" @submit.prevent="submit">
    <h2 class="mb-4 text-lg">
      Agregar especificación a un activo
    </h2>
    <el-form-item>
      <el-select
        filterable
        remote
        :remote-method="getSpecificationTypes"
        v-model="form.typeId"
        placeholder="Selecciona un tipo"
        class="w-full"
      >
        <el-option
          v-for="item in types"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="Valor">
      <el-input v-model="form.value" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>