<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="response.rows" stripe v-loading="loadingType">
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
        <el-table-column prop="status" label="Estatus">
          <template #default="props">
            <el-tag v-if="props.row.status === 'asignado'" type="success">Asignado</el-tag>
            <el-tag v-if="props.row.status === 'desplegable'" type="warning">Disponible</el-tag>
            <el-tag v-if="props.row.status === 'pendiente'" type="info">Pendiente</el-tag>
            <el-tag v-if="props.row.status === 'archivado'" type="danger">Archivado</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editType(props.row)" v-can="['location_t ypes:delete']">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeType(props.row.id)" v-can="['locations_types:delete']">
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
              <el-input v-model="type.name" placeholder="Ingrese aquí el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-select v-model="type.status" placeholder="Seleccione el estatus" class="w-full">
                <el-option v-for="status of statusEnum" :label="status.label" :value="status.value">
                </el-option>
              </el-select>
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
              <el-input v-model="type.name" placeholder="Ingrese aquí el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-select v-model="type.status" placeholder="Seleccione el estatus">
                <el-option v-for="status of statusEnum" :label="status.label" :value="status.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!type.name" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
    <LeftButton @click="modals.create = true">
      <template #icon>
        <Icon name="ep:plus" size="2rem" color="white" />
      </template>
    </LeftButton>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['locations_types:read', 'locations_types:update', 'locations_types:delete', 'locations_types:create'],
});

const loadingType = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: ''
});

const response = reactive<{
  rows: Type[],
  total: number
}>({
  rows: [],
  total: 0
})

const modals = reactive({
  details: false,
  edit: false,
  create: false,
  menu: false
});

const statusEnum = [
  {
    value: 'asignado',
    label: 'Asignado'
  },
  {
    value: 'desplegable',
    label: 'Disponible'
  },
  {
    value: 'pendiente',
    label: 'Pendiente'
  },
  {
    value: 'archivado',
    label: 'Archivado'
  }
]

const type = reactive<{
  id?: number,
  name: string,
  status: string
}>({
  id: undefined,
  name: '',
  status: 'asignado'
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
          status: type.status
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
      status: type.status
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
    const { data, error } = await useFetch<Type>(`/locations/types/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      throw new Error()
    }

    ElNotification({
      message: 'La Tipo ha sido borrada.'
    })
    await setTypes()
  } catch (error) {
    loadingType.value = false;
    ElNotification({
      message: 'Error al borrar la Tipo intente de nuevo mas tarde.'
    })
  }
}

const setTypes = async () => {
  const rta = await getTypes();
  response.rows = rta?.rows || []
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