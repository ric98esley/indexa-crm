<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const editModal = ref(false)

const UserRoleServices = useUserRoles();
const userRolesService = new UserRoleServices();

const roleToEdit = ref<Role | null>(null)

const editRole = (role: Role) => {
  roleToEdit.value = role
  editModal.value = true
}

const deleteRole = (role: Role) => {
  if (role.name === 'superuser') {
    return alert('No puedes eliminar este rol')
  }

  if (role.id === undefined) return
  userRolesService.delete(role.id)
}

const updateRole = (role: Role) => {
  if (roleToEdit.value?.id === undefined) return
  userRolesService.update(roleToEdit.value.id, role)
  editModal.value = false
  emit('refresh')
}
</script>
<template>
  <el-col>
    <el-table :data="props.data">
      <el-table-column type="index" width="50" />
      <el-table-column prop="name" label="Nombre" min-width="180" />
      <el-table-column label="Fecha" min-width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column>
        <template #default="{ row }">
          <el-button type="text" size="small" @click="editRole(row)">Editar</el-button>
          <el-button type="text" size="small" @click="deleteRole(row)">Eliminar</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="Editar Role" v-model="editModal" destroy-on-close>
      <RolesFormSave v-if="roleToEdit" :form="roleToEdit" @submit="updateRole"/>
    </el-dialog>
  </el-col>
</template>