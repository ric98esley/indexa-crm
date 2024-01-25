<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute();
const token = route.query.token?.toLocaleString() || '';
</script>

<template>
  <AuthChangePassword :token="token" />
</template>