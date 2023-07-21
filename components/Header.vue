<script lang="ts" setup>
const user = defineProps({
  name: {type: String}
})
</script>

<template>
    <div class="toolbar">
      <el-dropdown>
        <div class="mr-2 mt-0.5 text-slate-300">
          <Icon name="ep:setting" class="" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Ver mis activos</el-dropdown-item>
            <el-dropdown-item>Salir</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span>{{ user.name }}</span>
    </div>
</template>