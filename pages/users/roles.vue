<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser']
});
const UserRoleServices = useUserRoles();
const userRolesService = new UserRoleServices();

const modals = reactive({
  create: false,
})

const userRoles = reactive<{ total: number, rows: Role[] }>({
  total: 0,
  rows: []
})

const setRoles = async () => {
  const data = await userRolesService.find({})
  userRoles.rows = data?.rows || [];
  userRoles.total = data?.total || 0;
}

const createRole = async (role: Role) => {
  await userRolesService.create(role)
  await setRoles()
  modals.create = false
}

onMounted(async () => {
  await setRoles();
})

</script>

<template>
  <el-container direction="vertical" class="p-4">
    <el-row :span="24" :gutter="20">
      <el-col :span="24">
        <PageHeader name="Roles" class="mb-4">
          <template #buttons>
            <div class="sm:flex items-center hidden">
            </div>
          </template>
        </PageHeader>
      </el-col>
      <el-col :span="24">
        <RolesTableView :data="userRoles.rows" @refresh="setRoles()" />
      </el-col>
      <el-dialog title="Crear Role" v-model="modals.create" destroy-on-close>
        <RolesFormSave @submit="createRole" />
      </el-dialog>
    </el-row>
    <LeftButton @click="modals.create = true" />
  </el-container>
</template>
