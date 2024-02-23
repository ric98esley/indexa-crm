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
        <RolesTableView :data="userRoles.rows"/>
      </el-col>
      <RolesFormSave />
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser']
});
const UserRoleServices = useUserRoles();
const userRolesService = new UserRoleServices();

const userRoles = reactive<{ total: number, rows: Role[] }>({
  total: 0,
  rows: []
})

const setRoles = async () => {
  const data = await userRolesService.find({})
  userRoles.rows = data?.rows || [];
  userRoles.total = data?.total || 0;
}

onMounted(async () => {
  await setRoles();
})

</script>