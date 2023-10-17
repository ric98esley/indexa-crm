<template>
  <el-container class="p-4">
    <el-row :gutter="10">
      <el-col :span="24">
        <el-row>
          <el-page-header @back="onBack" class="w-full">
            <template #content>
              <div class="flex items-center">
                <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                  {{ response.place.code }} - {{ response.place.name }}
                </span>
                <el-tag>{{ response.place.type?.name }}</el-tag>
              </div>
            </template>
            <template #extra>
              <div class="flex items-center">
                <el-button @click="print()">Imprimir inventario</el-button>
                <el-button type="primary" class="ml-2">Editar</el-button>
              </div>
            </template>
            <el-descriptions :column="3" border>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="mdi-light:eye" />
                    Código
                  </div>
                </template>
                {{ response.place?.code }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:phone" />
                    Teléfono
                  </div>
                </template>
                <Copy :text="response.place?.phone" />
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:school" />
                    Agencia
                  </div>
                </template>
                {{ response.place?.name }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:connection" />
                    Grupo
                  </div>
                </template>
                {{ response.place?.group?.code }} - {{ response.place?.group?.name }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:user" />
                    Responsable
                  </div>
                </template>
                {{ response.place?.manager?.name }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:info-filled" />
                    Tipo
                  </div>
                </template>
                {{ response.place?.type?.name }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:location" />
                    Zona
                  </div>
                </template>
                {{ response.place?.zone?.name }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <Icon name="ep:place" />
                    Dirección
                  </div>
                </template>
                {{ response.place?.address }}
              </el-descriptions-item>
            </el-descriptions>
          </el-page-header>
        </el-row>
      </el-col>
      <el-col>
        <h2 class="m-4">Activos en préstamo</h2>
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
            <el-table-column label="Fecha" width="120">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="Serial" prop="target.serial">
              <template #header>
                <el-input v-model="filters.serial" placeholder="Serial" clearable />
              </template>
              <template #default="{ row }">
                <Copy :text="row.target.serial" />
              </template>
            </el-table-column>
            <el-table-column label="Estado" prop="target.deposit.name">
              <template #header>
                <el-input v-model="filters.deposit" placeholder="Estado" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Categoría" prop="target.model.category.name">
              <template #header>
                <el-input v-model="filters.category" placeholder="Categoría" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Marca" prop="target.model.brand.name">
              <template #header>
                <el-input v-model="filters.brand" placeholder="Marca" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Modelo" prop="target.model.name">
              <template #header>
                <el-input v-model="filters.model" placeholder="Modelo" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Acciones">
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
          <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
            :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
            layout="total, sizes, prev, pager, next, jumper" :total="response.assignments.total" />
        </el-row>
        <el-divider />
        <h2 class="m-4">Préstamos anteriores</h2>
        <el-row>
          <el-table :data="response.last.rows" v-loading="loadingAssignmentsLast">
            <el-table-column type="index" width="50" />
            <el-table-column type="expand" width="50">
              <template #default="props">
                <el-table :data="props.row.target.specifications" :border="true">
                  <el-table-column label="Campo" prop="type.name"></el-table-column>
                  <el-table-column label="Valor" prop="value"></el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column label="Fecha" width="120">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="Serial" prop="target.serial">
              <template #header>
                <el-input v-model="filters2.serial" placeholder="Serial" clearable />
              </template>
              <template #default="{ row }">
                <Copy :text="row.target.serial" />
              </template>
            </el-table-column>
            <el-table-column label="Estado" prop="target.deposit.name">
              <template #header>
                <el-input v-model="filters2.deposit" placeholder="Estado" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Categoría" prop="target.model.category.name">
              <template #header>
                <el-input v-model="filters2.category" placeholder="Categoría" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Marca" prop="target.model.brand.name">
              <template #header>
                <el-input v-model="filters2.brand" placeholder="Marca" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Modelo" prop="target.model.name">
              <template #header>
                <el-input v-model="filters2.model" placeholder="Modelo" clearable />
              </template>
            </el-table-column>
            <el-table-column label="Acciones">
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
          <el-pagination class="m-4" v-model:current-page="filters2.offset" v-model:page-size="filters2.limit"
            :page-sizes="[2, 10, 20, 50, 100, 200, 300, 400]" :background="true"
            layout="total, sizes, prev, pager, next, jumper" :total="response.last.total" />
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

const route = useRoute();
const router = useRouter();

const loadingAssignments = ref(false)
const loadingAssignmentsLast = ref(false)

const response = reactive<{ place: Place, assignments: { total: number, rows: Assignments[] }, last: { total: number, rows: Assignments[] } }>({
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

const getPlace = async ({
  locationId
}: {
  locationId?: number
}) => {
  const { data, error } = await useFetch<Place>(`/locations/${locationId}`)
  return data
}
const getPlaceAssignments = async ({
  locationId,
  serial = '',
  deposit = '',
  category = '',
  brand = '',
  model = '',
  limit = 10,
  offset = 0,
  type,
  all,
}: {
  locationId?: number
  serial: string,
  deposit: string,
  category: string,
  brand: string,
  model: string,
  type?: string,
  all?: boolean,
  limit: number,
  offset: number
}) => {
  try {
    const { data, error } = await useFetch<{ total: number, rows: Assignments }>(`/locations/${locationId}/assets`, {
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
        ...(all && {
          all
        }),
        ...(type != '' && type && {
          type
        }),
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
    loadingAssignmentsLast.value = false
    console.log(error)
  }
}


const setPlace = async (placeId: number) => {
  response.place = await getPlace({ locationId: placeId })
}
const setPlaceAssignments = async (placeId: number) => {
  loadingAssignments.value = true;

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
  const res = await getPlaceAssignments(queries);
  response.assignments.total = res?.value?.total || 0;
  response.assignments.rows = res?.value?.rows || []
  loadingAssignments.value = false

}
const setPlaceAssignmentsLast = async (placeId: number) => {
  loadingAssignmentsLast.value = true;

  const queries = {
    locationId: placeId,
    serial: filters2.serial,
    deposit: filters2.deposit,
    category: filters2.category,
    brand: filters2.brand,
    model: filters2.model,
    type: 'checking',
    all: true,
    limit: filters2.limit,
    offset: filters2.offset
  }
  const res = await getPlaceAssignments(queries);
  response.last.total = res?.value?.total || 0;
  response.last.rows = res?.value?.rows || []
  loadingAssignmentsLast.value = false;
}

const print = () => {
  return navigateTo(
    {
      path: `/places/${route.params.id}/print`,
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
  await setPlaceAssignments(Number(route.params.id))
}, 500
))
watch(filters2, useDebounce(async () => {
  loadingAssignmentsLast.value = true;

  await setPlaceAssignmentsLast(Number(route.params.id))
  loadingAssignmentsLast.value = false;
}, 500
))

onMounted(() => {
  setPlace(Number(route.params.id));
  setPlaceAssignments(Number(route.params.id))
  setPlaceAssignmentsLast(Number(route.params.id))
})
</script>