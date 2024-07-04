<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
  }
});

const emit = defineEmits([
  'submit'
]);

const ModelsServices = useModels();
const CategoryServices = useCategories();
const BrandServices = useBrands();
const modelsServices = new ModelsServices();
const categoryServices = new CategoryServices();
const brandServices = new BrandServices();

const refFormModel = ref();

const loadingCategories = ref(false);
const loadingModels = ref(false);
const loadingBrands = ref(false);

const modals = reactive({
  addCategory: false,
  addBrand: false
})

const model = reactive<{
  id?: number,
  name: string,
  categoryId?: number,
  brandId?: number
}>({
  id: undefined,
  name: '',
  categoryId: undefined,
  brandId: undefined
});

const categories = reactive<{
  rows: Category[],
  total: number
}>({
  rows: [],
  total: 0
})
const brands = reactive<{
  rows: Brand[],
  total: number
}>({
  rows: [],
  total: 0
})

const createModel = async () => {
  try {
    loadingModels.value = true;

    if (!model.name || !model.categoryId || !model.brandId) {
      return
    }

    const data = modelsServices.createModel({
      name: model.name,
      categoryId: model.categoryId,
      brandId: model.brandId
    })

    refFormModel.value?.resetFields();
  } catch (error) {
    loadingModels.value = false;
    ElNotification({
      title: 'Error al crear modelo intente de nuevo mas tarde',
    })
  }
}

const patchModel = async () => {
  try {
    loadingModels.value = true;

    if (props.id == 0 || props.id == undefined) {
      return
    }

    const body = {
      id: props.id,
      name: model.name,
      categoryId: model.categoryId,
      brandId: model.brandId
    }

    const data = modelsServices.updateModel(body);

    refFormModel.value?.resetFields();
  } catch (error) {
    loadingModels.value = false;
    ElNotification({
      title: 'Error al modificar el modelo intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const searchCategory = async (name: string) => {
  const { data } = await categoryServices.getCategories({
    name,
    limit: 10,
    offset: 1
  })

  categories.rows = data.value.rows;
  categories.total = data.value.total;
}

const searchBrand = async (name: string) => {
  const { data } = await brandServices.getBrands({
    name,
    limit: 10,
    offset: 1
  })

  brands.rows = data.value.rows;
  brands.total = data.value.total;
}

const setModel = async () => {
  try {
    loadingModels.value = true;

    if (props.id == 0 || props.id == undefined) {
      refFormModel.value?.resetFields();
      return
    }

    const data = await modelsServices.getModel(props.id);

    categories.rows = [];
    brands.rows = [];

    if(!data) return;

    if(data.category) categories.rows.push(data.category);
    if(data.brand) brands.rows.push(data.brand);

    model.id = data?.id;
    model.name = data.name || '';
    model.categoryId = data?.category.id|| undefined;
    model.brandId = data?.brand.id || undefined;

    loadingModels.value = false;
  } catch (error) {
    console.log(error)
  }
}

const saveModel = async () => {
  if (props.id == 0 || props.id == undefined) {
    await createModel();
  } else {
    await patchModel();
  }
  emit('submit');
}

watch(() => props.id, async () => {
  await setModel();
})

onMounted(async () => {
  await setModel();
})


</script>
<template>
  <el-col :span="24">
    <el-form label-position="top" label-width="auto" autocomplete="off" status-icon @submit.prevent="saveModel()"
      ref="refFormModel" :model="model">
      <el-form-item label="Nombre" prop="name">
        <el-input v-model="model.name" placeholder="Ingrese aquí el nombre"></el-input>
      </el-form-item>
      <el-form-item label="Categoría" prop="categoryId">
        <el-row justify="space-between" class="w-full">
          <el-col :span="20" :lg="22">
            <el-row justify="end">
              <el-select class="w-full" v-model="model.categoryId" filterable remote
                placeholder="Por favor escoge una categoría" :loading="loadingCategories" :remote-method="searchCategory">
                <el-option v-for="item in categories.rows" :key="item.id" :label="item.name" :value="item.id!" />
              </el-select>
            </el-row>
          </el-col>
          <el-col :span="4" :lg="2">
            <el-row justify="end">
              <el-button type="info" @click="modals.addCategory = true">
                <Icon name="ep:plus" />
              </el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="Fabricante" prop="brandId">
        <el-row justify="space-between" class="w-full">
          <el-col :span="20" :lg="22">
            <el-select class="w-full" v-model="model.brandId" filterable remote placeholder="Por favor escoge una marca"
              :loading="loadingBrands" :remote-method="searchBrand">
              <el-option v-for="item in brands.rows" :key="item.id" :label="item.name" :value="item.id!" />
            </el-select>
          </el-col>
          <el-col :span="4" :lg="2">
            <el-row justify="end">
              <el-button type="info" @click="modals.addBrand = true">
                <Icon name="ep:plus" />
              </el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!model.name && !model.categoryId && !model.brandId"
          native-type="submit">Guardar</el-button>
      </el-form-item>
    </el-form>
    <el-dialog v-model="modals.addCategory">
      <template #header>
        <h2>Crear categoría</h2>
      </template>
      <CategoryFormSave></CategoryFormSave>
    </el-dialog>
    <el-dialog v-model="modals.addBrand">
      <template #header>
        <h2>Guardar Fabricante</h2>
      </template>
      <BrandFormSave></BrandFormSave>
    </el-dialog>
  </el-col>
</template>