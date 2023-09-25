<template>
  <el-col>

    <el-container direction="vertical">
      <el-table :data="response.assets" v-loading="loading" :row-class-name="assetStatus">
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
              <el-button type="info" circle @click="editAsset(row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeAsset(row.id)" v-role="['auditor', 'superuser']">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="response.total" />
    </el-container>

    <!-- editar activo -->
    <el-container>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar activo</h2>
        </template>
        <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" deposits-icon
          @submit.prevent="patchAsset()">
        <el-form-item label="Modelo">
          <el-cascader v-model="request.toEdit.modelId" :options="response.categories"
            :filter-method="(node, keyword) => node.text.toLowerCase().includes(keyword.toLowerCase())" class="w-full"
            filterable separator=" - " clearable :popper-class="'.hover:bg-sky-700'"
            :on-change="(value) => console.log(value)">
          </el-cascader>
        </el-form-item>
        <el-form-item label="Depósitos del activo">
          <el-select v-model="request.toEdit.depositId" class="select-success" placeholder="Selecciona un deposito"
            label="Deposito" style="width: 100%" filterable>
            <el-option v-for="option in response.deposits" :key="option.id" :value="option.id!"
              :label="`${option.id} - ${option.name}`">
              {{ option.id }} - {{ option.name }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="field.name" v-for="field in request.toEdit.customFields">
          <el-input v-model="field.value"></el-input>
        </el-form-item>
        <el-row justify="space-between" align="middle">
          <el-form-item>
            <el-button type="primary" :disabled="!request.toEdit.modelId || !request.toEdit.depositId"
              native-type="submit">Guardar</el-button>
          </el-form-item>
        </el-row>
        </el-form>
      </el-dialog>
    </el-container>

  </el-col>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico', 'receptor'],
})
const loading = ref(true)

const response = reactive<{
  assets: Asset[],
  total: number
  deposits: Deposit[]
  categories: any[]
}>({
  categories: [],
  deposits: [],
  assets: [],
  total: 0
});

const modals = reactive({
  edit: false
})

const request = reactive<{
  asset?: Asset;
  toEdit: NewAsset
}>({
  asset: undefined,
  toEdit: {
    modelId: [],
    depositId: undefined,
    customFields: []
  }
});


const filters = reactive({
  limit: 10,
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
    loading.value = true;
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
          ...(filters.offset && {
            offset: (filters.offset - 1) * filters.limit
          }),
          ...(filters.limit && {
            limit: filters.limit
          })
        }
      }
    );
    response.assets = data.value?.assets || [];
    response.total = data.value?.total || 0;
    loading.value = false;

    return { data, error, pending }
  } catch (error) {
    loading.value = false;
  }
}

const getCategories = async () => {
  try {
    const { data } = await useFetch<{ count: number, rows: Category[] }>('/assets/categories', {
    });

    const categoriesOptions = data.value?.rows.map((row) => {
      const children = row.brands.map((brand) => {
        const children = brand.models.map((model) => {
          return {
            value: model.id,
            label: model.name
          }
        })
        return {
          value: brand.id,
          label: brand.name,
          ...(!(children.length > 0) && { disabled: true }),
          children
        }
      })
      return {
        value: row.id,
        label: row.name,
        customFields: row.customFields,
        ...(!(children.length > 0) && { disabled: true }),
        children
      }
    }
    );
    response.categories = categoriesOptions || [];
  } catch (error) {
    console.log(error);
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

const editAsset = (row: Asset) => {
  modals.edit = true;
  request.asset = row;

  request.toEdit.modelId = [row.model!.category.id!, row.model!.brand.id!, row.model!.id!];
  request.toEdit.depositId = row.deposit?.id
}


const patchAsset = async () => {
  try {
    loading.value = true;

    const body = {
      depositId: request.toEdit?.depositId,
      modelId: request.toEdit?.modelId![2],
    }

    const { data, error } = await useFetch<Zone>(`/assets/${request.asset!.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loading.value = false;


    if (error.value) {
      throw new Error()
    }
    await getAssets()
    ElNotification({
      title: 'Activo modificado correctamente',
      message: `${data.value?.name}`
    })

    request.toEdit.depositId = undefined;
    request.toEdit.modelId = undefined;
    request.toEdit.customFields = [];
    return data.value
  } catch (error) {
    loading.value = false;
    ElNotification({
      title: 'Error al modificar la zona intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const removeAsset = async (id: number) => {
  try {
    loading.value = true;
    const { data, error } = await useFetch<{message: string}>(`/assets/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      throw new Error('El activo debe de estar disponible y no asignado')
    }

    ElNotification({
      message: data.value?.message
    })
    await getAssets()
  } catch (error) {
    console.log(error)
    loading.value = false;
    ElNotification({
      title: 'Error al ocultar el activo intente de nuevo mas tarde.',
      message: error.message
    })
  }
}

const setDeposit = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getDeposit(search);
  response.deposits = rta?.rows || []
}


watch(filters, useDebounce(async () => {
  await getAssets()
}, 500))

onMounted(async () => {
  await setDeposit()
  await getAssets();
  await getCategories()
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