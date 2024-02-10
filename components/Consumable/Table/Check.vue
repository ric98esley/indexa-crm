<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array
  }
})

const emit = defineEmits({
  delete: (id: number) => true
})

const removeTarget = (id: number) => {
  emit('delete', id)
}
</script>

<template>
  <el-table :data="props.data">
    <el-table-column label="Producto" prop="productId">
      <template #default="{ row }">
        <ConsumableTableItem :id="row.productId"></ConsumableTableItem>
      </template>
    </el-table-column>
    <el-table-column label="Cantidad" prop="quantity"></el-table-column>
    <el-table-column header-align="right" width="80">
      <template #default="{ $index }">
        <div class="text-right">
          <el-tooltip content="Eliminar" :open-delay="300" placement="top" class="text-right">
            <el-button type="danger" @click="removeTarget($index)">
              <Icon name="ep:delete" />
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>