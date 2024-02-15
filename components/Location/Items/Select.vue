<script setup lang="ts">
const LocationsServices = useLocation();
const locationsServices = new LocationsServices();

const props = defineProps({
  locationId: {
    type: Number,
  },
  filters: {
    type: Object,
    default: () => ({
      status: [],
      search: '',
      name: '',
      code: '',
      group: '',
      manager: '',
      groupId: '',
      type: '',
      rif: '',
      address: '',
      order: '',
      sort: '',
      limit: 10,
      offset: 0,
    })
  }
});

const emit = defineEmits(['update:locationId', 'update:filters'])

const loadingPlaces = ref(false);

let lastLocationId = 0;

const locationId = computed({
  get() {
    if(props.locationId && lastLocationId != 0 && props.locationId != lastLocationId) {
      getPlace(props.locationId);
      lastLocationId = props.locationId;
    }
    return props.locationId
  },
  set(value) {
    emit('update:locationId', value)
  }
});

const locations = reactive<{ rows: Place[], total: number }>({
  rows: [],
  total: 0
});

const getPlace = async (id: number) => {
  const location = await locationsServices.getLocation({ id });
  if (location) locations.rows.push(location)
}


const setPlaces = async (search: string) => {
  try {
    loadingPlaces.value = true;

    const query = {
      search,
      ...props.filters
    };

    const { data } = await locationsServices.getLocations(query)

    locations.rows = data.value.rows;
    locations.total = data.value.total;
  } catch (error) {
  }
}

onMounted(() => {
  if(props.locationId) getPlace(props.locationId);
})
</script>
<template>
  <el-select v-model="locationId" class="select-success" placeholder="Selecciona un lugar" label="Deposito"
    style="width: 100%" filterable clearable remote :remote-method="setPlaces">
    <el-option v-for="option in locations.rows" :key="option.id" :value="option.id!"
      :label="`${option.id} - ${option.name}`">
      {{ option.id }} - {{ option.code }} - {{ option.name }}
    </el-option>
  </el-select>
</template>