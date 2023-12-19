<script setup lang="ts">

const props = defineProps({
  id: {
    type: Number || String
  }
})

const emit = defineEmits({
  submit: (payload: { id: number }) => {
    if (payload.id) return true;
  }
})

const addContact = ref(false);

const GroupService = useGroups();
const CustomerService = useCustomer();
const TypeServices = useTypes();
const ZoneServices = useZones();
const LocationsServices = useLocation();
const groupService = new GroupService();
const contactService = new CustomerService();
const typeServices = new TypeServices();
const zoneServices = new ZoneServices();
const locationsServices = new LocationsServices();

const place = reactive<{
  code: string,
  name: string,
  typeId?: number,
  zoneId?: number,
  groupId?: number,
  isActive?: boolean,
  phone?: string,
  rif?: string,
  address?: string,
  managerId?: number
}>({
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

const loadingPlace = ref(false);
const loadingGroup = ref(false);
const loadingZone = ref(false);
const loadingType = ref(false);
const loadingUser = ref(false);

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
  rows: Profile[],
  total: number
}>({
  rows: [],
  total: 0
})


const setGroup = async (query?: string) => {
  const search = {
    name: query,
  }

  const rta = await groupService.getGroups(search);
  groups.rows = rta?.rows || []
  groups
}
const setZone = async (query?: string) => {
  const search = {
    name: query,
  }
  const rta = await zoneServices.getZones(search);
  zones.rows = rta?.rows || []
  zones.total = rta?.total || 0
}
const setTypes = async (query?: string) => {
  const search = {
    name: query,
    status: 'asignado'
  }
  const rta = await typeServices.getTypes(search);
  types.rows = rta?.rows || []
  types.total = rta?.total || 0
}

const setContact = async (query?: string) => {
  const search = {
    search: query || '',
    limit: 20
  }
  const rta = await contactService.getCustomers(search);
  users.rows = rta?.rows || []
  users.total = rta?.total || 0
}

const createPlace = async () => {
  try {
    if (!place.zoneId || !place.typeId || !place.groupId) return;
    const { data } = await locationsServices.createLocation({
      name: place.name,
      code: place.code,
      isActive: place.isActive,
      zoneId: place.zoneId,
      typeId: place.typeId,
      managerId: place.managerId,
      groupId: place.groupId,
      rif: place.rif,
      phone: place.phone,
      address: place.address,
    })

    emit('submit', { id: data.value.id })

  } catch (error) {
    console.error(error)
  }
}

const rules = {
  code: [
    { required: true, message: 'El código es obligatorio' }
  ],
  name: [
    { required: true, message: 'El nombre es obligatorio' }
  ],
  zoneId: [
    { required: true, message: 'La zona es obligatoria' }
  ],
  groupId: [
    { required: true, message: 'El grupo es obligatorio' }
  ],
  typeId: [
    { required: true, message: 'El tipo es obligatoria' }
  ],
  phone: [
    { min: 6, message: 'El teléfono debe tener mas de 6 caracteres' },
    { pattern: /^[0-9]+$/, message: 'El teléfono debe ser de tipo numérico' },
  ]
}


</script>

<template>
  <el-container>
    <el-col>
      <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="place" :rules="rules"
        @submit.prevent="createPlace()" v-model="place" require-asterisk-position="right">
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form-item label="Código" prop="code">
              <el-input v-model="place.code" placeholder="Ingrese el código de la agencia"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Activar" prop="isActive">
              <el-switch v-model="place.isActive" class="ml-2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Nombre" prop="name">
          <el-input v-model="place.name" placeholder="Ingrese el nombre"></el-input>
        </el-form-item>
        <el-form-item label="Zona" prop="zoneId">
          <el-select class="w-full" v-model="place.zoneId" filterable remote placeholder="Elige una zona"
            :loading="loadingZone" :remote-method="setZone">
            <el-option v-for="item in zones.rows" :key="item.id" :label="item.name" :value="item.id!">
              <span style="float: left">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Teléfono" prop="phone">
          <el-input v-model="place.phone" placeholder="Ingrese el teléfono"></el-input>
        </el-form-item>
        <el-form-item label="Tipo de agencia" prop="typeId">
          <el-select class="w-full" v-model="place.typeId" filterable remote placeholder="Elige un tipo"
            :loading="loadingType" :remote-method="setTypes">
            <el-option v-for="item in types.rows" :key="item.id" :label="item.name" :value="item.id!">
              <span style="float: left">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Grupo" prop="groupId">
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
        <el-form-item label="Responsable" prop="managerId">
          <el-row justify="space-between" class="w-full">
            <el-col :span="20" :lg="22">
              <el-row justify="end">
                <el-select class="w-full" v-model="place.managerId" filterable remote placeholder="Elige un responsable"
                  :loading="loadingUser" :remote-method="setContact">
                  <el-option v-for="item in users.rows" :key="item.id"
                    :label="`${item.name} ${item.lastName} - ${item.cardId}`" :value="item.id!">
                    <span style="float: left">{{ item.name }} {{ item.lastName }}</span>
                    <span style="float: right;">{{ item.phone }}</span> </el-option>
                </el-select>
              </el-row>
            </el-col>
            <el-col :span="4" :lg="2">
              <el-row justify="end">
                <el-button type="info" @click="addContact = true">
                  <Icon name="ep:plus" />
                </el-button>
              </el-row>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="RIF" prop="rif">
          <el-input v-model="place.rif" placeholder="RIF"></el-input>
        </el-form-item>
        <el-form-item label="Dirección" prop="address">
          <el-input v-model="place.address" placeholder="Dirección"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loadingPlace" type="primary"
            :disabled="!place.name && !place.code && !place.zoneId && !place.typeId"
            native-type="submit">Crear</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-dialog v-model:model-value="addContact">
      <template #header>
        Agregar un contacto
      </template>
      <ContactsFormSave />
    </el-dialog>
  </el-container>
</template>