<script setup lang="ts">
import { FormItemProp } from 'element-plus';

const ContactService = useCustomer();
const contactService = new ContactService();

const props = defineProps({
  id: {
    type: Number || undefined,
  },
})

const emit = defineEmits(
  [
    'onSubmit'
  ]
)


const profile = reactive<Profile>({
  id: undefined,
  name: undefined,
  lastName: undefined,
  cardId: undefined,
  phone: undefined
})

const allowSubmit = ref(false);

const rules = {
  name: [
    { min: 3, message: 'El nombre debe tener mas de 3 caracteres' },
    { type: 'string', message: 'El nombre debe ser de tipo texto' },
    { required: true, message: 'El nombre es obligatorio' }
  ],
  lastName: [
    { min: 3, message: 'El apellido debe tener mas de 3 caracteres' },
    { type: 'string', message: 'El apellido debe ser de tipo texto' }
  ],
  cardId: [
    { min: 3, message: 'La cédula debe tener mas de 3 caracteres' },
    { pattern: /^[0-9]+$/, message: 'La cédula debe ser de tipo numérico' }
  ],
  phone: [
    { min: 6, message: 'El teléfono debe tener mas de 6 caracteres' },
    { pattern: /^[0-9]+$/, message: 'El teléfono debe ser de tipo numérico' },
    { required: true, message: 'El teléfono es obligatorio' }
  ],
}

const validateUser = (props: FormItemProp, isValid: boolean, message: string) => {
  allowSubmit.value = isValid;
}

const editContact = async () => {
  try {
    await contactService.editCustomer(profile)
  } catch (error) {
    console.log(error);
  }
}

const createContact = async () => {
  try {
    if (!profile.name && !profile.phone) return;
    await contactService.createCustomer({
      name: profile.name,
      lastName: profile.lastName,
      cardId: profile.cardId,
      phone: profile.phone
    })
  } catch (error) {
    console.log(error)
  }

}

const getContact = async () => {
  try {
    if (props.id == 0 || props.id == undefined) {
      profile.id = undefined;
      profile.name = undefined;
      profile.lastName = undefined;
      profile.cardId = undefined;
      profile.phone = undefined;
      return
    };
    const contact = await contactService.getOneCustomer({ id: props.id })

    profile.id = contact?.id;
    profile.name = contact?.name;
    profile.lastName = contact?.lastName;
    profile.cardId = contact?.cardId;
    profile.phone = contact?.phone;
  } catch (error) {
    console.error(error)
  }
}

const saveContact = async () => {
  try {
    if (props.id == 0 || props.id == undefined) {
      await createContact();
    } else {
      await editContact();
    }
    emit('onSubmit')
  } catch (error) {
    console.log(error)
  }
}

watch(() => props.id, async () => {
  await getContact()
})
onMounted(async () => {
  await getContact();
})

</script>
<template>
  <el-form @submit.prevent="saveContact" label-position="top" :rules="rules" :model="profile" @validate="validateUser"
    label-width="auto" autocomplete="off" status-icon require-asterisk-position="right">
    <el-form-item label="Nombre" prop="name">
      <el-input v-model="profile.name" placeholder="Ingrese el nombre"></el-input>
    </el-form-item>
    <el-form-item label="Apellido" prop="lastName">
      <el-input v-model="profile.lastName" placeholder="Ingrese el apellido"></el-input>
    </el-form-item>
    <el-form-item label="Cédula o RIF" prop="cardId" type="number">
      <el-input v-model="profile.cardId" placeholder="Ingrese la cédula" type="number"></el-input>
    </el-form-item>
    <el-form-item label="Teléfono" prop="phone">
      <el-input v-model="profile.phone" placeholder="Ingrese el teléfono" prop="profile.phone" type="number"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button native-type="submit" type="primary" :disabled="!allowSubmit || !profile.name || !profile.phone">
        Guardar
      </el-button>
    </el-form-item>
  </el-form>
</template>