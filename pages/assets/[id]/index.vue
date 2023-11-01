<template>
  <el-container class="p-4">
    <el-row :gutter="10">
      <el-col :span="24">
        <el-row>
          <el-page-header @back="onBack" class="w-full">
            <template #content>
              <div class="flex items-center">
                <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                  {{ response.asset.serial }}
                </span>
                <el-tag>{{ response.asset?.model?.category?.name }}</el-tag>
              </div>
            </template>
            <template #extra>
              <div class="flex items-center">
                <!-- <el-button @click="print()">Imprimir inventario</el-button> -->
                <!-- <el-button type="primary" class="ml-2">Editar</el-button> -->
              </div>
            </template>
            <el-row class="" :gutter="12">
              <el-col :span="12">
                <h2> Datos del activo</h2>
                <el-descriptions :column="2" border>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <Icon name="mdi-light:eye" />
                        Serial
                      </div>
                    </template>
                    <Copy :text="response.asset?.serial" />
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <Icon name="ep:phone" />
                        Categoría
                      </div>
                    </template>
                    {{ response.asset?.model?.category.name }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <Icon name="ep:phone" />
                        Modelo
                      </div>
                    </template>
                    {{ response.asset?.model?.name }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <Icon name="ep:phone" />
                        Marca
                      </div>
                    </template>
                    {{ response.asset?.model?.brand.name }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <Icon name="ep:phone" />
                        Fecha de creación
                      </div>
                    </template>
                    {{ new Date(response.asset?.createdAt).toLocaleDateString() }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <Icon name="ep:phone" />
                        Deposito del activo
                      </div>
                    </template>
                    {{ response.asset?.deposit?.name }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-col>
              <el-col :span="12">
                <h2> Especificaciones</h2>

                <el-descriptions :column="1" border>
                  <el-descriptions-item v-for="item in response.asset.specifications">
                    <template #label>
                      <div class="cell-item">
                        <Icon name="ep:tools" />
                        {{ item.type.name }}
                      </div>
                    </template>
                    {{ item.value }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-col>

            </el-row>

          </el-page-header>
        </el-row>
      </el-col>
      <el-col>
        <h2 class="m-4">Historial de prestamos</h2>
        <el-row>
          <el-table :data="response.assignments.rows" v-loading="loadingAssignments">
            <el-table-column type="index" width="50" />
            <el-table-column label="Fecha" width="120">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="Tipo" width="80">
              <template #default="{ row }">
                {{ row.type == 'checkout' ? 'Salida' : 'Entrada' }}
              </template>
            </el-table-column>
            <el-table-column label="Procedencia">
              <template #default="{ row }">
                <Nuxt-Link :to="`/places/${row.location.id}`">
                  <span class="text-teal-500 underline">
                    {{ row.location.code }} - {{ row.location.name }} / {{ row.location.group.code }} {{
                      row.location.group.name }}
                  </span>
                </Nuxt-Link>
              </template>
            </el-table-column>
            <el-table-column label="Realizado por" width="120">
              <template #default="{ row }">
                {{ row.createdBy.name }} - {{ row.createdBy.lastName }}
              </template>
            </el-table-column>
            <!-- <el-table-column label="Acciones" width="120">
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
            </el-table-column> -->
          </el-table>
          <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
            :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
            layout="total, sizes, prev, pager, next, jumper" :total="response.assignments.total" />
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
  roles: ['superuser', 'admin', 'asistente', 'auditor', 'receptor'],
});

const route = useRoute();
const router = useRouter();

const loadingAssignments = ref(false)
const loadingAsset = ref(false)

const response = reactive<{ asset: Asset, assignments: { total: number, rows: Assignments[] }, last: { total: number, rows: Assignments[] } }>({
  asset: {
    enabled: false,
    specifications: [],
    countChecking: undefined,
    notes: undefined,
    deposit: undefined,
    model: undefined,
    assignment: undefined,
  },
  assignments: {
    total: 0,
    rows: []
  },
  last: {
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
  offset: 0
})

const filters2 = reactive<{
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

const getAsset = async ({
  assetId
}: {
  assetId?: number
}) => {
  const { data, error } = await useFetch<Place>(`/assets/${assetId}`)
  return data
}
const getAssetAssignments = async ({
  assetId,
  limit = 10,
  offset = 0,
}: {
  assetId?: number
  limit: number,
  offset: number
}) => {
  try {
    const { data, error } = await useFetch<{ total: number, rows: Assignments[] }>(`/assets/${assetId}/assignments`, {
      params: {
        ...(offset && {
          offset: (offset - 1) * limit
        }),
        ...(limit && {
          limit
        })
      }
    });
    return data
  } catch (error) {
    loadingAssignments.value = false
    loadingAsset.value = false
    console.log(error)
  }
}


const setAsset = async (assetId: number) => {
  response.asset = await getAsset({ assetId })
}
const setAssetAssignments = async (assetId: number) => {
  loadingAssignments.value = true;

  const queries = {
    assetId,
    limit: filters.limit,
    offset: filters.offset
  }
  const res = await getAssetAssignments(queries);
  response.assignments.total = res?.value?.total || 0;
  response.assignments.rows = res?.value?.rows || []
  loadingAssignments.value = false
}

const print = () => {
  return navigateTo(
    {
      path: `/assets/${route.params.id}/print`,
      query: {
        total: response.assignments.total,
        all: 'false'
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
  await setAssetAssignments(Number(route.params.id))
}, 500
))

onMounted(() => {
  setAsset(Number(route.params.id));
  setAssetAssignments(Number(route.params.id));
})
</script>