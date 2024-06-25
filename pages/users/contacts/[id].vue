<template>
  <el-container direction="vertical" class="p-4">
    <el-row>
      <PageHeader title="Lista de contactos">
      </PageHeader>
      <el-col>
        <el-table></el-table>
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
</script>