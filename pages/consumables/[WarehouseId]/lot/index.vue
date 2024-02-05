<template>
  <el-container direction="vertical" class="p-3">
    <PageHeader name="Agregar consumibles">
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
                <el-col :span="20" :lg="22">
                  <el-row justify="end">
                    <el-select class="w-full" v-model="toAdd.productId" filterable remote
                      placeholder="Por favor escoge una categoría" :loading="loadingProducts"
                      :remote-method="searchProduct">
                      <el-option v-for="item in products.rows" :key="item.id" :label="item.code + ' - ' + item.name"
                        :value="item.id!" />
                    </el-select>
                  </el-row>
                </el-col>
                <el-col :span="4" :lg="2">
                  <el-row justify="end">
                    <el-button type="info" @click="modals.addProduct = true">
                      <Icon name="ep:plus" />
                    </el-button>
                  </el-row>
                </el-col>
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
        <el-form-item label="Descripción">
          <el-input v-model="targets.description">

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


const ProductService = useProducts();
const ConsumableService = useConsumable();
const productService = new ProductService();
const consumableService = new ConsumableService();

const route = useRoute();
const router = useRouter();

const loadingProducts = ref(false);

const modals = reactive({
  addProduct: false,
  save: false
})

const products = reactive<{
  rows: Product[],
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
})

const searchProduct = async (name: string) => {
  const data = await productService.find({
    search: name
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
    await consumableService.checking({
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