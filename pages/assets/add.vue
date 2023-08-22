<template>
  <el-row :span="24" :gutter="20">
    <el-col :span="24">
      <h1 class="text-2xl m-4">Agregar activos al sistema</h1>
    </el-col>
    <el-col :sm="24" :md="24" :lg="8">
      <el-card>
        <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" :model="asset"
          :rules="rules" status-icon>
          <el-form-item label="Serial">
            <el-input placeholder="Serial" v-model="asset.serial">
            </el-input>
          </el-form-item>
          <el-form-item label="Modelo">
            <el-cascader v-model="asset.modelId" :options="response.categories"
              :filter-method="(node, keyword) => node.text.toLowerCase().includes(keyword.toLowerCase())" class="w-full"
              filterable separator=" - " clearable :popper-class="'.hover:bg-sky-700'"
              :on-change="(value) => console.log(value)">
            </el-cascader>
          </el-form-item>
          <!-- <el-form-item label="Modelo">
            <el-select v-model="asset.modelId" remote filterable class="select-success"
              placeholder="Selecciona una modelo" label="Modelo" style="width: 100%" :remote-method="getModels">
              <el-option v-for="option in response.models" :key="option.id" :value="option.id!"
                :label="`${option.category.name} - ${option.name} - ${option.brand?.name}`">
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="Estatus del activo">
            <el-select v-model="asset.stateId" class="select-success" placeholder="Selecciona un estado" label="Estado"
              style="width: 100%" filterable>
              <el-option v-for="option in status" :key="option.id" :value="option.id!"
                :label="`${option.id} - ${option.name}`">
                {{ option.id }} - {{ option.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-row justify="space-between" align="middle">
            <el-form-item>
              <el-button type="primary" :disabled="!asset.serial || !asset.modelId || !asset.stateId" @click="addAsset()"
                native-type="submit">Agregar</el-button>
            </el-form-item>
            <el-form-item>
              <el-button link plain @click="modals.invoice = true">Facturar</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </el-card>
    </el-col>
    <el-col :sm="24" :md="24" :lg="16">
      <el-card>
        <el-table :data="toAdd.assets">
          <el-table-column label="Serial" prop="serial">
          </el-table-column>
          <el-table-column label="Modelo">
            <template type="text" #default="{ row }">
              <el-cascader v-model="row.modelId" :options="response.categories"
                :filter-method="(node, keyword) => node.text.toLowerCase().includes(keyword.toLowerCase())" class="w-full"
                filterable separator=" - ">
              </el-cascader>
            </template>
          </el-table-column>
          <el-table-column label="Estado">
            <template type="text" #default="{ row }">
              <el-select v-model="row.stateId" class="select-success" placeholder="Selecciona un estado" label="Estados"
                style="width: 100%" name="assetState" filterable>
                <el-option v-for="option in status" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Acciones" header-align="right">
            <template #default="{ row }">
              <div class="text-right">
                <el-tooltip content="Eliminar" :open-delay="300" placement="top" class="text-right">
                  <el-button type="danger" @click="removeAsset(row)">
                    <Icon name="ep:delete" />
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
    <el-dialog v-model="modals.invoice" title="Agregar factura" width="80%">
      <template #header>
        <h2>Datos de la factura</h2>
      </template>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="Factura nueva" name="factura-nueva">
          <el-form label-position="top">
            <el-form-item label="Numero de factura">
              <el-input v-model="toAdd.invoice.code" type="text" clearable></el-input>
            </el-form-item>
            <el-form-item label="Provedor">
              <el-autocomplete type="text" clearable :fetch-suggestions="searchProvider" placeholder="Buscar Provedor"
                @select="handleSelectProvider" v-model="provider.name" class="w-full">
                <template #default="{ item }">
                  <div class="value">
                    <b>{{ item.name }}</b>, <span class="link">{{ item.rif }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="Total de la factura">
              <el-input type="number" v-model="toAdd.invoice.total">
              </el-input>
            </el-form-item>
            <el-form-item label="Fecha de la factura">
              <el-date-picker v-model="toAdd.invoice.invoiceDate" type="date" placeholder="Elige la fecha de facturacion"
                style="width: 100%;"></el-date-picker>
            </el-form-item>

          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Factura antigua" name="factura-antigua">
          <el-form label-position="top">
            <el-form-item label="Buscar factura">
              <el-autocomplete type="text" clearable :fetch-suggestions="searchInvoice" placeholder="Codigo de la factura"
                @select="handleSelectInvoice" v-model="toAdd.invoice.code" class="w-full">
                <template #default="{ item }">
                  <div class="value">
                    <b>{{ item.code }}</b>, <span class="link">{{ item.provider?.name }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-row class="m-1" justify="space-between">
          <el-button @click="addAssets()" type="warning">Guardar</el-button>
          <el-button @click="modals.provider = true" v-if="activeName === 'factura-nueva'" link type="primary">
            Agregar Proveedor
          </el-button>
        </el-row>
      </template>
    </el-dialog>
    <el-dialog v-model="modals.provider">
      <template #header>
        <h2>Agregar Proveedor</h2>
      </template>
      <template #default>
        <el-form @submit.native.prevent="addProvider" label-position="top">
          <el-form-item label="Nombre del proveedor">
            <el-input type="text" label="Nombre" v-model="provider.name">
            </el-input>
          </el-form-item>
          <el-form-item label="R.I.F del proveedor">
            <el-input type="text" label="R.I.F" v-model="provider.rif">
            </el-input>
          </el-form-item>
          <el-button @click="addProvider" type="primary">Agregar proveedor</el-button>
        </el-form>
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, TabsPaneContext } from 'element-plus';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
})

const ruleFormRef = ref<FormInstance>();
const activeName = ref('factura-nueva');

const asset = reactive<NewAsset>({
  serial: undefined,
  modelId: undefined,
  stateId: undefined,
});
const provider = reactive<Provider>({
  name: '',
  rif: ''
});
const modals = reactive({
  invoice: false,
  confirm: false,
  provider: false
})


const response = reactive<{
  models: Model[],
  status: State[]
  categories: any[]
}>({
  categories: [],
  models: [],
  status: []
})
const status = reactive<State[]>([]);

const toAdd = reactive<{
  assets: NewAsset[],
  invoice: Invoice
}>({
  assets: [],
  invoice: {
    id: undefined,
    code: undefined,
    providerId: undefined,
    total: undefined,
    invoiceDate: undefined,
  }
});
const rules = reactive<FormRules<NewAsset>>({
  serial: [
    {
      required: true,
      message: 'Serial invalido',
      trigger: 'blur'
    },
    {
      min: 3,
      message: 'Minimo 3 caracteres',
      trigger: 'blur'
    },
  ]

});

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
const handleSelectProvider = (item: Provider) => {
  Object.assign(provider, item);
  toAdd.invoice.providerId = item.id;
};
const handleSelectInvoice = (item: Invoice) => {
  Object.assign(toAdd.invoice, item);
  toAdd.invoice.providerId = item.id;
}



// const getModels = async (query: string) => {
//   try {
//     const { data } = await useFetch<{ count: number, rows: Model[] }>('/assets/models', {
//       params: {
//         name: query
//       }
//     });
//     response.models = data.value?.rows || [];
//   } catch (error) {
//     console.log(error);
//   }
// }
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
          children
        }
      })
      return {
        value: row.id,
        label: row.name,
        children
      }
    }
    );
    response.categories = categoriesOptions || [];
  } catch (error) {
    console.log(error);
  }
}

