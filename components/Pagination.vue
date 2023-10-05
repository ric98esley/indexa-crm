<script setup lang="ts">

const props = defineProps({
  offset: {
    type: Number,
  },
  limit: {
    type: Number,
  },
  total: {
    type: Number,
  }
})
const emit = defineEmits(['update:offset', 'update:limit'])

const offset = computed({
  get() {
    return props.offset
  },
  set(offset) {
    emit('update:offset', offset)
  }
})
const limit = computed({
  get() {
    return props.limit
  },
  set(limit) {
    emit('update:limit', limit)
  }
})
</script>

<template>
  <div class="max-md:hidden">
    <el-pagination class="m-4" v-model:current-page="offset" v-model:page-size="limit"
      :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, pager, next, jumper"
      :total="props.total" />
  </div>
  <div class="md:hidden">
    <el-pagination class="m-4" v-model:current-page="offset" v-model:page-size="limit"
      :page-sizes="[10, 20, 50, 100, 200, 300, 400]" :background="true" layout="total, sizes, prev, next, jumper"
      :total="props.total" />
  </div>
</template>