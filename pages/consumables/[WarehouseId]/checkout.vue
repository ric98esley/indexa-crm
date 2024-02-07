<template>
  <el-container direction="vertical" class="p-3">
    <PageHeader name="Remover consumibles">
      <template #buttons>
        <el-button type="warning" @click="modals.save = true">Guardar</el-button>
      </template>
    </PageHeader>
    <el-row :gutter="8" class="mt-4">
      <el-col :span="8">
        <el-card>
          <el-form label-position="top" @submit.prevent="addToList">
            <el-form-item label="Producto">
              <el-row justify="space-between" class="w-full">
                <el-select class="w-full" v-model="toAdd.productId" filterable remote
                  placeholder="Por favor escoge un producto" :loading="loadingProducts" :remote-method="searchProduct">
                  <el-option v-for="item in products.rows" :key="item.product.id" :label="item.product.code + ' - ' + item.product.name"
                    :value="item.product.id!" />
                </el-select>
              </el-row>
            </el-form-item>
            <el-form-item label="Cantidad">
              <el-input v-model="toAdd.quantity" type="number">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="submit" :disabled="Number(toAdd.quantity) < 0">Agregar</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <el-table :data="targets.rows">
            <el-table-column label="Producto" prop="productId">
              <template #default="{ row }">
                <ConsumableTableItem :id="row.productId"></ConsumableTableItem>
              </template>
            </el-table-column>
            <el-table-column label="Cantidad" prop="quantity"></el-table-column>
            <el-table-column header-align="right" width="80">
              <template #default="{ row }">
                <div class="text-right">
                  <el-tooltip content="Eliminar" :open-delay="300" placement="top" class="text-right">
                    <el-button type="danger" @click="removeTarget(row)">
                      <Icon name="ep:delete" />
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="modals.addProduct">
      <ProductFormSave></ProductFormSave>
    </el-dialog>
    <el-dialog v-model="modals.save">
      <el-form label-position="top" @submit.prevent="checking">
        <el-form-item label="Dirigido a">
          <el-input v-model="targets.customer">

          </el-input>
        </el-form-item>
        <el-form-item label="Notas">
          <el-input v-model="targets.description" type="textarea">

          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">
            Guardar
          </el-button>
        </el-form-item>
      </el-form>
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

const ConsumableService = useConsumable();
const consumableService = new ConsumableService();

const route = useRoute();

const loadingProducts = ref(false);

const modals = reactive({
  addProduct: false,
  save: false
})

const products = reactive<{
  rows: Consumable[],
  total: number
}>({
  rows: [],
  total: 0
});

const targets = reactive<{
  customer: string,
  description: string,
  rows: {
    productId: number,
    quantity: string
  }[]
}>({
  rows: [],
  customer: '',
  description: ''
})

const toAdd = reactive<{
  productId?: number,
  quantity: string
}>({
  productId: undefined,
  quantity: ''
});

const removeTarget = (row: any) => {
  const index = targets.rows.indexOf(row);
  console.log(index)
  if (index !== -1) {
    targets.rows.splice(index, 1);
  }
}

const searchProduct = async (search: string) => {
  const data = await consumableService.findOneInventory({
    id: route.params.WarehouseId.toString(),
    search
  })

  products.rows = data?.rows || [];
  products.total = data?.total || 0;
}

const addToList = () => {
  const newTarget = JSON.parse(JSON.stringify(toAdd));
  targets.rows.push(newTarget);
}

const checking = async () => {
  try {
    await consumableService.checkout({
      id: Number(route.params.WarehouseId),
      ...targets
    })

    targets.rows = [];
    targets.customer = '';
    targets.description = '';
  } catch (error) {
    console.log(error)
  }
}
</script>