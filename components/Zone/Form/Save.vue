<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number
  },
  name: {
    type: String
  }
})

const emit = defineEmits(['submit', 'update:id', 'update:name']);

const zone = reactive<{
  id?: number,
  name?: string
}>({
  id: undefined,
  name: ''
})

const zoneId = computed({
  get() {
    return props.id;
  },
  set(value) {
    emit('update:id', value)
  }
})
const zoneName = computed({
  get() {
    return props.name
  },
  set(value) {
    emit('update:name', value)
  }
})

const ZoneServices = useZones();
const zoneServices = new ZoneServices();

const rules = {
  name: [
    { required: true, message: 'El nombre es obligatorio' }
  ]
}

const setZone = () => {
  if (props.id == 0 || props.id == undefined) {
    zone.id = undefined;
    zone.name = undefined;

    return
  } else {
    zone.id = props.id;
    zone.name = props.name;
  };
}

const createZone = async () => {
  try {
    if (zone.name) await zoneServices.createZone({
      name: zone.name
    })
  } catch (error) {
    console.error(error)
  }
}
const editZone = async () => {
  try {
    if (!zone.id || !zone.name) return;
    await zoneServices.patchZone({
      id: zone.id,
      name: zone.name
    })
  } catch (error) {
    console.error(error)
  }
}

const saveZone = async () => {
  if (props.id == 0 || props.id == undefined) {
    await createZone();
  } else {
    await editZone();
  }

  zoneId.value = undefined;
  zoneName.value = '';

  emit('submit')
}

watch(() => props.id, () => {
  setZone()
})
onMounted(() => {
  setZone();
})
</script>
<template>
  <el-form label-position="top" label-width="auto" autocomplete="off" :rules="rules" status-icon :model="zone"
    @submit.prevent="saveZone()">
    <el-form-item label="Nombre">
      <el-input v-model="zone.name" placeholder="Ingrese aquí el nombre"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="!zone.name" native-type="submit">Crear</el-button>
    </el-form-item>
  </el-form>
</template>