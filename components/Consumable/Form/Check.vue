<script setup lang="ts">
const props = defineProps({
  showQuantity: {
    type: Boolean
  }
})

const ProductService = useProducts();
const productService = new ProductService();

const emit = defineEmits({
  submit: ({
    productId,
    quantity
  }: {
    productId?: number,
    quantity?: number
  }) => {
    if (!productId && !quantity) {

    } else {
      return true;
    }
  }
});

const modals = reactive({
  addProduct: false,
  save: false
})

const loadingProducts = ref(false);

const toAdd = reactive<{
  productId?: number,
  quantity: string
}>({
  productId: undefined,
  quantity: ''
});

const products = reactive<{
  rows: Product[],
  total: number
}>({
  rows: [],
  total: 0
});

const searchProduct = async (name: string) => {
  const data = await productService.find({
    search: name
  })

  products.rows = data?.rows || [];
  products.total = data?.total || 0;
}

const addToList = () => {
  const newTarget = JSON.parse(JSON.stringify(toAdd));

}
</script>
<template>
  <el-col>
    <el-form label-position="top" @submit.prevent="addToList">
      <el-form-item label="Producto">
        <el-row justify="space-between" class="w-full">
          <el-col :span="20" :lg="22">
            <el-row justify="end">
              <el-select class="w-full" v-model="toAdd.productId" filterable remote
                placeholder="Por favor escoge un producto" :loading="loadingProducts" :remote-method="searchProduct">
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
    <el-dialog v-model="modals.addProduct">
      <ProductFormSave></ProductFormSave>
    </el-dialog>
  </el-col>
</template>