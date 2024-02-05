<script setup lang="ts">

const props = defineProps({
  id: {
    type: Number
  }
});

const product = reactive<Product>({
  name: '',
  code: '',
  unit: '',
  price: '',
  description: '',
  category: {
    name: '',
    description: '',
    type: '',
  }
})

const ProductService = useProducts();
const productService = new ProductService();

const getProduct = async () => {
  try {
    if(!props.id) return;
    const data = await productService.findOne({
      id: props.id
    })

    product.category = data?.category;
    product.name = data?.name || 'Sin nombre';
    product.code = data?.code || 'Sin código';
    product.unit = data?.unit || 'Sin unidad';
  } catch (error) {
    
  }
}

onMounted(async () => {
  await getProduct()
})

</script>

<template>
  <el-container>
    {{ product.code }} - {{ product.name }} - {{ product.category?.name }} - {{ product.unit }}
  </el-container>
</template>
