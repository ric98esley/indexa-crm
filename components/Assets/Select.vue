<script setup lang="ts">
import { on } from 'events';

const AssetService = useAssets();
const assetService = new AssetService();

const props = defineProps({
  modelValue: {
    type: Number,
  }
})

const emit = defineEmits(['update:modelValue', 'select']);

const assets = reactive<{
  rows: Asset[],
  total: number
}>({
  rows: [],
  total: 0
})

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('select', assets.rows.find(asset => asset.id === value))
    emit('update:modelValue', value)
  }
})


const getAssets = async (query: string) => {
  try {
    const data = await assetService.getAssets({ serial: query });

    if (!data?.value) return;
    assets.rows = data.value.rows;
    assets.total = data.value.total;
  } catch (error) {
    console.error(error);
  }
}

const getAsset = async (id: number) => {
  try {
    const data = await assetService.finOne({ id });

    if (!data?.value) return;
    emit('update:modelValue', data.value);
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await getAssets('');
  if (props.modelValue) await getAsset(props.modelValue);
})

</script>


<template>
  <el-select v-model="modelValue" filterable remote :remote-method="getAssets" class="w-full" remote-show-suffix>
    <el-option v-for="item in assets.rows" :key="item.id" :label="item.serial" :value="item.id">
      {{ item.serial }} - {{ item.model?.category.name }} - {{ item.model?.brand.name }} {{ item.model?.name }}
    </el-option>
  </el-select>
</template>