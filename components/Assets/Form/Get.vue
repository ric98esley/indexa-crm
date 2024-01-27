<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
    required: true
  },
  open: {
    type: Boolean,
  }
})

const OrderServices = useOrders();
const LocationServices = useLocation();
const orderServices = new OrderServices();
const locationServices = new LocationServices();

const emit = defineEmits(['update:open', 'submit'])

const getModal = computed({
  get() {
    return props.open
  },
  set(value) {
    emit('update:open', value)
  }
})

const warehouses = reactive<{
  rows: Place[],
  total: number
}>({
  rows: [],
  total: 0
})

const data = reactive<{
  locationId?: number,
  locations: Place[]
}>({
  locationId: undefined,
  locations: []
})

const checking = async () => {
  try {

    const target = {
      assetId: props.id,
      locationId: data.locationId
    }

    if (!target.assetId || !target.locationId) return;

    await orderServices.checking({ targets: [target] });
    emit('submit')
  } catch (error) {
    console.log()
  }
}

const getWarehouses = async (search: string) => {
  try {
    const { data } = await locationServices.getLocations({
      search,
      status: ['desplegable', 'archivado', 'pendiente']
    })

    warehouses.rows = data.value.rows;
    warehouses.total = data.value.total;

  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <el-dialog v-model="getModal">
    <el-form @submit.prevent="checking()" label-position="top">
      <el-form-item label="Deposito">
        <el-select v-model="data.locationId" class="select-success" placeholder="Selecciona un estado" label="Estados"
          style="width: 100%" name="assetWarehouse" filterable remote :remote-method="getWarehouses">
          <el-option v-for="option in warehouses.rows" :key="option.id" :value="option.id!"
            :label="`${option.id} - ${option.name}`">
            {{ option.id }} - {{ option.name }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Guardar</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>