const getStatus = async () => {
  try {
    const { data } = await useFetch<State[]>('/assets/status');
    return data.value;
  } catch (error) {
    console.log(error);
  }
}

const searchInvoice = async (queryString: string, cb: (arg: any) => void) => {
  try {
    let toSend = {
      params: {
        ...(queryString && queryString.length > 0 && { code: queryString }),
      },
    };

    const { data, error } = await useFetch<{ count: number, rows: Invoice[] }>('/invoices', toSend);
    cb(data.value?.rows);
  } catch (error) {
    console.log(error);
  }
}

const addProvider = async () => {
  try {
    const newProvider = { ...provider };

    const { data, error } = await useFetch<Provider>('/invoices/providers', {
      method: 'post',
      body: newProvider
    });


    if (error.value) {
      return ElNotification({
        title: 'Poveedor no creado',
        message: `${error.value.data.message.message}`,
        type: 'error'
      });
    }
    if (data.value)
      ElNotification({
        title: 'Poveedor creado',
        message: `nombre: ${data.value.name}`,
        type: 'success',
      });
    modals.provider = false;
    provider.name = undefined;

  } catch (error) {
    ElNotification({
      title: 'Poveedor no creado',
      message: ``,
      type: 'error',
    });
  }
}
const searchProvider = async (queryString: string, cb: (arg: any) => void) => {
  try {
    let toSend = {
      params: {
        ...(queryString && queryString.length > 0 && { name: queryString }),
      },
    };

    const { data, error } = await useFetch<{ count: number, rows: Provider[] }>(
      '/invoices/providers',
      toSend
    );
    cb(data.value?.rows);
  } catch (error) {
    console.log(error);
  }
}

const addAsset = () => {
  const newAsset = { ...asset };
  if (!newAsset.serial || !newAsset.modelId || !newAsset.stateId) return;
  if (toAdd.assets.find(({ serial }) => serial === newAsset.serial)) {
    return;
  }
  asset.serial = '';
  toAdd.assets.push(newAsset);
}
const removeAsset = (row: NewAsset) => {
  const index = toAdd.assets.indexOf(row);
  if (index !== -1) {
    toAdd.assets.splice(index, 1);
  }
}

const addAssets = async () => {
  try {
    const newAssets = toAdd.assets.map((asset) => {
      const { modelId , ...rest } = asset;
      return {
        modelId: modelId![modelId!.length -1],
        ...rest
      }
    }
    )
    const newInvoice = { ...toAdd.invoice };
    const invoiceId = newInvoice.id;

    delete newInvoice.id;

    const { data, error } = await useFetch<{
      created: Asset[],
      errors: Asset[]
    }>('/assets', {
      method: 'post',
      body: {
        ...(invoiceId && {
          invoiceId
        }),
        ...(!invoiceId && newInvoice.invoiceDate && newInvoice.providerId && newInvoice.code && {
          invoice: newInvoice
        }),
        ...(newAssets && {
          assets: newAssets
        })
      }
    });

    if (data.value) {
      for (const asset of data.value.created) {
        ElNotification({
          title: 'Activo creado correctamente',
          message: `serial: ${asset.serial}`,
          type: 'success',
        });
      };

      for (const asset of data.value.errors) {
        ElNotification({
          title: 'Activo duplicado',
          message: `Serial: ${asset.serial}`,
          type: 'error',
        });
      }
    }


    toAdd.invoice = {
      id: undefined,
      code: undefined,
      providerId: undefined,
      total: undefined,
      invoiceDate: undefined,
    }

    provider.name = '',
      provider.rif = '',
      toAdd.assets = [];
  } catch (error) {
    console.log(error);
  }
}

onMounted(async () => {
  await getCategories()
  let statusApi = await getStatus() || [];
  status.push(...statusApi);
});
</script>