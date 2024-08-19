<script setup lang="ts">

const updateModal = ref(false);
const props = defineProps({
  data: {
    type: Array as PropType<Paths[]>,
  },
  total: {
    type: Number,
  },
  filters: {
    type: Object as PropType<FindPaths>,
    default: () => ({
      limit: 10,
      offset: 0,
      search: '',
    }),
  },
});
const emit = defineEmits(['refresh', 'update:filters']);

const filters = computed({
  get: () => props.filters,
  set: (value: FindPaths) => {
    emit('update:filters', value);
    emit('refresh');
  },
});

const PathToEdit = ref<Paths | null>(null);


const handlerEdit = (row: Paths) => {
  PathToEdit.value = row;
  updateModal.value = true;
};

const handlerDelete = async (row: Paths) => {
  try {
    await useDeletePath(row.id);
    emit('refresh');
  } catch (error: any) {
    const { $errorHandler } = useNuxtApp();
    $errorHandler(error);
  }
};

const updatePath = async (form: CreatePaths) => {
  try {
    if (!PathToEdit.value) return;
    await useUpdatePath(PathToEdit.value.id, form);
    emit('refresh');
    updateModal.value = false;
  } catch (error: any) {
    const { $errorHandler } = useNuxtApp();
    $errorHandler(error);
  }
};

</script>

<template>
  <el-col>
    <el-table :data="props.data" stripe>
      <el-table-column type="index" width="50" />
      <el-table-column prop="name" label="Nombre">
        <template #header>
          <el-input v-model="filters.search" placeholder="Buscar" clearable />
        </template>
      </el-table-column>
      <el-table-column prop="path" label="Ruta" />
      <el-table-column prop="createdAt" label="Creado">
        <template #default="{ row }">
          <span>{{ new Date(row.createdAt).toLocaleDateString() }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="isAllow" label="Permitir">
        <template #default="{ row }">
          <el-tag v-if="row.isAllow" type="success">Si</el-tag>
          <el-tag v-else type="danger">No</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Acciones" width="180">
        <template #default="{ row }">
          <el-row>
            <el-button type="info" circle v-can="['paths:update']" @click="handlerEdit(row)">
              <Icon name="ep:edit" />
            </el-button>
            <el-button type="danger" circle v-can="['paths:delete']" @click="handlerDelete(row)">
              <Icon name="ep:delete" />
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="props.total" />
    <el-dialog v-model="updateModal" destroy-on-close title="Editar ruta">
      <PathsForm v-if="PathToEdit" @submit="updatePath"
        :form="{ name: PathToEdit.name, path: PathToEdit.path, isAllow: PathToEdit.isAllow }" />
    </el-dialog>
  </el-col>
</template>