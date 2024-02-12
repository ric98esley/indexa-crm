<template>
  <el-container direction="vertical" class="p-3">
    <PageHeader name="Remover consumibles">
      <template #buttons>
        <el-button type="warning" @click="modals.save = true" :disabled="targets.rows.length <= 0">Guardar</el-button>
      </template>
    </PageHeader>
    <el-row :gutter="8" class="mt-4">
      <el-col :span="8">
        <el-card>
          <ConsumableFormCheck :warehouse-id="Number(warehouseId)" @submit="addToList" show-on-inventory />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <ConsumableTableCheck :data="targets.rows" @delete="removeTarget" />
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="modals.save">
      <ConsumableFormLot @submit="checkout" />
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['consumables:read']
});

interface newTarget {
  productId?: number;
  quantity?: string,
  min?: string
}

const ConsumableService = useConsumable();
const consumableService = new ConsumableService();

const route = useRoute();

const warehouseId = route.params.WarehouseId;


const modals = reactive({
  addProduct: false,
  save: false
})

const targets = reactive<{
  rows: newTarget[]
}>({
  rows: [],
})


const removeTarget = (index: number) => {
  if (index !== -1) {
    targets.rows.splice(index, 1);
  }
}

const addToList = ({
  productId,
  quantity,
  min
}: newTarget) => {
  const newTarget: newTarget = {
    productId,
    quantity,
    ...(min && {
      min
    })
  };
  if (min) newTarget.min = min;

  targets.rows.push(newTarget);
}

const checkout = async ({ customer, description }: { customer: string; description: string }) => {
  try {
    await consumableService.checkout({
      id: Number(warehouseId),
      customer,
      description,
      ...targets
    })

    targets.rows = [];
  } catch (error) {
    console.log(error)
  }
}
</script>