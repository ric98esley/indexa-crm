<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const getModal = ref(false);
const editModal = ref(false);

const width = ref<number>(window.screen.width);

const AssetServices = useAssets();
const assetServices = new AssetServices();

const asset = reactive<{ data?: Asset, specifications: Specification[] }>({
  data: {
    enabled: false,
    specifications: [],
    countChecking: undefined,
    notes: undefined,
    location: undefined,
    model: undefined,
  },
  specifications: []
})

const setAsset = async () => {
  try {
    const res = await assetServices.finOne({ id: props.id });
    asset.data = res?.value || undefined;
  } catch (error) {
    console.log(error);
  }
}

watch(getModal,() => {
  if(getModal.value == false) setAsset();
})
watch(editModal,() => {
  if(editModal.value == false) setAsset();
})

onMounted(async () => {
  await setAsset()
})
</script>
<template>
  <el-col v-can="['assets:read']">
    <PageHeader class="mb-4">
      <template #title>
        <div class="flex items-center">
          <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
            {{ asset.data?.serial }}
          </span>
          <el-tag>{{ asset?.data?.model?.category?.name }}</el-tag>
        </div>
      </template>
      <template #buttons>
        <div class="sm:flex items-center hidden">
          <el-button type="danger" @click="getModal = true" v-can="['assets:checking']">Recibir</el-button>
          <el-button type="warning" class="hidden" @click="editModal = true" v-can="['assets:update']">Editar</el-button>
        </div>
      </template>
    </PageHeader>
    <el-row >
      <el-col :span="24">
        <div class="sm:hidden items-center justify-end flex w-full">
          <el-button type="danger" @click="getModal = true" v-can="['assets:checking']">Recibir</el-button>
          <el-button type="warning" class="hidden" @click="editModal = true" v-can="['assets:update']">Editar</el-button>
        </div>
        <h2> Datos del activo</h2>
        <el-descriptions :column="width > 768 ? 3 : 1" border>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <Icon name="mdi-light:eye" />
                Serial
              </div>
            </template>
            <Copy :text="asset?.data?.serial" />
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <Icon name="ep:phone" />
                Categoría
              </div>
            </template>
            {{ asset?.data?.model?.category.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <Icon name="ep:phone" />
                Modelo
              </div>
            </template>
            {{ asset?.data?.model?.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <Icon name="ep:phone" />
                Marca
              </div>
            </template>
            {{ asset?.data?.model?.brand.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <Icon name="ep:phone" />
                Fecha de creación
              </div>
            </template>
            {{ new Date(asset.data.createdAt).toLocaleDateString() }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <Icon name="ep:phone" />
                Deposito del activo
              </div>
            </template>
            {{ asset.data?.location?.code }}
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col class="my-4" :span="24">
        <h2> Especificaciones</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item v-for="item in asset.specifications">
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
      <el-container>
        <AssetsFormGet :id="$props.id" v-model:open="getModal"></AssetsFormGet>
        <AssetsFormSave :id="props.id" v-model:open="editModal" />

      </el-container>
    </el-row>
  </el-col>
</template>