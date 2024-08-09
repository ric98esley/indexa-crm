<script setup lang="ts">
const geoAlerts = reactive<{ rows: GeoAlert[], total: number }>({
  rows: [],
  total: 0,
})


const getGeoAlerts = async (filters: FindGeoAlert) => {
  const data = await useFindGeo(filters)

  if(!data) return

  geoAlerts.rows = data.rows
  geoAlerts.total = data.total
}

onMounted(() => {
  getGeoAlerts({})
})
</script>

<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <PageHeader name="Alertas" class="mb-4">
          <template #buttons>
          </template>
        </PageHeader>
      </el-col>
    </el-row>
    <el-col>
      <GeoTable :data="geoAlerts.rows" :total="geoAlerts.total" @filters="getGeoAlerts"/>
    </el-col>
  </el-container>
</template>