<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
  }
})

const emit = defineEmits(['submit'])

const saveCategoryRef =  ref();

const CategoriesService = useCategories();

const categoriesService = new CategoriesService()
const loadingCategory = ref(false);

const category = reactive<{
  id?: number,
  name?: string,
  description: string
  type: string
}>({
  id: undefined,
  name: '',
  description: '',
  type: ''
});

const categoryType = [
  { label: "Activo", value: "asset" },
  { label: "Consumible", value: "consumable" },
  { label: "Accesorio", value: "accessory" }
];

const createCategory = async () => {
  try {
    loadingCategory.value = true;

    const { data } = await categoriesService.createCategory({
      name: category.name,
      description: category.description,
      type: category.type
    })

    loadingCategory.value = false;

    category.id = undefined;
    category.name = '';
    return data.value
  } catch (error) {
    loadingCategory.value = false;
    console.error(error)
  }
}

const patchCategory = async () => {
  try {
    loadingCategory.value = true;

    const body = {
      id: category.id,
      name: category.name,
      type: category.type,
      ...(category.description && {
        description: category.description
      })
    }

    const { data } = await categoriesService.patchCategory(body);

    loadingCategory.value = false;

    return data.value
  } catch (error) {
    loadingCategory.value = false;
    console.error(error)
  }
}
const setCategory = async () => {
  if (props.id == 0 || props.id == undefined) {
    saveCategoryRef.value?.resetFields();
    return
  };
  const res = await categoriesService.getCategory(props.id);

  if (res) {
    category.id = res.id;
    category.name = res.name;
    category.description = res.description;
    category.type = res.type;
  }
}

const rules = {
  name: [
    {required: true, message: 'El nombre es obligatorio'},
    { min: 3, message: 'Mínimo 3 letras'}
  ]
}

const saveCategory = async () => {
  if (props.id == 0 || props.id == undefined) {
    await createCategory();
  } else {
    await patchCategory();
  }
  emit('submit');
}

watch( () => props.id, async () => {
  await setCategory();
})

onMounted(async () => {
  await setCategory();
});

</script>

<template>
  <el-form
      label-position="top"
      label-width="auto"
      autocomplete="off"
      status-icon
      @submit.prevent="saveCategory()"
      ref="saveCategoryRef"
      :model="category"
      v-loading="loadingCategory"
      :rules="rules"
    >
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="category.name" placeholder="Ingrese aquí el nombre" prop="name"></el-input>
    </el-form-item>
    <el-form-item label="Tipo" props="type">
      <el-select class="w-full" v-model="category.type">
        <el-option v-for="item in categoryType" :key="item.label" :label="item.label" :value="item.value!"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Descripción" props="description">
      <el-input v-model="category.description" type="textarea"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="!category.name" native-type="submit">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>