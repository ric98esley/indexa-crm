<template>
  <el-row :span="24" :gutter="20">
    <el-col :span="24">
      <h1 class="text-2xl m-4">Agregar activos al sistema</h1>
    </el-col>
    <el-col :sm="24" :md="24" :lg="8">
      <el-card>
        <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" :model="ruleForm"
          :rules="rules">
          <el-form-item label="Serial">
            <el-input placeholder="Serial" v-model="asset.serial">
            </el-input>
          </el-form-item>
          <el-form-item label="Modelo">
            <el-select v-model="asset.modelId" filterable class="select-success" placeholder="Selecciona una modelo"
              label="Modelo" style="width: 100%">
              <el-option v-for="option in models" :key="option.id" :value="option.id"
                :label="`${option.category.name} - ${option.name} - ${option.brand?.name}`">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Estatus del activo">
            <el-select v-model="asset.stateId" class="select-success" placeholder="Selecciona un estado" label="Estado"
              style="width: 100%" filterable>
              <el-option v-for="option in status" :key="option.id" :value="option.id"
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
              <el-button link plain>Facturar</el-button>
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
              <el-select
                v-model="row.stateId"
                class="select-success"
                placeholder="Selecciona un estado"
                label="Estados"
                style="width: 100%"
                name="assetState"
                filterable
              >
                <el-option
                  v-for="option in status"
                  :key="option.id"
                  :value="option.id"
                  :label="`${option.id} - ${option.name}`"
                >
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
})

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<Asset>({
  serial: undefined,
  modelId: undefined,
  stateId: undefined
})

const asset = reactive<Asset>({
  serial: undefined,
  modelId: undefined,
  stateId: undefined,
});

const models = reactive([]);
const status = reactive([]);

const toAdd = reactive<{
  assets: Asset[],
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

const rules = reactive<FormRules<Asset>>({
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

})

const getModels = async () => {
  try {
    const { data } = await useFetch<[]>('/assets/models');
    return data.value
  } catch (error) {
    console.log(error);
  }
}

const getStatus = async () => {
  try {
    const { data } = await useFetch<[]>('/assets/status');
    return data.value
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


onMounted(async () => {
  let modelsApi = await getModels() || [];
  let statusApi = await getStatus() || [];
  models.push(...modelsApi);
  status.push(...statusApi);
});


</script>