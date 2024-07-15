<script setup lang="ts">
const AssetServices = useAssets();
const assetServices = new AssetServices();

const emit = defineEmits(['delete', 'refresh',]);

const props = defineProps({
   data: {
     type: Array,
     required: true
   }
 })

const remove = async (id: number) => {
  emit('delete', id);
}

</script>

<template>
  <el-table :data="props.data">
    <el-table-column prop="type.name" />
    <el-table-column prop="value" />
    <el-table-column label="Acciones" width="150" stripe>
          <template #default="{ row }">
            <el-row justify="space-around">
              <el-button type="danger" circle @click="remove(row.typeId)" v-can="['locations:delete']">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
  </el-table>
</template>