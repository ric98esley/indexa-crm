<script setup lang="ts">

const props = defineProps({
  group: {
    type: Object,
    default: () => ({
      name: '',
      manager: {
        id: undefined,
        username: '',
        profile: {
          id: undefined,
          name: '',
          lastName: '',
          phone: '',
        }
      },
      code: '',
      parent: {
        id: undefined,
        name: '',
        code: ''
      },
      createdBy: {
        id: undefined,
        username: '',
      }
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
      {{ props.group?.code }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:phone" />
          Teléfono de Receptor
        </div>
      </template>
      <Copy :text="props.group.manager?.profile?.phone" />
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:school" />
          Nombre
        </div>
      </template>
      {{ props.group?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:connection" />
          Padre
        </div>
      </template>
      {{ props?.group?.parent?.code }} - {{ props.group?.parent?.name }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          <Icon name="ep:user" />
          Responsable
        </div>
      </template>
      {{ props.group?.manager?.username }}
    </el-descriptions-item>
  </el-descriptions>
</template>