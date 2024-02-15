<script setup lang="ts" >
const BrandsServices = useBrands();
const brandServices = new BrandsServices();

const props = defineProps({
  brandId: {
    type: Number
  }
});
const emit = defineEmits(['update:brandId'])

const loadingBrands = ref(false);

const brandId = computed({
  get() {
    return props.brandId;
  },
  set(value) {
    emit('update:brandId', value);
  }
})

const brands = reactive<{ rows: Brand[], total: number }>({
  rows: [],
  total: 0
})
const getBrands = async (name?: string) => {
  try {
    const { data } = await brandServices.getBrands({
      name
    });

    brands.rows = data.value.rows || [];
  } catch (error) {
    console.log(error);
  }
}

</script>

<template>
  <el-select v-model="brandId" class="select-success" placeholder="Selecciona una categoría"
    :loading="loadingBrands" label="Deposito" style="width: 100%" filterable remote :remote-method="getBrands" clearable>
    <el-option v-for="option in brands.rows" :key="option.id" :value="option.id!"
      :label="`${option.id} - ${option.name}`">
      {{ option.id }} - {{ option.name }}
    </el-option>
  </el-select>
</template>