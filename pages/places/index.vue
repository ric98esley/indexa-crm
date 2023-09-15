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
        <el-table-column label="Grupo" prop="group.name">
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
              <el-button type="danger" circle @click="removePlace(props.row.id)" v-role="['superuser', 'auditor']">
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
              <el-select class="w-full" v-model="place.zoneId" filterable remote placeholder="Elige una zona"
                :loading="loadingZone" :remote-method="setZone">
                <el-option v-for="item in zones.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Teléfono">
              <el-input v-model="place.phone" placeholder="Ingrese el teléfono"></el-input>
            </el-form-item>
            <el-form-item label="Tipo de taquilla">
              <el-select class="w-full" v-model="place.typeId" filterable remote placeholder="Elige un tipo"
                :loading="loadingType" :remote-method="setTypes">
                <el-option v-for="item in types.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="place.groupId" filterable remote placeholder="Elige un grupo"
                :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="`${item.code} - ${item.name}`"
                  :value="item.id!">
                  <span style="float: left">{{ item.code }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.name }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Responsable">
              <el-select class="w-full" v-model="place.managerId" filterable remote effect="dark"
                placeholder="Elige un responsable" :loading="loadingUser" :remote-method="setUser">
                <el-option v-for="item in users.rows" :key="item.id"
                  :label="`${item.username} - ${item.name} ${item.lastName} - ${item.cardId}`" :value="item.id!">
                  <span style="float: left">{{ item.name }} {{ item.lastName }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.username }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="RIF">
              <el-input v-model="place.rif" placeholder="RIF"></el-input>
            </el-form-item>
            <el-form-item label="Dirección">
              <el-input v-model="place.address" placeholder="Dirección"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button :loading="loadingPlace" type="primary" :disabled="!place.name && !place.code && !place.zoneId && !place.typeId"
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
            <el-form-item label="Zona">
              <el-select class="w-full" v-model="place.zoneId" filterable remote placeholder="Elige una zona"
                :loading="loadingZone" :remote-method="setZone">
                <el-option v-for="item in zones.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Teléfono">
              <el-input v-model="place.phone" placeholder="Ingrese el teléfono"></el-input>
            </el-form-item>
            <el-form-item label="Tipo de taquilla">
              <el-select class="w-full" v-model="place.typeId" filterable remote placeholder="Elige un tipo"
                :loading="loadingType" :remote-method="setTypes">
                <el-option v-for="item in types.rows" :key="item.id" :label="item.name" :value="item.id!">
                  <span style="float: left">{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Grupo">
              <el-select class="w-full" v-model="place.groupId" filterable remote placeholder="Elige un grupo"
                :loading="loadingGroup" :remote-method="setGroup">
                <el-option v-for="item in groups.rows" :key="item.id" :label="`${item.code} - ${item.name}`"
                  :value="item.id!">
                  <span style="float: left">{{ item.code }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.name }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Responsable">
              <el-select class="w-full" v-model="place.managerId" filterable remote effect="dark"
                placeholder="Elige un responsable" :loading="loadingUser" :remote-method="setUser">
                <el-option v-for="item in users.rows" :key="item.id"
                  :label="`${item.username} - ${item.name} ${item.lastName} - ${item.cardId}`" :value="item.id!">
                  <span style="float: left">{{ item.name }} {{ item.lastName }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                  ">{{ item.username }}</span> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="RIF">
              <el-input v-model="place.rif" placeholder="RIF"></el-input>
            </el-form-item>
            <el-form-item label="Dirección">
              <el-input v-model="place.address" placeholder="Dirección"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button :loading="loadingPlace"  type="primary" :disabled="!place.name && !place.code && !place.zoneId && !place.typeId"
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
const loadingZone = ref(false);
const loadingType = ref(false);
const loadingUser = ref(false);

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
const zones = reactive<{
  rows: Zone[],
  total: number
}>({
  rows: [],
  total: 0
})
const types = reactive<{
  rows: Type[],
  total: number
}>({
  rows: [],
  total: 0
})
const users = reactive<{
  rows: User[],
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
      title: 'Taquilla creada correctamente',
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
    const { data, error } = await useFetch<Place>(`/locations/${placeId}`,
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
      title: 'Taquilla modificada correctamente',
      message: `${data.value?.name}`
    })
  } catch (error) {
    ElNotification({
      title: 'Taquilla modificada correctamente',
    })
  }
}

const patchPlace = async () => {
  try {
    loadingPlace.value = true;

    const body = useFilterObject(place);
    delete body.id

    const { data, error } = await useFetch<Place>(`/locations/${place.id}`,
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
      title: 'Taquilla modificada correctamente',
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
  place.rif = row.rif || '';
  place.address = row.address || '';
  place.code = row.code || '';
  place.groupId = row.group?.id;
  place.zoneId = row.zone?.id;
  place.managerId = row.manager?.id;
  place.typeId = row.type?.id;
  place.isActive = row.isActive;

  if (row.group) {
    groups.rows = []
    groups.rows.push(row.group)
  }
  if (row.zone) {
    zones.rows = []
    zones.rows.push(row.zone)
  }
  if (row.manager) {
    users.rows = []
    users.rows.push(row.manager)
  }
  if (row.type) {
    types.rows = []
    types.rows.push(row.type)
  }
}

const removePlace = async (id: number) => {
  try {
    const { data, error } = await useFetch<Place>(`/locations/${id}`, {
      method: 'delete'
    })

    if (error.value) {
      throw new Error()
    }

    ElNotification({
      message: 'la taquilla ha sido borrada.'
    })
    await setPlaces()
  } catch (error) {
    loadingPlace.value = false;
    ElNotification({
      message: 'Error al borrar la taquilla intente de nuevo mas tarde.'
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

const getZones = async ({ name }: {
  name?: string
}) => {
  try {
    loadingZone.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Zone[] }>('/locations/zones',
      {
        params: {
          ...(name != '' && name && {
            name
          })
        }
      }
    );
    if (error.value) {
      throw new Error()
    }

    loadingZone.value = false;
    return data.value
  } catch (error) {
    loadingZone.value = false;
    ElNotification({
      message: 'Error al obtener las zonas intente de nuevo mas tarde'
    })
  }
}

const getTypes = async ({ name }: {
  name?: string
}) => {
  try {
    loadingType.value = true;
    const { data, error } = await useFetch<{ total: number, rows: Type[] }>('/locations/types',
      {
        params: {
          ...(name != '' && name && {
            name
          }),
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

const getUser = async ({
  search,
  limit = 10,
  offset = 0
}: {
  search?: string,
  limit?: number,
  offset?: number
}) => {
  try {
    loadingUser.value = true;
    const { data, error } = await useFetch<{ total: number, rows: User[] }>('/users',
      {
        params: {
          ...(search != '' && search && {
            search
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
      throw new Error()
    }

    loadingUser.value = false;
    return data.value
  } catch (error) {
    loadingGroup.value = false;
    ElNotification({
      title: 'Error al obtener las marcas intente de nuevo mas tarde'
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
const setZone = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getZones(search);
  zones.rows = rta?.rows || []
  zones.total = rta?.total || 0
}
const setTypes = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await getTypes(search);
  types.rows = rta?.rows || []
  types.total = rta?.total || 0
}

const setUser = async (query?: string) => {
  const search = {
    search: query
  }
  const rta = await getUser(search);
  users.rows = rta?.rows || []
  users.total = rta?.total || 0
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