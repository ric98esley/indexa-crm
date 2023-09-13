<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="deposits.rows" stripe v-loading="loadingDeposit">
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
            <el-input v-model="filters.name" placeholder="Nombre" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Estatus" prop="state">
          <template #header>
            <el-input v-model="filters.state" placeholder="Estatus" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Grupo" prop="group.name">
          <template #header>
            <el-input v-model="filters.group" placeholder="Grupo" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editDeposit(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removeDeposit(props.row.id)">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="deposits.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nuevo grupo</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="deposit"
            @submit.prevent="createDeposit()">
            <el-form-item label="Nombre">
              <el-input v-model="deposit.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Status">
              <el-select class="w-full" v-model="deposit.state" filterable placeholder="Elige un status">
                <el-option v-for="item in status" :key="item.label" :label="item.label" :value="item.value!"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="deposit.groupId" filterable remote
                placeholder="Elige un grupo" :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!deposit.name && !deposit.state" native-type="submit">Editar</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar deposito</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="deposit"
            @submit.prevent="patchDeposit()">
            <el-form-item label="Nombre">
              <el-input v-model="deposit.name" placeholder="Ingrese aqui el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Status">
              <el-input v-model="deposit.state" placeholder="Ingrese aqui el status"></el-input>
            </el-form-item>
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="deposit.groupId" filterable remote
                placeholder="Elige un grupo" :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.name }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!deposit.name && !deposit.state" native-type="submit">Editar</el-button>
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

const loadingDeposit = ref(false);
const loadingGroup = ref(false);
const loadingUser = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  name: '',
  code: '',
  state: '',
  group: ''
});

const deposits = reactive<{
  rows: Deposit[],
  total: number
}>({
  rows: [],
  total: 0
})
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


const deposit = reactive<{
  id?: number,
  name: string,
  state: string,
  groupId?: number,
}>({
  id: undefined,
  name: '',
  state: '',
  groupId: undefined,
});

const status = [
  { label: "Deplegable", value: "deplegable" },
  { label: "Archivado", value: "archivado" },
  { label: "Pendiente", value: "pendiente" },
];


const getDeposits = async ({
  id,
  name,
  group,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  group?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingDeposit.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Deposit[] }>('/assets/deposits',
      {
        params: {
          ...(name != '' && !name && id && {
            id
          }),
          ...(name != '' && name && {
            name
          }),
          ...(group != '' && group && {
            group
          }),
          ...(offset && {
            offset: (offset - 1) * limit
          }),
          ...(limit && {
            limit
          })
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingDeposit.value = false;
    return data.value
  } catch (error) {
    loadingDeposit.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}
const getUser = async ({
  id,
  name,
  code,
  parent,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  code?: string,
  parent?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingDeposit.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Deposit[] }>('/deposits',
      {
        params: {
          ...(name != '' && !name && id && {
            id
          }),
          ...(name != '' && name && {
            name
          }),
          ...(code != '' && code && {
            code
          }),
          ...(parent != '' && parent && {
            parent
          }),
          ...(offset && {
            offset: (offset - 1) * limit
          }),
          ...(limit && {
            limit
          })
        }
      }
    );
    if (error.value) {
      ElNotification({
        message: 'Error al obtener las marcas intente de nuevo mas tarde'
      })
    }

    loadingDeposit.value = false;
    return data.value
  } catch (error) {
    loadingDeposit.value = false;
    ElNotification({
      message: 'Error al obtener las marcas intente de nuevo mas tarde'
    })
  }
}

const createDeposit = async () => {
  try {
    loadingDeposit.value = true;

    const { data, error } = await useFetch<Deposit>('/deposits',
      {
        method: 'post',
        body: {
          name: deposit.name,
          state: deposit.state,
          groupId: deposit,
        }
      },
    )
    loadingDeposit.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear marcas intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setDeposits()
    ElNotification({
      title: 'Categoria creada correctamente',
      message: `${data.value?.name}`
    })
    deposit.id = undefined;
    deposit.name = '';
    deposit.groupId = undefined
    return data.value
  } catch (error) {
    loadingDeposit.value = false;
    ElNotification({
      title: 'Error al crear marcas intente de nuevo mas tarde',
    })
  }
}

const patchDeposit = async () => {
  try {
    loadingDeposit.value = true;

    const body = {
      name: deposit.name,
      state: deposit.state,
      groupId: deposit.groupId
    }

    const { data, error } = await useFetch<Deposit>(`/assets/deposits/${deposit.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingDeposit.value = false;


    if (error.value) {
      throw error
    }
    await setDeposits()
    ElNotification({
      title: 'Categoria modificada correctamente',
      message: `${data.value?.name}`
    })

    deposit.id = undefined;
    deposit.name = '';
    deposit.groupId = undefined;

    return data.value
  } catch (error) {
    loadingDeposit.value = false;
    ElNotification({
      title: 'Error al modificar la deposito intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editDeposit = (row: Deposit) => {
  modals.edit = true;
  deposit.id = row.id;
  deposit.name = row.name || '';
  deposit.state = row.state || '';
  deposit.groupId = row.group?.id;
}

const removeDeposit = async (id: number) => {
  try {
    const { data, error } = await useFetch<Deposit>(`/assets/deposits/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingDeposit.value = false;
      ElNotification({
        message: 'Error al borrar la deposito intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'La deposito ha sido borrada.'
    })
    await setDeposits()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar la deposito intente de nuevo mas tarde.'
    })
  }
}

const setDeposits = async () => {
  const query = {
    name: filters.name,
    code: filters.code,
    limit: filters.limit,
    offset: filters.offset,
    group: filters.group
  }
  const rta = await getDeposits(query);
  deposits.rows = rta?.rows || []
  deposits.total = rta?.total || 0
}


const getGroups = async ({
  id,
  name,
  limit = 10,
  offset = 0
}: {
  id?: number,
  name?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
      {
        params: {
          ...(name != '' && !name && id && {
            id
          }),
          ...(name != '' && name && {
            name
          }),
          ...(offset && {
            offset: (offset - 1) * limit
          }),
          ...(limit && {
            limit
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
const setGroup = async (query?: string) => {
  const search = {
    name: query,
    id: deposit.groupId
  }
  const rta = await getGroups(search);
  groups.rows = rta?.rows || []
  groups.total = rta?.total || 0
}

watch(filters, useDebounce(async () => {
  await setDeposits()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
    await setGroup()
  } else {
    deposit.id = undefined;
    deposit.state = '';
    deposit.name = '';
    deposit.groupId = undefined;
  }
})

onMounted(async () => {
  await setDeposits();
});
</script>