<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array
  }
});
const emit = defineEmits(['remove']);

const removeItem = (index: number) => {
  emit('remove', index)
}
</script>

<template>
  <el-table :data="props.data">
    <el-table-column label="Serial" prop="serial">
      <template #default="{ row }">
        <el-input v-model="row.serial"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="Notas" props="notes">
      <template #default="{ row }">
        <el-input v-model="row.notes"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="Modelo">
      <template type="text" #default="{ row }">
        <ModelItemsSelect v-model:model-id="row.modelId" />
      </template>
    </el-table-column>
    <el-table-column label="Estado">
      <template type="text" #default="{ row }">
        <LocationItemsSelect v-model:location-id="row.locationId"/>
      </template>
    </el-table-column>
    <el-table-column header-align="right" width="80">
      <template #default="{ $index }">
        <div class="text-right">
          <el-tooltip content="Eliminar" :open-delay="300" placement="top" class="text-right">
            <el-button type="danger" @click="removeItem($index)">
              <Icon name="ep:delete" />
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>