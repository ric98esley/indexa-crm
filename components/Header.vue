<script lang="ts" setup>

const user = defineProps({
  name: {type: String},
  logout: {
    type: Function,
    default: () =>{}
  },
})
</script>

<template>
    <div class="toolbar">
      <el-dropdown>
        <div class="mr-2 mt-0.5 text-slate-300">
          <Icon name="ep:setting" class="mr-2" />
          <span>{{ user.name }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Ver mis activos</el-dropdown-item>
            <el-dropdown-item @click="logout()">Salir</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
</template>