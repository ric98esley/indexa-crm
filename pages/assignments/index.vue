<template>
  <el-col class="p-2 w-full">
    <el-col>
      <el-row>
        <el-page-header @back="onBack" class="w-full">
          <template #content>
            <div class="flex items-center">
              <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                Asignaciones
              </span>
            </div>
          </template>
          <template #extra>
            <div class="flex items-center">
              <el-button type="primary" class="ml-2">Exportar a excel</el-button>
            </div>
          </template>
        </el-page-header>
      </el-row>
    </el-col>
    <el-col>
      <el-row>
        <el-table :data="response.assignments.rows" v-loading="loadingAssignments">
          <el-table-column type="index" width="50" />
          <el-table-column type="expand" width="50">
            <template #default="props">
              <el-table :data="props.row.target.specifications" :border="true">
                <el-table-column label="Campo" prop="type.name"></el-table-column>
                <el-table-column label="Valor" prop="value"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="Fecha" :min-width="minWidth">
            <template #default="{ row }">
              {{ new Date(row.checkoutAt).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="Serial" prop="target.serial" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.serial" placeholder="Serial" clearable />
            </template>
            <template #default="{ row }">
              <Copy :text="row.target.serial" />
            </template>
          </el-table-column>
          <el-table-column label="Estado" prop="target.deposit.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.deposit" placeholder="Estado" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Categoría" prop="target.model.category.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.category" placeholder="Categoría" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Marca" prop="target.model.brand.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.brand" placeholder="Marca" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Modelo" prop="target.model.name" :min-width="minWidth">
            <template #header>
              <el-input v-model="filters.model" placeholder="Modelo" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Acciones" :min-width="minWidth">
            <template #default="{ row }">
              <el-row>
                <el-button type="primary" circle>
                  <Icon name="ep:view" />
                </el-button>
                <el-button type="danger" circle @click="" v-role="['auditor', 'superuser']">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:limit="filters.limit"  v-model:offset="filters.offset" :total="response.assignments.total"/>
      </el-row>
    </el-col>
  </el-col>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const route = useRoute();
const router = useRouter();

const loadingAssignments = ref(false)
const minWidth = ref(120);

const response = reactive<{ place: Place, assignments: { total: number, rows: Assignments[] } }>({
  place: {
    isActive: false,
    code: '',
    phone: '',
    rif: '',
    address: ''
  },
  assignments: {
    total: 0,
    rows: []
  }
})

const onBack = () => {
  router.back();
}


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
  offset: 1
})

const getAssignments = async ({
  serial = '',
  deposit = '',
  category = '',
  brand = '',
  model = '',
  limit = 10,
  offset = 0
}: {
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  model: string,
  limit: number,
  offset: number
}) => {
  try {
    loadingAssignments.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Assignments }>(`/orders/assignments`, {
      params: {
        ...(serial != '' && serial && {
          serial
        }),
        ...(model != '' && model && {
          model
        }),
        ...(deposit != '' && deposit && {
          deposit
        }),
        ...(category != '' && category && {
          category
        }),
        ...(brand != '' && brand && {
          brand
        }),
        ...(offset && {
          offset: (offset - 1) * limit
        }),
        ...(limit && {
          limit
        })
      }
    });
    loadingAssignments.value = false
    return data
  } catch (error) {
    loadingAssignments.value = false
    console.log(error)
  }
}

const setAssignments = async (placeId: number) => {
  const queries = {
    locationId: placeId,
    serial: filters.serial,
    deposit: filters.deposit,
    category: filters.category,
    brand: filters.brand,
    model: filters.model,
    limit: filters.limit,
    offset: filters.offset
  }
  const res = await getAssignments(queries);
  response.assignments.total = res?.value?.total || 0;
  response.assignments.rows = res?.value?.rows || []
}

const print = () => {
  return navigateTo(
    {
      path: `/assignments/${route.params.id}/print`,
      query: {
        total: response.assignments.total,
      }
    },
    {
      open: {
        target: '_blank',
        windowFeatures: {
          popup: true,
          noopener: true,
          noreferrer: true,
        }
      }
    })
}

watch(filters, useDebounce(async () => {
  await setAssignments(Number(route.params.id))
}, 500
));

onMounted(() => {
  setAssignments(Number(route.params.id));
})
</script>