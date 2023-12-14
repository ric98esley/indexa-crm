<template>
  <el-container class="p-4">
    <el-row class="p-2 w-full">
      <!-- Esta componente tiene el PageHeader -->
      <AssetsDescription :id="Number(route.params.id)"></AssetsDescription>
      <el-col>
        <h2 class="m-4">Historial de prestamos</h2>
        <el-row>
          <el-table :data="movements.rows" v-loading="loadingAssignments">
            <el-table-column type="index" width="50" />
            <el-table-column type="expand">
              <template #default="{ row }">
                Lugar de origen: {{ row.from.code }} - {{ row.from.name }}
              </template>
            </el-table-column>
            <el-table-column label="Fecha" min-width="120">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="Tipo" width="80">
              <template #default="{ row }">
                {{ row.type == 'checkout' ? 'Salida' : 'Entrada' }}
              </template>
            </el-table-column>
            <el-table-column label="Procedencia" min-width="120">
              <template #default="{ row }">
                <Nuxt-Link :to="`/places/${row.to.id}`">
                  <span class="text-teal-500 underline">
                    {{ row.to?.code }} - {{ row.to?.name }} / {{ row.to?.group?.code }} {{
                      row.to?.group.name }}
                  </span>
                </Nuxt-Link>
              </template>
            </el-table-column>
            <el-table-column label="Realizado por" min-width="120">
              <template #default="{ row }">
                {{ row.createdBy.username }}
              </template>
            </el-table-column>
          </el-table>
          <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="movements.total" />
        </el-row>
      </el-col>
    </el-row>
  </el-container>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});


const AssetServices = useAssets();
const assetServices = new AssetServices();

const route = useRoute();

const loadingAssignments = ref(false)

const movements = reactive<{
  rows: Assignments[],
  total: number
}>({
  rows: [],
  total: 0
})

const filters = reactive<{
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  model: string,
  limit: number,
  offset: number
}>({
  serial: '',
  deposit: '',
  category: '',
  brand: '',
  model: '',
  limit: 10,
  offset: 0
})

const getAssetMovements = async (assetId?: number) => {
  try {
    if (!assetId) return;
    const queries = {
      id: assetId,
      limit: filters.limit,
      offset: filters.offset,
      all: true,
      paranoid: false,
    }
    loadingAssignments.value = true;
    const res = await assetServices.getAssetMovements(queries);
    movements.rows = res?.value?.rows || [];
    movements.total = res?.value?.total || 0;
    loadingAssignments.value = false
  } catch (error) {
    loadingAssignments.value = false;
    console.log(error);
  }
}

watch(filters, useDebounce(async () => {
  await getAssetMovements(Number(route.params.id))
}, 500
))

onMounted(async () => {
  // setAsset(Number(route.params.id));
  await getAssetMovements(Number(route.params.id));
})
</script>