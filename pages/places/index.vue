<template>
  <el-container direction="vertical" class="p-3">
    <el-row :span="24" :gutter="12">
      <el-table :data="places.rows" stripe v-loading="loadingPlace">
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
        <el-table-column label="Codigo" prop="code">
          <template #header>
            <el-input v-model="filters.code" placeholder="Código" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Padre" prop="group.name">
          <template #header>
            <el-input v-model="filters.group" placeholder="Grupo" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Activar">
          <template #default="{ row }">
            <el-switch v-model="row.isActive" class="ml-2"
              @change="(val) => (updatePlaceStatus({ active: val || false, placeId: row.id }))" />
          </template>
        </el-table-column>
        <el-table-column label="Acciones">
          <template #default="props">
            <el-row>
              <el-button type="info" circle @click="editPlace(props.row)">
                <Icon name="ep:edit" />
              </el-button>
              <el-button type="primary" circle>
                <Icon name="ep:view" />
              </el-button>
              <el-button type="danger" circle @click="removePlace(props.row.id)">
                <Icon name="ep:delete" />
              </el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="m-4" v-model:current-page="filters.offset" v-model:page-size="filters.limit"
        :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="places.total" />
    </el-row>
    <el-container>
      <el-dialog v-model="modals.create">
        <template #header>
          <h2>Crear nuevo taquilla</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="place"
            @submit.prevent="createPlace()">
            <el-row :gutter="20">
              <el-col :span="18">
                <el-form-item label="Codigo">
                  <el-input v-model="place.code" placeholder="Ingrese el código de la taquilla"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="Activar">
                  <el-switch v-model="place.isActive" class="ml-2" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Nombre">
              <el-input v-model="place.name" placeholder="Ingrese el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Zona">
              <el-input v-model="place.zoneId" placeholder="Ingrese la zona"></el-input>
            </el-form-item>
            <el-form-item label="Teléfono">
              <el-input v-model="place.phone" placeholder="Ingrese el teléfono"></el-input>
            </el-form-item>
            <el-form-item label="Tipo">
              <el-select class="w-full" v-model="place.typeId" filterable placeholder="Elige un tipo">
                <el-option v-for="item in roles" :key="item.label" :label="item.label" :value="item.value!"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="place.groupId" filterable remote placeholder="Elige un grupo"
                :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Telefono">
              <el-input v-model="place.managerId" placeholder="Responsable"></el-input>
            </el-form-item>
            <el-form-item label="RIF">
              <el-input v-model="place.rif" placeholder="RIF"></el-input>
            </el-form-item>
            <el-form-item label="Dirección">
              <el-input v-model="place.address" placeholder="Dirección"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!place.name && !place.code && !place.zoneId && !place.typeId"
                native-type="submit">Crear</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>
      <el-dialog v-model="modals.edit">
        <template #header>
          <h2>Editar taquilla</h2>
        </template>
        <template #default>
          <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="place"
            @submit.prevent="patchPlace()">
            <el-row :gutter="20">
              <el-col :span="18">
                <el-form-item label="Codigo">
                  <el-input v-model="place.code" placeholder="Ingrese el código de la taquilla"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="Activar">
                  <el-switch v-model="place.isActive" class="ml-2" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Nombre">
              <el-input v-model="place.name" placeholder="Ingrese el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Apellido">
              <el-input v-model="place.zoneId" placeholder="Ingrese el nombre"></el-input>
            </el-form-item>
            <el-form-item label="Telefono">
              <el-input v-model="place.phone" placeholder="Ingrese el telefono"></el-input>
            </el-form-item>
            <el-form-item label="Rol">
              <el-select class="w-full" v-model="place.typeId" filterable placeholder="Elige un rol">
                <el-option v-for="item in roles" :key="item.label" :label="item.label" :value="item.value!"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="place.groupId" filterable remote placeholder="Elige un grupo"
                :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.code }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Telefono">
              <el-input v-model="place.phone" placeholder="Ingrese la contraseña"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :disabled="!place.name && !place.code && !place.zoneId && !place.typeId"
              native-type="submit">Editar</el-button>
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
import { useFetch } from 'nuxt/app';

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'auditor', 'receptor'],
});

const loadingPlace = ref(false);
const loadingGroup = ref(false);

const filters = reactive({
  limit: 10,
  offset: 0,
  code: '',
  group: '',
  name: '',
  address: '',
  cardId: '',
  email: '',
});

