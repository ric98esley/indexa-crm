<template>
  <el-row :span="24" :gutter="20">
    <el-col :span="24">
      <h1 class="text-2xl m-4">Agregar activos al sistema</h1>
    </el-col>
    <el-col :sm="24" :md="24" :lg="8">
      <el-card>
        <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" :model="asset"
          :rules="rules" deposits-icon>
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
          <el-form-item label="Depositos del activo">
            <el-select v-model="asset.depositId" class="select-success" placeholder="Selecciona un deposito" label="Deposito"
              style="width: 100%" filterable>
              <el-option v-for="option in response.deposits" :key="option.id" :value="option.id!"
                :label="`${option.id} - ${option.name}`">
                {{ option.id }} - {{ option.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="field.name" v-for="field in asset.customFields">
            <el-input v-model="field.value"></el-input>
          </el-form-item>
          <el-row justify="space-between" align="middle">
            <el-form-item>
              <el-button type="primary" :disabled="!asset.serial || !asset.modelId || !asset.depositId"
                @click="addAsset()" native-type="submit">Agregar</el-button>
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
          <el-table-column type="expand" width="50">
            <template #default="props">
              <el-table :data="props.row.customFields" :border="true">
                <el-table-column label="Campo" prop="name"></el-table-column>
                <el-table-column label="Valor" prop="value"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="Serial" prop="serial">
            <template #default="{ row }">
              <el-input v-model="row.serial"></el-input>
            </template>
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
              <el-select v-model="row.depositId" class="select-success" placeholder="Selecciona un estado" label="Estados"
                style="width: 100%" name="assetDeposit" filterable>
                <el-option v-for="option in deposits" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column  header-align="right" width="80">
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
              <el-select class="w-full" v-model="toAdd.invoice.providerId" filterable remote effect="dark"
                placeholder="Elige un responsable" :loading="loadingProvider" :remote-method="setProvider">
                <el-option v-for="item in response.providers" :key="item.id" :label="`${item.name}`" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                </el-option>
              </el-select>
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
              <el-select class="w-full" v-model="toAdd.invoice.providerId" filterable remote effect="dark"
                placeholder="Elige un responsable" :loading="loadingProvider" :remote-method="setProvider">
                <el-option v-for="item in response.providers" :key="item.id" :label="`${item.name}`" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                </el-option>
              </el-select>
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

const loadingProvider = ref(false);


const asset = reactive<NewAsset>({
  serial: undefined,
  modelId: undefined,
  depositId: undefined,
  customFields: []
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
  deposits: Deposit[]
  categories: any[]
  providers: Provider[]
}>({
  categories: [],
  models: [],
  deposits: [],
  providers: []
})
const deposits = reactive<Deposit[]>([]);

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
const searchProvider = async ({ name }: { name?: string }) => {
  try {
    let toSend = {
      params: {
        ...(name && name.length > 0 && { name }),
      },
    };

    const { data, error } = await useFetch<{ total: number, rows: Provider[] }>(
      '/invoices/providers',
      toSend
    );
    return data.value
  } catch (error) {
    console.log(error);
  }
}

const addAsset = () => {
  const newAsset = { ...asset };
  if (!newAsset.serial || !newAsset.modelId || !newAsset.depositId) return;
  const newCustomFields = newAsset.customFields.filter(field => field.value !== '');
  newAsset.customFields = JSON.parse(JSON.stringify(newCustomFields.length > 0 ? newCustomFields : []));

  if (toAdd.assets.find(({ serial }) => serial === newAsset.serial)) {
    return;
  }

  console.log(newAsset)
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
      const { modelId, customFields, ...rest } = asset;
      const specifications = customFields.map((field) => ({
        typeId: field.id,
        value: field.value
      }))
      return {
        modelId: modelId![modelId!.length - 1],
        specifications,
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

    console.log(error)

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

watch(() => asset.modelId, async () => {
  if (!asset.modelId) return []
  const foundCategory = response.categories.find((elemento) => {
    return elemento.value == asset.modelId![0]
  })

  if (!foundCategory) return []
  const toReturn = foundCategory.customFields.map((field: Specification) => ({
    ...(field),
    value: ''
  }));
  asset.customFields = toReturn;
});

const setProvider = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await searchProvider(search);
  response.providers = rta?.rows || []
}
const setDeposit = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getDeposit(search);
  response.deposits = rta?.rows || []
}




onMounted(async () => {
  await getCategories()
  await setDeposit()
});
</script>