<script setup lang="ts">
const emit = defineEmits({
  submit: ({ serial, modelId, locationId, notes }) => {
    if (modelId < 1 || locationId < 1) {
      return false
    };
    if (!serial || !modelId || !locationId) {
      ElNotification({
        title: 'Error al agregar el producto',
        type: 'error'
      })
      return false
    }
    return true
  }
})

const ruleFormRef = ref();

const modelSelected = reactive({
  categoryId: undefined,
  brandId: undefined,
});

const modals = reactive({
  addModel: false
});

const asset = reactive<NewAsset>({
  serial: undefined,
  modelId: undefined,
  notes: '',
  locationId: undefined,
  customFields: []
});

const getTag = async (business: string) => {
  try {
    const { data } = await useApi<{ tag: string }>('/assets/tag');
    if (data.value) asset.serial = data.value.tag;
  } catch (error) {
    console.log(error)
  }
}

const locationFilters = ({
  status: ['desplegable', 'pendiente']
});

const rules = reactive({
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

const resetModel = async () => {
  asset.modelId = undefined;
}

const submit = () => {
  emit('submit', {
    serial: asset.serial,
    modelId: asset.modelId,
    locationId: asset.locationId,
    notes: asset.notes
  });
  asset.serial = '';
}

watch(modelSelected, async () => {
  await resetModel();
});

</script>

<template>
  <el-col>
    <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef" :model="asset" :rules="rules"
      warehouses-icon @submit.prevent="submit()">
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
        <CategoryItemsSelect v-model:category-id="modelSelected.categoryId" />
      </el-form-item>
      <el-form-item label="Marca">
        <BrandItemsSelect v-model:brand-id="modelSelected.brandId" />
      </el-form-item>
      <el-form-item label="Modelo">
        <el-row justify="space-between" class="w-full">
          <el-col :span="20" :lg="22">
            <ModelItemsSelect v-model:model-id="asset.modelId" :category-id="modelSelected.categoryId"
              :brand-id="modelSelected.brandId" />
          </el-col>
          <el-col :span="4" :lg="2">
            <el-row justify="end">
              <el-button type="info" @click="modals.addModel = true">
                <Icon name="ep:plus" />
              </el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="Almacén del activo">
        <LocationItemsSelect v-model:location-id="asset.locationId" :filters="locationFilters" />
      </el-form-item>
      <el-form-item label="Notas  (Numero de teléfono, otro IMEI)">
        <el-input v-model="asset.notes" placeholder="Información que permita identificar el activo">
        </el-input>
      </el-form-item>
      <el-row justify="end" align="middle">
        <el-form-item>
          <el-button type="primary" :disabled="!asset.serial || !asset.modelId || !asset.locationId"
            native-type="submit">Agregar</el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <el-dialog v-model="modals.addModel">
      <template #header>
        <h2>Agregar modelo</h2>
      </template>
      <ModelFormSave />
    </el-dialog>
  </el-col>
</template>
