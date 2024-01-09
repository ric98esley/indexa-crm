<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader name="Especificaciones" />
      <el-col :span="24">
        <el-table :data="response.specifications" stripe v-loading="loadingSpecification">
          <el-table-column type="index" width="50" />
          <el-table-column prop="name" label="Nombre" min-width="180">
            <template #header>
              <el-input v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Acciones" width="120">
            <template #default="props">
              <el-row>
                <el-button type="info" circle @click="editSpecification(props.row)">
                  <Icon name="ep:edit" />
                </el-button>
                <el-button type="danger" circle @click="removeSpecification(props.row.id)">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:offset="filters.offset" v-model:limit="filters.limit" :total="response.total" />
      </el-col>
      <el-container>
        <el-dialog v-model="modals.edit">
          <template #header>
            <h2>Editar la especificación</h2>
          </template>
          <template #default>
            <el-form @submit.prevent="updateSpecification(newField.id)" label-position="top" label-width="auto"
              autocomplete="off" status-icon>
              <el-form-item label="Nombre">
                <el-input v-model="newField.name"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!newField.name" native-type="submit">Editar
                </el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-dialog>
        <el-dialog v-model="modals.create">
          <template #header>
            <h2>Crear un nuevo campo personalizado</h2>
          </template>
          <template #default>
            <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="newField"
              @submit.prevent="createSpecification()">
              <el-form-item label="Nombre">
                <el-input v-model="newField.name" placeholder="Ingrese aquí el nombre"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!newField.name" native-type="submit">Crear</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-dialog>
      </el-container>
      <el-row justify="end" :span="24" v-can="['specifications:create']">
        <div
          class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
          @click="modals.create = true">
          <Icon name="ep:plus" size="2rem" color="white" />
        </div>
      </el-row>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['specifications:read', 'specifications:update', 'specifications:delete', 'specifications:create'],
});
const SpecificationService = useSpecifications();
const specificationsService = new SpecificationService()

const loadingSpecification = ref(false);


const filters = reactive({
  limit: 10,
  offset: 1,
  name: ''
})

const response = reactive<{
  specifications: Specification[],
  total: number
}>({
  specifications: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
})

const newField = reactive<{
  id?: number
  name?: string,
}>({
  name: undefined,
})

const editSpecification = (row: Specification) => {
  newField.name = row.name;
  newField.id = row.id;
  modals.edit = true;
}

const createSpecification = async () => {
  try {
    const body = {
      name: newField.name || ''
    }

    const { data, error } = await specificationsService.createSpecification(body)

    loadingSpecification.value = false;

    if (error.value) throw error;
    await setSpecification()

    return data.value
  } catch (error) {
    console.log(error);
  }
}

const removeSpecification = async (id: number) => {
  try {
    await specificationsService.removeSpecification(id);

    await setSpecification()
  } catch (error) {
    console.log(error);
  }
}

const updateSpecification = async (id?: number) => {
  try {
    loadingSpecification.value = true;
    if (!id) throw new Error();
    const body = {
      id,
      name: newField.name || ''
    }

    specificationsService.updateSpecification(body);

    newField.id = undefined;
    newField.name = '';

    await setSpecification();
  } catch (error) {
    console.log(error);
  }
}

const setSpecification = async () => {
  try {
    loadingSpecification.value = true;

    const rta = await specificationsService.getSpecification(filters);

    loadingSpecification.value = false;

    response.specifications = rta?.rows || []
    response.total = rta?.total || 0
  } catch (error) {
    loadingSpecification.value = false;
  }
}

watch(filters, useDebounce(async () => {
  await setSpecification()
}))

onMounted(async () => {
  await setSpecification()
});

</script>