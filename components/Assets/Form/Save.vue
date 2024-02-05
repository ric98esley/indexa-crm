<script setup lang="ts">
const props = defineProps({
  open: {
    type: Boolean
  },
  id: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:open'])

const openModal = computed({
  get() {
    return props.open
  },
  set(value) {
    emit('update:open', value)
  }
})


const loadingCategories = ref(false);
const loadingBrands = ref(false);
const loadingAsset = ref(false);

const toEdit = reactive<{
  customFields: Specification[],
  locationId?: number
}>({
  customFields: [],
  locationId: undefined
})

const modelSelected = reactive<{
  serial: string,
  categoryId?: number,
  brandId?: number,
  modelId?: number,
  notes: string,
}>({
  serial: '',
  categoryId: undefined,
  brandId: undefined,
  modelId: undefined,
  notes: ''
})

const categories = reactive<{
  total: number,
  rows: Category[]
}>({
  total: 0,
  rows: []
})

const brands = reactive<{
  total: number,
  rows: Brand[]
}>({
  total: 0,
  rows: []
})
const models = reactive<{
  total: number,
  rows: Model[]
}>({
  total: 0,
  rows: []
})

const CategoriesServices = useCategories();
const BrandsServices = useBrands();
const ModelsServices = useModels();
const AssetServices = useAssets();
const modelServices = new ModelsServices();
const brandServices = new BrandsServices();
const categoriesServices = new CategoriesServices();
const assetServices = new AssetServices()

const getCategories = async (name?: string) => {
  try {
    const { data } = await categoriesServices.getCategories({
      type: 'asset',
      name
    });

    categories.rows = data.value.rows || [];
    categories.total = data.value.total || 0;
  } catch (error) {
    console.log(error);
  }
}
const getBrands = async (name?: string) => {
  try {
    const { data } = await brandServices.getBrands({
      name
    });

    brands.rows = data.value.rows || [];
    brands.total = data.value.total || 0;
  } catch (error) {
    console.log(error);
  }
}
const getModels = async (name?: string) => {
  try {
    const { data } = await modelServices.getModels({
      name,
      categoryId: modelSelected.categoryId,
      brandId: modelSelected.brandId,
      limit: 50
    });

    models.rows = data.value.rows || [];
    models.total = data.value.total || [];
  } catch (error) {
    console.log(error);
  }
}

const getAsset = async () => {
  try {
    loadingAsset.value = true;

    const asset = await assetServices.finOne({
      id: props.id
    });

    if (asset?.value?.model?.category && !categories.rows.find((category) => category.id == asset?.value?.model?.category.id)) {
      categories.rows.push(asset?.value?.model?.category);
    }
    if (asset?.value?.model?.brand && !brands.rows.find((model) => model.id == asset?.value?.model?.brand.id)) {
      brands.rows.push(asset?.value?.model?.brand);
    }
    if (asset?.value?.model && !models.rows.find((model) => model.id == asset?.value?.model?.id)) {
      models.rows.push(asset?.value?.model);
    }

    modelSelected.categoryId = asset?.value?.model?.category.id || undefined;
    modelSelected.brandId = asset?.value?.model?.brand.id || undefined;
    modelSelected.modelId = asset?.value?.model?.id || undefined;
    modelSelected.serial = asset?.value?.serial || '';
    modelSelected.notes = asset?.value?.notes || '';

    loadingAsset.value = false;
  } catch (error) {
    loadingAsset.value = false;
    console.log(error)
  }
}

const patchAsset = async () => {
  try {
    await assetServices.patchAsset({
      id: props.id,
      modelId: modelSelected.modelId,
      notes: modelSelected.notes
    })
  } catch (error) {
    console.log(error)
  }
}

watch(() => modelSelected.categoryId, () => {
  if (!modelSelected.categoryId) {
    modelSelected.brandId = undefined;
    modelSelected.modelId = undefined;
  }
})

watch(() => props.open, async () => {
  if (openModal.value) {
    await getAsset()
  } else {
    modelSelected.categoryId = undefined;
    modelSelected.serial = '';

    categories.rows = [];
    brands.rows = [];
    models.rows = [];
  };
})
</script>
<template>
  <el-dialog v-model="openModal">
    <template #header>
      <h2>Editar activo</h2>
    </template>
    <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" locations-icon
      @submit.prevent="patchAsset()" v-loading="loadingAsset">
      <el-form-item label="Serial">
        <el-input name="serial" :disabled="true" v-model="modelSelected.serial"></el-input>
      </el-form-item>
      <el-form-item label="Categoría">
        <el-select v-model="modelSelected.categoryId" class="select-success" placeholder="Selecciona una categoría"
          :loading="loadingCategories" label="Deposito" style="width: 100%" filterable remote
          :remote-method="getCategories" clearable>
          <el-option v-for="option in categories.rows" :key="option.id" :value="option.id!"
            :label="`${option.id} - ${option.name}`">
            {{ option.id }} - {{ option.name }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Marca">
        <el-select v-model="modelSelected.brandId" class="select-success" placeholder="Selecciona una categoría"
          :loading="loadingBrands" label="Deposito" style="width: 100%" filterable remote :remote-method="getBrands"
          clearable>
          <el-option v-for="option in brands.rows" :key="option.id" :value="option.id!"
            :label="`${option.id} - ${option.name}`">
            {{ option.id }} - {{ option.name }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Modelo">
        <el-select v-model="modelSelected.modelId" class="select-success" placeholder="Selecciona un modelo"
          label="Deposito" style="width: 100%" filterable remote :remote-method="getModels">
          <el-option v-for="option in models.rows" :key="option.id" :value="option.id!"
            :label="`${option.id} - ${option.name}`">
            {{ option.id }} - {{ option.name }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="field.name" v-for="field in toEdit.customFields">
        <el-input v-model="field.value"></el-input>
      </el-form-item>
      <el-form-item label="Notas  (Numero de teléfono, otro IMEI)">
        <el-input v-model="modelSelected.notes" placeholder="Información que permita identificar el activo">
        </el-input>
      </el-form-item>
      <el-row justify="space-between" align="middle">
        <el-form-item>
          <el-button type="primary" :disabled="!modelSelected.modelId" native-type="submit">Guardar</el-button>
        </el-form-item>
      </el-row>
    </el-form>
  </el-dialog>
</template>