<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <PageHeader name="Agregar activos" class="mb-4">
          <template #buttons>
            <el-button type="warning">
              Guardar
            </el-button>
          </template>
        </PageHeader>
      </el-col>
      <el-col :sm="24" :md="12" :lg="8">
        <el-card class="mb-4">
          <AssetsFormAdd @submit="addAsset" />
        </el-card>
      </el-col>
      <el-col :sm="24" :md="24" :lg="16" >
        <el-card >
          <template #header>
            <el-row justify="end">
              Total: {{ toAdd.assets.length }}
            </el-row>
          </template>
          <el-scrollbar height="469px" id="scrollAddAssets" ref="scrollbar">
            <el-col>
              <AssetsTableAdd :data="toAdd.assets" @remove="removeAsset" />
            </el-col>
          </el-scrollbar>
        </el-card>
      </el-col>
      <el-dialog v-model="modals.addModel">
        <template #header>
          <h2>Agregar modelo</h2>
        </template>
        <ModelFormSave />
      </el-dialog>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
import { ElScrollbar } from 'element-plus'

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['assets:create']
})

const scrollbar = ref<InstanceType<typeof ElScrollbar>>()

const modals = reactive({
  invoice: false,
  confirm: false,
  addModel: false,
})


const toAdd = reactive<{
  assets: NewAsset[],
  locationId?: number,
}>({
  assets: [],
  locationId: undefined,
});


const addAsset = (asset: NewAsset) => {
  const newAsset = { ...asset };
  if (!newAsset.serial || !newAsset.modelId || !newAsset.locationId) return;

  if (toAdd.assets.find(({ serial }) => serial === newAsset.serial)) {
    return;
  }

  toAdd.assets.push(newAsset);

  scrollbar.value?.setScrollTop(9999);
}

const removeAsset = (index: number) => {
  if (index !== -1) {
    toAdd.assets.splice(index, 1);
  }
}
</script>