<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
  }
});

const emit = defineEmits(['submit']);

const BrandService = useBrands();
const brandService = new BrandService();

const formRefBrand = ref()
const loadingBrand = ref(false);


const brand = reactive<{
  id?: number,
  name?: string,
}>({
  id: undefined,
  name: ''
});

const createBrand = async () => {
  try {
    loadingBrand.value = true;

    const { data } = await brandService.createBrand({ name: brand.name! })

    loadingBrand.value = false;

    brand.id = undefined;
    brand.name = '';
    return data.value
  } catch (error) {
    loadingBrand.value = false;
    ElNotification({
      title: 'Error al crear marcas intente de nuevo mas tarde',
    })
  }
}

const patchBrand = async () => {
  try {
    loadingBrand.value = true;

    if(!brand.id) {
      ElNotification({
        title: 'Error al editar marcas intente de nuevo mas tarde',
      })
      return;
    };
    const body = {
      name: brand.name!,
      id: brand.id
    }
    const { data } = await brandService.patchBrand(body);

    loadingBrand.value = false;

    formRefBrand.value?.resetFields();
    return data.value
  } catch (error) {
    loadingBrand.value = false;
    console.log(error)
  }
}

const saveBrand = async () => {
  if (props.id === undefined || props.id === 0) {
    await createBrand();
  } else {
    await patchBrand();
  }

  emit('submit');
}

const setBrand = async () => {
  if (props.id === undefined || props.id === 0) {
    formRefBrand.value?.resetFields();
    return;
  }

  const res = await brandService.getBrand(props.id);
  if(res) {
    brand.id = res.id;
    brand.name = res.name;
  }
}

watch(() => props.id, async (id) => {
  await setBrand();
});

onMounted(async () => {
  await setBrand();
});
</script>

<template>
  <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="brand"
    @submit.prevent="saveBrand()" :modeL="brand" ref="formRefBrand">
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="brand.name" placeholder="Ingrese aquí el nombre"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="!brand.name" native-type="submit">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>