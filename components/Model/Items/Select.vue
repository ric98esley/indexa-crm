<script setup lang="ts">
const props = defineProps({
  categoryId: {
    type: Number,
  },
  brandId: {
    type: Number,
  },
  modelId: {
    type: Number,
  },
});

const emit = defineEmits(['update:modelId']);

const loadingModels = ref(false)


const ModelsServices = useModels();
const modelServices = new ModelsServices();

const models = reactive<{
  rows: Model[],
  total: number
}>({
  rows: [],
  total: 0
})

const lastModelId = ref(props.modelId || 0);

const modelId = computed({
  get() {
    if (props.modelId && lastModelId.value != 0 && lastModelId.value != props.modelId) {
      getModel(props.modelId);
      lastModelId.value = props.modelId
    }
    return props.modelId;
  },
  set(value) {
    lastModelId.value = value || 0;
    emit('update:modelId', value);
  }
})

const getModel = async (id: number) => {
  const model = await modelServices.getModel(id);
  if (model) models.rows.push(model);
};

const getModels = async (name?: string) => {
  loadingModels.value = true;
  const { data } = await modelServices.getModels({
    name,
    categoryId: props.categoryId,
    brandId: props.brandId
  });

  models.rows = data.value.rows || [];

  loadingModels.value = false;
}

onMounted(() => {
  if(props.modelId) getModel(props.modelId)
})
</script>

<template>
  <el-select v-model="modelId" class="select-success" placeholder="Selecciona un modelo" label="Deposito"
    style="width: 100%" filterable remote :remote-method="getModels" default-first-option :loading="loadingModels">
    <el-option v-for="option in models.rows" :key="option.id" :value="option.id!"
      :label="`${option.id} - ${option.name}`">
      {{ option.id }} - {{ option.category.name }} - {{ option.brand.name }} - {{ option.name }}
    </el-option>
  </el-select>
</template>