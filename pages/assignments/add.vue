<template>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="w-full">
          <el-form label-position="top" label-width="auto" autocomplete="off" ref="ruleFormRef">
            <el-form-item label="Activo" >
              <el-select remote filterable class="select-success" placeholder="Selecciona una modelo" label="Modelo"
                style="width: 100%" :remote-method="getAssets" v-loading="loading">
                <el-option v-for="option in response.assets" :key="option.id" :value="option.id!"
                  :label="`${option.serial} - ${option.model?.category.name} - ${option.model?.brand.name}`">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
})

const loading = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  serial: ''
});

const response = reactive<{
  assets: Asset[],
  total: number
}>({
  assets: [],
  total: 0
});

const getAssets = async (serial: string) => {
  try {
    loading.value = true;
    const { data, pending, error } = await useFetch<{ assets: Asset[], total: number }>('/assets',
      {
        params: {
          ...(serial != '' && serial && {
            serial: serial
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
</script>
