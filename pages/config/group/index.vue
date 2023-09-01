<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="groups.rows" stripe v-loading="loadingGroup">
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
        <el-table-column label="Codigo" prop="code">
          <template #header>
            <el-input :debounce="2000" v-model="filters.code" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Padre" >
          <template #default="{ row }">
            {{ row?.parent?.code }} - {{ row?.parent?.name }}
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editGroup(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeGroup(props.row.id)">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="groups.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nuevo grupo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="group"
            @submit.prevent="createGroup()">
            <el-form-item label="Nombre">
              <el-input v-model="group.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Código">
              <el-input v-model="group.code" placeholder="Ingrese aqui el código"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!group.name && !group.code" native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Crear nueva marca</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="group"
            @submit.prevent="patchGroup()">
            <el-form-item label="Nombre">
              <el-input v-model="group.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Código">
              <el-input v-model="group.code" placeholder="Ingrese aqui el código"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!group.name" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
    </el-container>
    <el-row justify="end" :span="24">
      <div
        class="fixed top-[45%] right-0 w-14 h-14 flex items-center justify-center bg-[var(--el-color-primary)] cursor-pointer z-10 rounded-s-lg"
        @click="modals.create = true">
        <Icon name="ep:plus" size="2rem" color="white"/>
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

const loadingGroup = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  code: ''
});

const groups = reactive<{
  rows: Group[],
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


const group = reactive<{
  id?: number,
  name: string,
  code: string,
}>({
  id: undefined,
  name: '',
  code: '',
});


const getGroups = async () => {
  try {
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
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
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingGroup.value = false;
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const createGroup = async () => {
  try {
    loadingGroup.value = true;

    const { data, error } = await useFetch<Group>('/assets/groups',
      {
        method: 'post',
        body: {
          name: group.name,
        }
      },
    )
    loadingGroup.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear marcas intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setGroups()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data.value?.name}`
    })
    group.id = undefined;
    group.name = '';
    group.code = '';
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      title: 'Error al crear marcas intente de nuevo mas tarde',
    })
  }
}

const patchGroup = async () => {
  try {
    loadingGroup.value = true;

    const body = {
      name: group.name,
    }

    const { data, error } = await useFetch<Group>(`/groups/${group.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingGroup.value = false;


    if (error.value) {
      throw error
    }
    await setGroups()
    ElNotification({
      title: 'Categoria modificada correctamente',
      message: `${data.value?.name}`
    })

    group.id = undefined;
    group.name = '';
    group.code = '';
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      title: 'Error al modificar la categoria intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editGroup = (row: Group) => {
  modals.edit = true;
  group.id = row.id;
  group.name = row.name || '';
}

const removeGroup = async (id: number) => {
  try {
    const { data, error } = await useFetch<Group>(`/assets/groups/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingGroup.value = false;
      ElNotification({
        message: 'Error al borrar la categoria intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La categoria ha sido borrada.'
    })
    await setGroups()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la categoria intente de nuevo mas tarde.'
    })
  }
}

const setGroups = async () => {
  const rta = await getGroups();
  groups.rows = rta?.rows || []
  groups.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setGroups()
}, 500)
)

onMounted(async () => {
  await setGroups();
});
</script>