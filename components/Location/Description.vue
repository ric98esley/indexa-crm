<script setup lang="ts">

const props = defineProps({
  place: {
    type: Object,
    default: () => ({
      isActive: false,
      code: '',
      phone: '',
      rif: '',
      address: '',
      name: '',
      group: {
        code: '',
        name: ''
      },
    })
  },
})
</script>

<template>
  <el-descriptions :column="3" border>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="mdi-light:eye" />
          Código
        </div>
      </template>
      {{ props.place?.code }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:phone" />
          Teléfono
        </div>
      </template>
      <Copy :text="props.place?.phone" />
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:school" />
          Agencia
        </div>
      </template>
      {{ props.place?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:connection" />
          Grupo
        </div>
      </template>
      {{ props.place?.group?.code }} - {{ props.place?.group?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:user" />
          Responsable
        </div>
      </template>
      {{ props.place?.manager?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:info-filled" />
          Tipo
        </div>
      </template>
      {{ props.place?.type?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:location" />
          Zona
        </div>
      </template>
      {{ props.place?.zone?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:place" />
          Dirección
        </div>
      </template>
      {{ props.place?.address }}
    </el-descriptions-item>
  </el-descriptions>
</template>