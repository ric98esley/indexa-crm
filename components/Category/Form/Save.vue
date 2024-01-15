<script setup lang="ts">
import { FormInstance } from 'element-plus';

const props = defineProps({
  id: {
    type: Number,
  }
})

const emit = defineEmits(['submit'])

const saveCategoryRef =  ref<FormInstance>();

const CategoriesService = useCategories();
const SpecificationService = useSpecifications();

const specificationsService = new SpecificationService();
const categoriesService = new CategoriesService()
const loadingCategory = ref(false);
const loadingCustomFields = ref(false);

const category = reactive<{
  id?: number,
  name?: string,
  description: string
  customFields: number[],
  removeFields: number[],
  type: string
}>({
  id: undefined,
  name: '',
  description: '',
  customFields: [],
  removeFields: [],
  type: ''
});

const categoryType = [
  { label: "Activo", value: "asset" },
  { label: "Consumible", value: "consumable" },
  { label: "Accesorio", value: "accessory" }
];

const specification = reactive<{
  rows: Specification[],
  total: number,
}>({
  rows: [],
  total: 0
})

const createCategory = async () => {
  try {
    loadingCategory.value = true;

    const { data } = await categoriesService.createCategory({
      name: category.name,
      customFields: category.customFields,
      description: category.description,
      type: category.type
    })

    loadingCategory.value = false;

    category.id = undefined;
    category.name = '';
    category.customFields = [];
    category.removeFields = [];
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
      customFields: category.customFields,
      removeFields: category.removeFields,
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

const setSpecification = async (name: string) => {
  try {
    loadingCustomFields.value = true;
    const data = await specificationsService.getSpecification({ name });

    if (!data) throw new Error();

    specification.rows = data?.rows || [];
    specification.total = data?.total || 0;

    loadingCustomFields.value = false;
  } catch (error) {
    console.log(error);
  }
}

const removeField = (field: number) => {
  category.removeFields?.push(field)
}

const setCategory = async () => {
  if (props.id == 0 || props.id == undefined) {
    saveCategoryRef.value?.resetFields();
    return
  };
  const res = await categoriesService.getCategory(props.id);

  if (res) {
    const fields = res.customFields!.map((field) => field.id!)
    specification.rows = res.customFields || [];
    category.id = res.id;
    category.name = res.name;
    category.description = res.description;
    category.customFields = fields;
    category.type = res.type;
  }
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
    >
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="category.name" placeholder="Ingrese aquí el nombre"></el-input>
    </el-form-item>
    <el-form-item label="Campos personalizados" v-if="category.type === 'asset'" props="customFields">
      <el-select class="w-full" v-model="category.customFields" multiple filterable reserve-keyword
        placeholder="Por favor escoge un campo personalizado" :loading="loadingCustomFields" @remove-tag="removeField"
        remote :remote-method="(name: string) => setSpecification(name)">
        <el-option v-for="item in specification.rows" :key="item.id" :label="item.name" :value="item.id!" />
      </el-select>
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