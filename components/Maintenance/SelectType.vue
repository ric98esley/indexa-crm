<script lang="ts" setup>
import { on } from 'events';


const props = defineProps({
  modelValue: {
    type: [String, Number, undefined] as PropType<string | number>,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const maintenanceTypes = reactive<{
  rows: MaintenanceType[],
  total: number
}>({
  rows: [],
  total: 0
})


const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('select', maintenanceTypes.rows.find(type => type.id === value))
    emit('update:modelValue', value)}
})

const getMaintenanceTypes = async (query: string) => {
  try {
    const data = await useFindMaintenanceType({ name: query, limit: 100});
    if (!data) return;
    maintenanceTypes.rows = data.rows;
    maintenanceTypes.total = data.total;
  } catch (error) {
    console.error(error);
  }
}


onMounted(() => {
  getMaintenanceTypes('');
})

</script>


<template>
  <el-select v-model="modelValue" filterable remote :remote-method="getMaintenanceTypes" class="w-full" remote-show-suffix>
    <el-option
      v-for="type in maintenanceTypes.rows"
      :key="type.id"
      :label="type.name"
      :value="type.id"
    />
  </el-select>
</template>