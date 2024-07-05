<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
  }
});

const emit = defineEmits(['submit']);

const refFormProduct = ref();


const loadingCategories = ref(false);
const loadingProduct = ref(false);
const CategoryServices = useCategories();
const ProductService = useProducts();
const categoryServices = new CategoryServices();
const productService = new ProductService();

const modals = reactive({
  addCategory: false
})

const categories = reactive<{
  rows: Category[],
  total: number
}>({
  rows: [],
  total: 0
})

const product = reactive<{
  name: string,
  code: string,
  price: string,
  description: string,
  categoryId?: number,
  unit: string
}>({
  name: '',
  code: '',
  price: '',
  description: '',
  categoryId: undefined,
  unit: ''
})


const searchCategory = async (name: string) => {
  const { data } = await categoryServices.getCategories({
    name,
    limit: 10,
    offset: 1,
    type: 'consumable'
  })

  categories.rows = data.value.rows;
  categories.total = data.value.total;
}

const createProduct = async () => {
  if (!product.categoryId) return;
  const newProduct = await productService.createProduct(product);
}

const patchProduct = async () => {
  if (!product.categoryId) return;
  if (!props.id) return;
  const patchedProduct = await productService.patch({ id: props.id, ...product });
}

const saveProduct = async () => {
  try {
    if (props.id == 0 || props.id == undefined) {
      await createProduct()
    } else {
      await patchProduct()
    }
  } catch (error) {
    console.log(error)
  } finally {
    emit('submit')
  }
}

const setProduct = async () => {
  try {
    loadingProduct.value = true;

    if (props.id == 0 || props.id == undefined) {
      refFormProduct.value?.resetFields();
      return
    }

    const data = await productService.findOne({ id: props.id });

    categories.rows = [];

    if (!data) return;

    if (data.category) categories.rows.push(data.category);

    product.name = data.name || '';
    product.code = data.code || '';
    product.price = data.price || '';
    product.categoryId = data?.category.id || undefined;
    product.unit = data?.unit || '';
    product.description = data.description || '';

  } catch (error) {
    console.log(error)
  } finally {
    loadingProduct.value = false;
  }
}

watch(() => props.id, async () => {
  await setProduct();
})

onMounted(async () => {
  await setProduct();
})
</script>

<template>
  <el-form label-position="top" @submit.prevent="saveProduct" ref="refFormProduct" :model="product">
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="product.name"></el-input>
    </el-form-item>
    <el-form-item label="Código" prop="code">
      <el-input v-model="product.code"></el-input>
    </el-form-item>
    <el-form-item label="Precio" prop="price">
      <el-input v-model="product.price"></el-input>
    </el-form-item>
    <el-form-item label="Descripción" prop="description">
      <el-input v-model="product.description"></el-input>
    </el-form-item>
    <el-form-item label="Unidad" prop="unit">
      <el-input v-model="product.unit" placeholder="metros, litros..."></el-input>
    </el-form-item>
    <el-form-item label="Categoría" prop="categoryId">
      <el-row justify="space-between" class="w-full">
        <el-col :span="20" :lg="22">
          <el-row justify="end">
            <el-select class="w-full" v-model="product.categoryId" filterable remote
              placeholder="Por favor escoge una categoría" :loading="loadingCategories" :remote-method="searchCategory">
              <el-option v-for="item in categories.rows" :key="item.id" :label="item.name" :value="item.id!" />
            </el-select>
          </el-row>
        </el-col>
        <el-col :span="4" :lg="2">
          <el-row justify="end">
            <el-button type="info" @click="modals.addCategory = true">
              <Icon name="ep:plus" />
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item>
      <el-button native-type="submit" type="primary">Guardar</el-button>
    </el-form-item>
    <el-dialog v-model="modals.addCategory">
      <CategoryFormSave />
    </el-dialog>
  </el-form>
</template>