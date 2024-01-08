<template>
  <el-row :span="24" :gutter="20">
    <el-col :span="24">
      <h1 class="text-2xl m-4">Agregar activos al sistema</h1>
    </el-col>
    <el-col :sm="24" :md="12" :lg="8">
      <el-card>
        <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" :model="asset"
          :rules="rules" warehouses-icon @submit.prevent="addAsset()">
          <el-form-item label="Serial">
            <el-input placeholder="Serial" v-model="asset.serial" clearable>
              <template #append>
                <el-button @click="getTag('gana')" v-can="['assets:read']">
                  <Icon name="ep:refresh" />
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="Categoría">
            <el-select v-model="modelSelected.categoryId" class="select-success" placeholder="Selecciona una categoría"
              :loading="loadingCategories" label="Deposito" style="width: 100%" filterable remote
              :remote-method="getCategories" clearable>
              <el-option v-for="option in response.categories" :key="option.id" :value="option.id!"
                :label="`${option.id} - ${option.name}`">
                {{ option.id }} - {{ option.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Marca">
            <el-select v-model="modelSelected.brandId" class="select-success" placeholder="Selecciona una categoría"
              :loading="loadingBrands" label="Deposito" style="width: 100%" filterable remote :remote-method="getBrands"
              clearable>
              <el-option v-for="option in response.brands" :key="option.id" :value="option.id!"
                :label="`${option.id} - ${option.name}`">
                {{ option.id }} - {{ option.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Modelo">
            <el-select v-model="asset.modelId" class="select-success" placeholder="Selecciona un modelo" label="Deposito"
              style="width: 100%" filterable remote :remote-method="getModels">
              <el-option v-for="option in response.models" :key="option.id" :value="option.id!"
                :label="`${option.id} - ${option.name}`">
                {{ option.id }} - {{ option.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Almacén del activo">
            <el-select v-model="asset.locationId" class="select-success" placeholder="Selecciona un deposito"
              label="Deposito" style="width: 100%" filterable>
              <el-option v-for="option in response.warehouses" :key="option.id" :value="option.id!"
                :label="`${option.id} - ${option.name}`">
                {{ option.id }} - {{ option.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-row justify="space-between" align="middle">
            <el-form-item>
              <el-button type="primary" :disabled="!asset.serial || !asset.modelId || !asset.locationId"
              native-type="submit">Agregar</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="addAssets()" type="warning" :disabled="toAdd.assets.length < 1">Guardar</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </el-card>
    </el-col>
    <el-col :sm="24" :md="12" :lg="8">
      <el-card>
        <el-form label-position="top" label-width="auto" autocomplete="off">
          <el-form-item :label="field.name" v-for="field in asset.customFields">
            <el-input v-model="field.value"></el-input>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :sm="24" :md="24" :lg="24">
      <el-card class="mt-4">
        <template #header>
          <el-row justify="end">
            Total: {{ toAdd.assets.length }}
          </el-row>
        </template>
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
              <el-select v-model="row.modelId" class="select-success" placeholder="Selecciona un modelo" label="Deposito"
                style="width: 100%" filterable remote :remote-method="getModels">
                <el-option v-for="option in response.models" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Estado">
            <template type="text" #default="{ row }">
              <el-select v-model="row.locationId" class="select-success" placeholder="Selecciona un estado"
                label="Estados" style="width: 100%" name="assetDeposit" filterable>
                <el-option v-for="option in response.warehouses" :key="option.id" :value="option.id!"
                  :label="`${option.id} - ${option.name}`">
                  {{ option.id }} - {{ option.name }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column header-align="right" width="80">
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
  </el-row>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions:  ['assets:create']
})

const ruleFormRef = ref<FormInstance>();

const loadingCategories = ref(false);
const loadingBrands = ref(false);

const LocationsServices = useLocation();
const CategoriesServices = useCategories();
const BrandsServices = useBrands();
const ModelsServices = useModels();
const modelServices = new ModelsServices();
const brandServices = new BrandsServices();
const locationsServices = new LocationsServices();
const categoriesServices = new CategoriesServices();

const modelSelected = reactive({
  categoryId: undefined,
  brandId: undefined,
  modelId: undefined
})

const asset = reactive<NewAsset>({
  serial: undefined,
  modelId: undefined,
  locationId: undefined,
  customFields: []
});

const modals = reactive({
  invoice: false,
  confirm: false,
})


const response = reactive<{
  brands: Brand[]
  warehouses: Warehouse[]
  categories: any[]
  models: Model[]
}>({
  categories: [],
  warehouses: [],
  models: [],
  brands: []
})

const toAdd = reactive<{
  assets: NewAsset[],
  locationId?: number,
}>({
  assets: [],
  locationId: undefined,
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
      message: 'Mínimo 3 caracteres',
      trigger: 'blur'
    },
  ]

});


const getTag = async (business: string) => {
  try {
    const { data } = await useFetch<{ tag: string }>('/assets/tag');
    if (data.value) asset.serial = data.value.tag;
  } catch (error) {
    console.log(error)
  }
}

const getCategories = async (name?: string) => {
  try {
    const { data } = await categoriesServices.getCategories({
      type: 'asset',
      name
    });

    response.categories = data.value.rows || [];
  } catch (error) {
    console.log(error);
  }
}
const getBrands = async (name?: string) => {
  try {
    const { data } = await brandServices.getBrands({
      name
    });

    response.brands = data.value.rows || [];
  } catch (error) {
    console.log(error);
  }
}
const getModels = async (name?: string) => {
  try {
    const { data } = await modelServices.getModels({
      name,
      categoryId: modelSelected.categoryId,
      brandId: modelSelected.brandId
    });

    response.models = data.value.rows || [];
  } catch (error) {
    console.log(error);
  }
}

const getWarehouses = async ({ name }: { name?: string }) => {
  try {
    const { data } = await locationsServices.getLocations({
      status: ['desplegable', 'archivado', 'pendiente']
    })
    return data.value;
  } catch (error) {
    console.log(error);
  }
}

const addAsset = () => {
  const newAsset = { ...asset };
  if (!newAsset.serial || !newAsset.modelId || !newAsset.locationId) return;
  const newCustomFields = newAsset.customFields.filter(field => field.value !== '');
  newAsset.customFields = JSON.parse(JSON.stringify(newCustomFields.length > 0 ? newCustomFields : []));

  if (toAdd.assets.find(({ serial }) => serial === newAsset.serial)) {
    return;
  }

  asset.serial = '';
  toAdd.assets.unshift(newAsset);
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

      const specifications = customFields?.map((field) => ({
        typeId: field.id,
        value: field.value
      }));
      return {
        modelId,
        specifications,
        ...rest
      }
    }
    )
    const { data, error } = await useFetch<{
      created: Asset[],
      errors: Asset[]
    }>('/assets', {
      method: 'post',
      body: {
        description: 'purchase',
        ...(newAssets && {
          assets: newAssets
        })
      }
    });


    if (data.value) {
      let i = 0;

      for (const asset of data.value.errors) {
        setTimeout(function () {
          ElMessage({
            message: `Activo duplicado Serial: ${asset.serial}`,
            type: 'error',
          });
        }, i * 200); // El retraso depende del valor de i
        i++;
      }
      for (const asset of data.value.created) {
        setTimeout(function () {
          ElMessage({
            message: `Activo creado correctamente serial: ${asset.serial}`,
            type: 'success',
          });
        }, i * 200);
        i++;
      };
    }


    modals.invoice = false;

    toAdd.assets = [];
  } catch (error) {
    console.log(error);
  }
}

watch(() => modelSelected.categoryId, async () => {
  if (!modelSelected.categoryId) return []
  const foundCategory = response.categories.find((elemento) => {
    return elemento.id == modelSelected.categoryId
  })

  if (!foundCategory) return []
  const toReturn = foundCategory.customFields.map((field: Specification) => ({
    ...(field),
    value: ''
  }));
  asset.customFields = toReturn;
});

const setWarehouses = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getWarehouses(search);
  response.warehouses = rta?.rows || []
}

onMounted(async () => {
  await setWarehouses()
});
</script>