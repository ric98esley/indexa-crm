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
            <el-select v-model="asset.modelId" filterable class="select-success" placeholder="Selecciona una modelo"
              label="Modelo" style="width: 100%">
              <el-option v-for="option in models" :key="option.id" :value="option.id!"
                :label="`${option.category.name} - ${option.name} - ${option.brand?.name}`">
              </el-option>
            </el-select>
          </el-form-item>
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
              <el-button type="primary" :disabled="!asset.serial || !asset.modelId || !asset.stateId"
                @click="addAsset()">Agregar</el-button>
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
              <el-select v-model="row.modelId" class="select-success" placeholder="Selecciona un estado" label="Estados"
                style="width: 100%" name="Modelo de activo" filterable>
                <el-option v-for="option in models" :key="option.id" :value="option.id"
                  :label="`${option?.category?.name} - ${option?.brand?.name} - ${option?.name}`">
                  {{ option?.category?.name }} - {{ option?.brand?.name }} -
                  {{ option?.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Estado">
            <template type="text" #default="{ row }">
              <el-select v-model="row.stateId" class="select-success" placeholder="Selecciona un estado" label="Estados"
                style="width: 100%" name="assetState" filterable>
                <el-option v-for="option in status" :key="option.id" :value="option.id"
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
    <el-dialog v-model="modals.invoice" title="Tips" width="30%" draggable>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="Factura nueva" name="factura-nueva">
          <h2>Datos de la factura</h2>
          <el-form label-position="top" >
            <el-form-item label="Numero de factura">
              <el-input v-model="toAdd.invoice.code" type="text" clearable></el-input>
            </el-form-item>
            <el-form-item label="Provedor">
              <el-autocomplete type="text" clearable :fetch-suggestions="searchProvider" placeholder="Buscar Provedor"
                @select="handleSelectProvider" v-model="provider.name" class="w-100">
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
            <el-form-item label="Serial">
              <el-date-picker v-model="toAdd.invoice.invoiceDate" type="date"
                placeholder="Elige la fecha de facturacion"></el-date-picker>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Factura antigua" name="factura-antigua">
          <el-form label-position="top" >
            <el-autocomplete type="text" clearable :fetch-suggestions="searchInvoice" placeholder="Buscar factura"
              @select="handleSelectInvoice" v-model="toAdd.invoice.code" class="w-100">
              <template #default="{ item }">
                <div class="value">
                  <b>{{ item.code }}</b>, <span class="link">{{ item.provider?.name }}</span>
                </div>
              </template>
            </el-autocomplete>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <span>It's a draggable Dialog</span>
      <template #footer>
        <span class="dialog-footer">
        </span>
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
const activeName = ref('first');

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
})

const models = reactive<Model[]>([]);
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

const getModels = async () => {
  try {
    const { data } = await useFetch<Model[]>('/assets/models');
    return data.value
  } catch (error) {
    console.log(error);
  }
}

const getStatus = async () => {
  try {
    const { data } = await useFetch<State[]>('/assets/status');
    return data.value
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

onMounted(async () => {
  let modelsApi = await getModels() || [];
  let statusApi = await getStatus() || [];
  models.push(...modelsApi);
  status.push(...statusApi);
});


</script>