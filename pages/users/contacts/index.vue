<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <PageHeader name="Lista de contactos">
        <template #buttons>
          <el-input v-model="filters.search" placeholder="Buscar" />
        </template>
      </PageHeader>
      <el-col>
        <el-table :data="customers.rows">
          <el-table-column type="index" width="50">
          </el-table-column>
          <el-table-column type="expand">
            <template #default="{ row }">
              Creado el: {{ new Date(row.createdAt).toLocaleDateString() }}
            </template>
          </el-table-column>
          <el-table-column label="Nombre" prop="name" min-width="120">
          </el-table-column>
          <el-table-column label="Nombre" prop="lastName" min-width="120">
          </el-table-column>
          <el-table-column label="Cédula" prop="cardId" min-width="120">
          </el-table-column>
          <el-table-column label="Teléfono" prop="phone" min-width="120">
          </el-table-column>
          <el-table-column label="Acciones" width="180">
            <template #default="{ row }">
              <el-row>
                <el-button type="info" circle @click="editUser(row)" v-can="['customers:update']">
                  <Icon name="ep:edit" />
                </el-button>
                <!-- <el-button type="primary" circle @click="editUser(row)">
                  <Icon name="ep:view" />
                </el-button> -->
                <el-button type="danger" circle @click="removeContact(row.id)" v-can="['customers:delete']">
                  <Icon name="ep:delete" />
                </el-button>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
        <Pagination v-model:limit="filters.limit" v-model:offset="filters.offset" :total="customers.total" />
        <el-dialog v-model="addModal">
          <template #header>
            Agregar usuario
          </template>
          <ContactsFormSave @on-submit="setCustomer" :id="customerToEdit"></ContactsFormSave>
        </el-dialog>
        <LeftButton @click="addModal = true"></LeftButton>
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['customers:read', 'customers:update', 'customers:delete', 'customers:create']
});

const addModal = ref(false)

const CustomerServices = useCustomer();
const customerServices = new CustomerServices();

const customerToEdit = ref(0);

const filters = reactive({
  search: '',
  limit: 10,
  offset: 1
})

const customers = reactive<{ rows: Profile[], total: number }>({
  rows: [],
  total: 0
})


const setCustomer = async () => {
  try {
    const data = await customerServices.getCustomers(filters)

    customers.rows = data?.rows || [];
    customers.total = data?.total || 0;

    customerToEdit.value = 0;

  } catch (error) {
    console.log(error)
  }
}

const removeContact = async (id: number) => {
  try {
    await customerServices.removeCustomer({ id });
    setCustomer();
  } catch (error) {
    console.log(error)
  }
}

const editUser = (row: Profile) => {
  customerToEdit.value = row.id || 0;
  addModal.value = true;
}

watch(addModal, () => {
  if(!addModal.value) {
    customerToEdit.value = 0;
  }
})

watch(filters, useDebounce(
  () => setCustomer()
))

onMounted(async () => {
  await setCustomer()
})
</script>