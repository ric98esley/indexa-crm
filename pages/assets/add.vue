<template>
    <el-row :span="24">
      <el-col :sm="24" :md="24" :lg="8">
        <el-form label-position="top" label-width="auto">
          <el-form-item label="serial">
            <el-input placeholder="Serial">
            </el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
</template>

<script>
definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  roles: ['superuser', 'admin', 'tecnico'],
})
</script>