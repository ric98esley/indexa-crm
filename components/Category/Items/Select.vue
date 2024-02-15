<script setup lang="ts">

const CategoriesServices = useCategories();
const categoriesServices = new CategoriesServices();

const props = defineProps({
  categoryId: {
    type: Number
  }
});

const emit = defineEmits(['update:categoryId'])

const loadingCategories = ref(false);

const categories = reactive<{ rows: Category[], total: number }>({
  rows: [],
  total: 0
});

const categoryId = computed({
  get() {
    return props.categoryId;
  },
  set(value) {
    emit('update:categoryId', value);
  }
})

const getCategories = async (name?: string) => {
  try {
    const { data } = await categoriesServices.getCategories({
      type: 'asset',
      name
    });

    categories.rows = data.value.rows || [];
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <el-select class="w-full" v-model="categoryId" filterable remote placeholder="Por favor escoge una categoría"
    :loading="loadingCategories" :remote-method="getCategories">
    <el-option v-for="item in categories.rows" :key="item.id" :label="item.name" :value="item.id!" />
  </el-select>
</template>