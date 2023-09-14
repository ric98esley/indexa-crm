<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="response.types" stripe v-loading="loadingType">
        <el-table-column type="expand" width="50">
          <template #default="props">
            <el-row :span="24" :gutter="24">
              <el-col :span="22" :offset="2">
                Creado por: {{ props.row.createdBy.name }} {{ props.row.createdBy.lastName }}
              </el-col>
              <el-col :span="22" :offset="2">
                Fecha de creación: {{ new Date(props.row.createdAt).toLocaleString('es-VE') }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="Nombre">
          <template #header>
            <el-input :debounce="2000" v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editType(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeType(props.row.id)" v-role="['superuser', 'auditor']">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="response.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nueva tipo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="type"
            @submit.prevent="createType()">
            <el-form-item label="Nombre">
              <el-input v-model="type.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!type.name" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar tipo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="type"
            @submit.prevent="patchType()">
            <el-form-item label="Nombre">
              <el-input v-model="type.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!type.name" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
    <el-row justify="end" :span="24">
      <div
        class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
        @click="modals.create = true">
        <Icon name="ep:plus" size="2rem" color="white" />
      </div>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
});

const loadingType = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: ''
});

const response = reactive<{
  types: Type[],
  total: number
}>({
  types: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
  menu: false
});


const type = reactive<{
  id?: number,
  name: string
}>({
  id: undefined,
  name: ''
});


const getTypes = async () => {
  try {
    loadingType.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Type[] }>('/locations/types',
      {
        params: {
          ...(filters.name != '' && filters.name && {
            name: filters.name
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
    if (error.value) {
      throw new Error()
    }

    loadingType.value = false;
    return data.value
  } catch (error) {
    loadingType.value = false;
    ElNotification({
      message: 'Error al obtener los tipos intente de nuevo mas tarde'
    })
  }
}

const createType = async () => {
  try {
    loadingType.value = true;

    const { data, error } = await useFetch<Type>('/locations/types',
      {
        method: 'post',
        body: {
          name: type.name,
        }
      },
    )
    loadingType.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear tipos intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setTypes()
    ElNotification({
      title: 'Tipo creada correctamente',
      message: `${data.value?.name}`
    })
    type.id = undefined;
    type.name = '';
    return data.value
  } catch (error) {
    loadingType.value = false;
    ElNotification({
      title: 'Error al crear tipos intente de nuevo mas tarde',
    })
  }
}

const patchType = async () => {
  try {
    loadingType.value = true;

    const body = {
      name: type.name,
    }

    const { data, error } = await useFetch<Type>(`/locations/types/${type.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingType.value = false;


    if (error.value) {
      throw error
    }
    await setTypes()
    ElNotification({
      title: 'Tipo modificada correctamente',
      message: `${data.value?.name}`
    })

    type.id = undefined;
    type.name = '';
    return data.value
  } catch (error) {
    loadingType.value = false;
    ElNotification({
      title: 'Error al modificar la Tipo intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editType = (row: Type) => {
  modals.edit = true;
  type.id = row.id;
  type.name = row.name || '';
}

const removeType = async (id: number) => {
  try {
    const { data, error } = await useFetch<Type>(`/assets/types/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingType.value = false;
      ElNotification({
        message: 'Error al borrar la Tipo intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La Tipo ha sido borrada.'
    })
    await setTypes()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la Tipo intente de nuevo mas tarde.'
    })
  }
}

const setTypes = async () => {
  const rta = await getTypes();
  response.types = rta?.rows || []
  response.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setTypes()
}, 500)
)

onMounted(async () => {
  await setTypes();
});
</script>