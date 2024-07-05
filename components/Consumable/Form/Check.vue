<script setup lang="ts">
const props = defineProps({
  showMin: {
    type: Boolean
  },
  showOnInventory: {
    type: Boolean
  },
  // Solo se usa en caso de mostrar los productos en inventario
  warehouseId: {
    type: Number
  }
})

const ProductService = useProducts();
const ConsumableService = useConsumable();
const productService = new ProductService();
const consumableService = new ConsumableService();


const addFormRef = ref();

const emit = defineEmits({
  submit: ({
    productId,
    quantity,
    min
  }: {
    productId?: number;
    quantity?: string;
    min?: string;
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
  productId?: number;
  quantity: string;
  min?: string;
}>({
  productId: undefined,
  quantity: '',
  min: undefined
});

const products = reactive<{
  rows: Product[],
  total: number
}>({
  rows: [],
  total: 0
});

const productsOnInventory = reactive<{
  rows: Consumable[],
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

const searchProductOnInventory = async (search: string) => {
  const data = await consumableService.findOneInventory({
    id: props.warehouseId,
    search
  })

  productsOnInventory.rows = data?.rows || [];
  productsOnInventory.total = data?.total || 0;
}

const addToList = () => {
  emit('submit', {
    productId: toAdd.productId,
    quantity: toAdd.quantity,
    min: toAdd.min
  })
}

const rules = {
  productId: [
    { required: true, message: 'Por favor selecciona un producto', trigger: 'blur' },
  ],
  quantity: [
    { required: true, message: 'Por introduce una cantidad', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: 'Debe de ser de tipo numérico' }
  ],
  min: [
    { pattern: /^[0-9]+$/, message: 'Debe de ser de tipo numérico' }
  ],
}


</script>
<template>
  <el-col>
    <el-form label-position="top" require-asterisk-position="right" @submit.prevent="addToList" :model="toAdd"
      :rules="rules" ref="addFormRef">
      <el-form-item label="Producto" prop="productId" v-if="props.showOnInventory">
        <el-row justify="space-between" class="w-full" >
          <el-select class="w-full" v-model="toAdd.productId" filterable remote placeholder="Por favor escoge un producto"
            :loading="loadingProducts" :remote-method="searchProductOnInventory">
            <el-option v-for="item in productsOnInventory.rows" :key="item.product.id"
              :label="item.product.code + ' - ' + item.product.name" :value="item.product.id!" />
          </el-select>
        </el-row>
      </el-form-item>
      <el-form-item label="Producto" prop="productId" v-else>
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
      <el-form-item label="Cantidad" prop="quantity">
        <el-input v-model="toAdd.quantity">
        </el-input>
      </el-form-item>
      <el-form-item label="Mínimo" v-if="props.showMin" prop="min">
        <el-input v-model="toAdd.min" type="number">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit"
          :disabled="((Number(toAdd.quantity) <= 0) || !toAdd.quantity || !toAdd.productId)">Agregar</el-button>
      </el-form-item>
    </el-form>
    <el-dialog v-model="modals.addProduct">
      <ProductFormSave></ProductFormSave>
    </el-dialog>
  </el-col>
</template>