const places = reactive<{
  rows: Place[],
  total: number
}>({
  rows: [],
  total: 0
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

const roles = [
  { label: "Taquilla", value: "taquilla" },
  { label: "Técnico", value: "tecnico" },
  { label: "Auditor", value: "auditor" },
  { label: "Receptor", value: "receptor" },
  { label: "Asistente", value: "asistente" },
];


const place = reactive<Place>({
  id: undefined,
  name: '',
  code: '',
  isActive: false,
  zoneId: undefined,
  typeId: undefined,
  managerId: undefined,
  groupId: undefined,
  rif: '',
  phone: '',
  address: '',
});

const getPlaces = async ({
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
    loadingPlace.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Place[] }>('/locations',
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
      throw new Error('Error al cargar los taquillas')
    }

    loadingPlace.value = false;
    return data.value
  } catch (error) {
    loadingPlace.value = false;
    ElNotification({
      message: 'Error al obtener las taquilla intente de nuevo mas tarde'
    })
  }
}

const createPlace = async () => {
  try {
    loadingPlace.value = true;

    const body = useFilterObject(place);

    const { data, error } = await useFetch<Place>('/locations',
      {
        method: 'POST',
        body
      },
    )
    loadingPlace.value = false;

    if (error.value && error.value.statusCode && error.value.statusCode >= 400) {
      ElNotification({
        title: 'Error al crear taquilla intente de nuevo mas tarde',
        message: error.value?.data.message.message,
      })
      return
    }
    await setPlaces()
    ElNotification({
      title: 'Usuario creada correctamente',
      message: `${data.value?.name}`
    })
    place.id = undefined;
    place.name = '';
    place.phone = '';
    place.isActive = false
    return data.value
  } catch (error) {
    loadingPlace.value = false;
    ElNotification({
      title: 'Error al crear taquilla intente de nuevo mas tarde',
    })
  }
}

const updatePlaceStatus = async ({ active, placeId }: { active: string | number | boolean, placeId: number }) => {
  try {
    let toSend = {
      isActive: active,
    };
    const { data, error } = await useFetch<Place>(`/places/${placeId}`,
      {
        method: 'PATCH',
        body: toSend
      }
    );

    if (error.value) {
      throw error
    }
    await setPlaces()
    ElNotification({
      title: 'Usuario modificada correctamente',
      message: `${data.value?.name}`
    })
  } catch (error) {
  }
}

const patchPlace = async () => {
  try {
    loadingPlace.value = true;

    const body = useFilterObject(place);
    delete body.id

    const { data, error } = await useFetch<Place>(`/places/${place.id}`,
      {
        method: 'PATCH',
        body
      }
    );
    loadingPlace.value = false;


    if (error.value) {
      throw error
    }
    await setPlaces()
    ElNotification({
      title: 'Usuario modificada correctamente',
      message: `${data.value?.name}`
    })

    place.id = undefined;
    place.name = '';
    place.phone = '';
    place.isActive = false
    return data.value
  } catch (error) {
    loadingPlace.value = false;
    ElNotification({
      title: 'Error al modificar el taquilla intente de nuevo mas tarde',
    })
    console.log(error)
  }
}

const editPlace = (row: Place) => {
  modals.edit = true;
  place.id = row.id;
  place.name = row.name || '';
  place.phone = row.phone || '';
  place.groupId = row.group?.id;
  place.isActive = row.isActive;

  if (row.group) groups.rows.push(row.group)
}

const removePlace = async (id: number) => {
  try {
    const { data, error } = await useFetch<Place>(`/places/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      loadingPlace.value = false;
      ElNotification({
        message: 'Error al borrar el taquilla intente de nuevo mas tarde.'
      });
      return
    }

    ElNotification({
      message: 'El taquilla ha sido borrada.'
    })
    await setPlaces()
  } catch (error) {
    ElNotification({
      message: 'Error al borrar el taquilla intente de nuevo mas tarde.'
    })
  }
}

const setPlaces = async () => {
  const query = {
    name: filters.name,
    limit: filters.limit,
    offset: filters.offset,
    parent: filters.name
  }
  const rta = await getPlaces(query);
  places.rows = rta?.rows || []
  places.total = rta?.total || 0
}

const getGroups = async ({
  name,
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
    loadingGroup.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Group[] }>('/groups',
      {
        params: {
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
  }
  const rta = await getGroups(search);
  groups.rows = rta?.rows || []
  groups
}

watch(filters, useDebounce(async () => {
  await setPlaces()
}, 500)
)

watch(() => modals.edit, async () => {
  if (modals.edit) {
  } else {
    place.id = undefined;
    place.name = '';
  }
})

onMounted(async () => {
  await setPlaces();
});
</script>