<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <LocationTableView v-model:filters="filters" redirect="consumables" :locations="warehouses.rows"
        :total="warehouses.total" :loading="loadingWarehouses" />
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permission: ['consumables:read', 'consumables:create', 'consumables:update', 'consumables:delete'],
});

const ConsumableService = useConsumable();

const consumableService = new ConsumableService();

const filters = reactive({
  limit: 10,
  offset: 1,
  code: '',
  group: '',
  name: '',
  address: '',
  email: '',
});


const loadingWarehouses = ref(false);

const warehouses = reactive<{ rows: Place[], total: number }>({
  rows: [],
  total: 0
})

const setWarehouses = async () => {
  try {
    loadingWarehouses.value = true;
    const places = await consumableService.getLocations(filters);
    warehouses.rows = places?.rows || [];
    warehouses.total = places?.total || 0;
  } catch (error) {
    console.log(error)
  } finally {
    loadingWarehouses.value = false;
  }
}
watch(filters, useDebounce(async () => {
  await setWarehouses()
}, 500)
)

onMounted(async () => {
  await setWarehouses();
});
</script>