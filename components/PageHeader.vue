<script lang="ts" setup>

const props = defineProps({
  name: { type: String },
})

const router = useRouter();

const onBack = () => {
  router.back();
}
</script>

<template>
  <el-col :span="24">
    <el-row>
      <el-page-header @back="onBack" class="w-full">
        <template #content>
          <div class="flex items-center">
            <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
              {{ props.name }}
            </span>
          </div>
        </template>
      </el-page-header>
    </el-row>
  </el-col>
</template>