<script lang="ts" setup>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['paths:create', 'paths:read'],
});

const modals = reactive({
  create: false,
  update: false,
  delete: false
})

const paths = reactive<{
  rows: Paths[],
  total: number
}>({
  rows: [],
  total: 0
})


const filters = reactive({
  limit: 10,
  offset: 1,
  search: ''
})

const loadingPaths = ref(false);


const getPaths = async (filters: FindPaths) => {
  try {
    loadingPaths.value = true;

    const data = await useFindPath(filters)


    paths.rows = data.rows;
    paths.total = data.total;
  } catch (error: any) {
    const { $errorHandler } = useNuxtApp();
    $errorHandler(error);
  } finally {
    loadingPaths.value = false;
  }
}

const createPath = async (form: CreatePaths) => {
  try {
    await useCreatePath(form);
    modals.create = false;

    getPaths(filters);
  } catch (error: any) {
    const { $errorHandler } = useNuxtApp();
    $errorHandler(error);
  }
}
onMounted(() => {
  getPaths(filters);
})
</script>
<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader name="Paths" />
    </el-row>
    <el-col>
      <PathsTable :data="paths.rows" :total="paths.total" v-model:filters="filters" @refresh="getPaths" />
    </el-col>
    <div>
      <el-dialog title="Crear Path" v-model="modals.create">
        <PathsForm @submit="createPath"/>
      </el-dialog>
    </div>
    <LeftButton @click="modals.create = true" destroy-on-close prevent/>
  </el-container>
</template>