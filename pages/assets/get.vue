<template>
  <el-col :gutter="20">
    <el-row :span="24" class="p-4">
      <el-card class="w-full">
        <el-table :data="response.rows" v-loading="loadingAssets" :row-class-name="assetStatus">
          <el-table-column type="index" width="50" />
          <el-table-column type="expand" width="50">
            <template #default="props">
              <el-table :data="props.row.specifications" :border="true">
                <el-table-column label="Campo" prop="type.name"></el-table-column>
                <el-table-column label="Valor" prop="value"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="Serial" prop="serial">
            <template #header>
              <el-input v-model="filters.serial" placeholder="Serial" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Estado" prop="deposit.name">
            <template #header>
              <el-input v-model="filters.deposit" placeholder="Estado" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Categoría" prop="model.category.name">
            <template #header>
              <el-input v-model="filters.category" placeholder="Categoría" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Marca" prop="model.brand.name">
            <template #header>
              <el-input v-model="filters.brand" placeholder="Marca" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Modelo" prop="model.name">
            <template #header>
              <el-input v-model="filters.model" placeholder="Modelo" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
            <template #default="{ row }">
              <el-row>
                <el-button type="primary" circle @click="addAssignment(row)" :disabled="assetsId.includes(row.id)">
                  <Icon name="ep:plus" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[2, 5, 10]" :background="true" layout="total, sizes, prev, pager, next, jumper"
          :total="response.total" />
      </el-card>

    </el-row>
    <el-row :span="24" class="p-4">
      <el-card class="w-full">
        <template #header>
          <el-row justify="end">
            <el-button type="primary" :disabled="assetsCount == 0" @click="modals.get = true">Recibir</el-button>
          </el-row>
        </template>
        <template #default>
          <el-table :data="assignments.assets">
            <el-table-column type="index" width="50" />
            <el-table-column type="expand" width="50">
              <template #default="props">
                <el-table :data="props.row.specifications" :border="true">
                  <el-table-column label="Campo" prop="type.name"></el-table-column>
                  <el-table-column label="Valor" prop="value"></el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column label="Serial" prop="serial">
            </el-table-column>
            <el-table-column label="Estado" prop="deposit.name">
            </el-table-column>
            <el-table-column label="Categoría" prop="model.category.name">
            </el-table-column>
            <el-table-column label="Marca" prop="model.brand.name">
            </el-table-column>
            <el-table-column label="Modelo" prop="model.name">
            </el-table-column>
            <el-table-column>
              <template #default="{ row }">
                <el-button type="danger" circle @click="deleteAssignment(row)" v-role="['superuser', 'auditor']">
                  <Icon name="ep:delete" />
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-card>
    </el-row>
    <el-container>
      <el-dialog v-model="modals.get">
        <template #header>
          <h2>Buscar </h2>
        </template>
        <template #default>
          <el-form label-width="120px" @submit.prevent="checking()">
            <el-form-item label="Depósitos del activo">
              <el-select v-model="assignments.depositId" class="select-success" placeholder="Selecciona un deposito"
                label="Deposito" style="width: 100%" filterable>
                <el-option v-for="option in response.deposits" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </el-form-item>
            <el-row justify="space-between" align="middle">
              <el-form-item>
                <el-button type="primary" :disabled="!assignments.depositId"
                  native-type="submit">Guardar</el-button>
              </el-form-item>
            </el-row>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
  </el-col>
</template>

<script lang="ts" setup>

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico', 'receptor', 'auditor'],
})

const loadingAssets = ref(true)


const response = reactive<{
  deposits: Deposit[],
  rows: Asset[],
  total: number
}>({
  deposits:[],
  assets: [],
  total: 0
});

const assignments = reactive<{
  assets: Asset[],
  deposit?: Deposit,
  depositId?: number,
}>({
  assets: [],
  deposit: undefined,
  depositId: undefined
})

const modals = reactive({
  edit: false,
  get: false
})

const filters = reactive({
  limit: 2,
  offset: 0,
  serial: '',
  category: '',
  brand: '',
  model: '',
  deposit: ''
})

const assetStatus = ({
  row,
  rowIndex,
}: {
  row: Asset,
  rowIndex: number
}) => {
  if (row.deposit && row.deposit.state === 'archivado') {
    return 'danger-row'
  } else if (row.deposit && row.deposit.state === 'pendiente') {
    return 'warning-row'
  } else if (row.deposit && row.enabled === false) {
    return 'success-row'
  }
  return ''
}

const getAssets = async () => {
  try {
    loadingAssets.value = true;
    const { data, pending, error } = await useFetch<{ assets: Asset[], total: number }>('/assets',
      {
        params: {
          ...(filters.serial != '' && filters.serial && {
            serial: filters.serial
          }),
          ...(filters.model != '' && filters.model && {
            model: filters.model
          }),
          ...(filters.deposit != '' && filters.deposit && {
            deposit: filters.deposit
          }),
          ...(filters.category != '' && filters.category && {
            category: filters.category
          }),
          ...(filters.brand != '' && filters.brand && {
            brand: filters.brand
          }),
          enabled: false,
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit
          })
        }
      }
    );
    response.rows = data.value?.assets || [];
    response.total = data.value?.total || 0;
    loadingAssets.value = false;

    return { data, error, pending }
  } catch (error) {
    loadingAssets.value = false;
  }
}

const addAssignment = (row: Asset) => {
  if (assetsId.value.includes(row.id)) return;

  assignments.assets.push(row);
}

const deleteAssignment = (row: Asset) => {
  const index = assignments.assets.indexOf(row);
  if (index !== -1) {
    assignments.assets.splice(index, 1);
  }
}

const getDeposit = async ({ name }: { name?: string }) => {
  try {
    const { data } = await useFetch<{ total: number, rows: Deposit[] }>('/assets/deposits', {
      params: {
        ...(name != '' && name && {
          name
        })
      }
    });
    return data.value;
  } catch (error) {
    console.log(error);
  }
}

const setDeposit = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getDeposit(search);
  response.deposits = rta?.rows || []
}

const assetsId = computed(() => {
  return assignments.assets.map((asset) => {
    return asset.id;
  });
})

const assetsCount = computed(() => {
  return assignments.assets.length
})


const checking = async () => {
  try {
    const { data, error } = await useFetch<Order>(
      '/orders/checking',
      {
        method: 'post',
        body: {
          targets: assetsId.value,
          depositId: assignments.depositId
        }
      }
    );

    if (error.value) {
      throw new Error()
    }
    ElNotification({
      message: "Activos recibidos correctamente",
    });

    await getAssets();

    assignments.assets = [];
    assignments.depositId = undefined;
    assignments.deposit = undefined;
    modals.get = false

    
    if (data.value && data.value.id) return navigateTo(
    {
      path: `/assignments/${data.value.id}/print`,
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
  } catch (error) {
    ElNotification({
      message: "Vuelve a intentarlo mas tarde",
    });
    console.log(error);
  }
}



watch(filters, useDebounce(async () => {
  await getAssets()
}, 500))

onMounted(async () => {
  await getAssets();
  await setDeposit();
})

</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-5);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-5);
}

.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-5);
}
</style>