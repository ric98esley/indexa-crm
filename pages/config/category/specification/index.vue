<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-col :lg="16">
        <el-card class="w-full">
          <template #header>
            Busca Especificaciones
          </template>
          <el-row :gutter="20" align="middle">
            <el-col :span="22">
              <el-input v-model="filters.name" placeholder="Nombre" clearable class="w-50 m-4" />
            </el-col>
            <el-col :span="2">
              <Icon name="ep:filter" class="m-4" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <el-button type="primary" @click="modals.create = true">Crear nueva especificación</el-button>
        </el-card>
      </el-col>

    </el-row>
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <el-table :data="response.specifications" stripe v-loading="loadingSpecification">
          <el-table-column type="index" width="50" />
          <el-table-column prop="name" label="Nombre">
            <template #header>
              <el-input v-model="filters.name" placeholder="Nombre" clearable />
            </template>
          </el-table-column>
          <el-table-column label="Acciones">
            <template #default="props">
              <el-row>
                <el-button type="info" circle @click="modals.edit = true">
                  <Icon name="ep:edit" />
                </el-button>
                <el-button type="primary" circle>
                  <Icon name="ep:view" />
                </el-button>
                <el-button type="danger" circle @click="removeCategory(props.row.id)">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
          :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true"
          layout="total, sizes, prev, pager, next, jumper" :total="response.total" />
      </el-col>
    </el-row>
    <el-container>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar la especificación</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon>
            <el-form-item label="Nombre">
              <el-input v-model="newField.name"></el-input>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nueva categoria</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="newField"
            @submit.prevent="createSpecification()">
            <el-form-item label="Nombre">
              <el-input v-model="newField.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!newField.name" @click="createSpecification()"
                native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor'],
});

const loadingSpecification = ref(false)

const filters = reactive({
  limit: 10,
  offset: 0,
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
  name?: string,
}>({
  name: undefined,
})



const getSpecification = async () => {
  try {
    loadingSpecification.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Specification[] }>('/assets/specification',
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
      ElNotification({
        message: 'Error al obtener las categorias intente de nuevo mas tarde'
      })
    }

    loadingSpecification.value = false;
    return data.value
  } catch (error) {
    loadingSpecification.value = false;
    ElNotification({
      message: 'Error al obtener las categorias intente de nuevo mas tarde'
    })
  }
}

const createSpecification = async () => {
  try {
    loadingSpecification.value = true;

    const body = {
      name: newField.name
    }

    const { data, error } = await useAsyncData('createSpecification', () => useFetch<Specification>('/assets/specification',
      {
        method: 'post',
        body
      }
    ))
    loadingSpecification.value = false;

    if (error.value) throw error;
    await setSpecification()


    ElNotification({
      title: 'Especificación creada correctamente',
    })
    return data.value
  } catch (error) {
    loadingSpecification.value = false;
    ElNotification({
      title: 'Error al crear especificación intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const removeCategory = async (id: number) => {
  try {
    const { data, error } = await useFetch<Specification>(`/assets/specification/${id}`, {
      method: 'delete'
    })

    if (error) {
      loadingSpecification.value = false;
      ElNotification({
        message: 'Error al borrar la especificación intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La especificación ha sido borrada.'
    })
    await setSpecification()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la especificación intente de nuevo mas tarde.'
    })
  }
}

const updateCategory = async (id: number, ) => {
  try {
    loadingSpecification.value = true;

    const body = {
      name: newField.name
    }
    
    const { data, error } = await useAsyncData('createSpecification', () => useFetch<Specification>(`/assets/specification/${id}`,
      {
        method: 'patch',
        body
      }
    ))
  } catch (error) {
    loadingSpecification.value = false;
    ElNotification({
      title: 'error al actualizar el campo'
    })
  }
}

const setSpecification = async () => {
  const rta = await getSpecification();
  response.specifications = rta?.rows || []
  response.total = rta?.total || 0
}

watch(filters, async () => {
  await setSpecification()
})

onMounted(async () => {
  await setSpecification()
});

</script>