<template>
  <el-container>
    <div id="print" class="print text-xs">
      <el-col>
        <PrintHeader />
        <br />
        <el-row class="text-xs" justify="space-between">
          <el-col :span="7">
            <strong> Reporte de inventario</strong>
            <br />
            Fecha de reporte: {{ new Date().toLocaleString() }} <br />
            Impreso por <b>{{ user?.username }}</b>
          </el-col>
        </el-row>
        <br /><br />
        <table class="w-full table-print">
          <tr>
            <th></th>
            <th>Fecha</th>
            <th>Serial</th>
            <th>Descripción</th>
            <th>Lugar</th>
          </tr>
          <tr v-for="(asset, index) in response.rows" v-bind:key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ asset.createdAt && new Date(asset?.createdAt).toLocaleString() }}</td>
            <td>{{ asset?.serial }}</td>
            <td>
              {{ asset.model?.category.name || '' }} -
              {{ asset.model?.brand.name || '' }} -
              {{ asset.model?.name || '' }}
            </td>
            <td>
              <template v-if="asset.location">
                <b>
                  {{ asset.location?.code }}
                </b> -
                {{ asset.location?.name }}
              </template>
            </td>
          </tr>
          <tr>
            <th colspan="4">
              <b>
                Cantidad de activos: {{ response.rows.length }}
              </b>
            </th>
          </tr>
        </table>
      </el-col>
    </div>
  </el-container>
</template>

<script setup lang="ts">

const route = useRoute();
import { useAuthStore } from '@/stores/authStore';

definePageMeta({
  layout: 'print',
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations:read', 'locations:create', 'locations:update', 'locations:delete']
})

const auth = useAuthStore();

const AssetServices = useAssets();
const assetServices = new AssetServices();

const user = auth.getUser;

const response = reactive<{
  rows: Asset[],
  total?: number,
}>({
  total: undefined,
  rows: []
});

const setAssets = async () => {
    console.log(route.query)
    const data = await assetServices.getAssets({ offset: 0, ...route.query, limit: Number(route.query.total)});
    response.rows = data?.value?.rows || [];
    response.total = data?.value?.total || 0;
}



onMounted(async () => {
  setAssets()
  .then(() => {
    window.print();
    setTimeout(window.close, 500);
  });
})
</script>

<style>
.print {
  color: black;
}

.print h1 {
  color: black;
}

.print h4 {
  line-height: 22px;
  font-weight: bold;
  color: black;
  font-size: 12px;
}

.table-print {
  text-align: left;
  padding: 3px 2px;
}

.table-print tr th {
  font-weight: normal;
}

.table-print tr td {
  font-weight: normal;
}

.table-print__header tr td {
  font-weight: normal;
  vertical-align: top;
}

.table-print tr:first-child th {
  font-weight: bold;
}

.disclaimer {
  text-align: center;
}

.disclaimer tr th {
  font-weight: normal;
}

.signs {
  text-align: center;
}

.logo-print {
  width: 150px;
}

.is-not-current {
    text-decoration:line-through;
}
</style>