<template>
  <el-container direction="vertical" class="p-3">
    <el-row>
      <PageHeader >
        <template #title>
          Grupo <el-tag>{{ group.code }}</el-tag> {{ group.name }}
        </template>
      </PageHeader>
      <el-col>
        <GroupDescription :group="group" />
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
    'nuxt-permissions'
  ],
  permissions: ['groups:read', 'groups:update', 'groups:delete', 'groups:create'],
});

const route = useRoute();

const GroupService = useGroups();
const groupService = new GroupService();

const group = reactive<{
  name: string,
  manager?: Profile,
  code: string,
  parent?: Group,
  parentId: number | undefined,
  isActive: boolean
}>({
  name: '',
  manager: undefined,
  code: '',
  parent: undefined,
  parentId: undefined,
  isActive: false
});

const loadingGroup = ref(false);

const setGroup = async () => {
  try {
    if (!route.params.id) return;
    const res = await groupService.getGroup(route.params.id.toString());
    if (!res) return;
    group.name = res.name || '';
    group.manager = res.manager || undefined;
    group.code = res.code;
    group.parent = res.parent;
    group.parentId = res.parentId;
  } catch (error) {

  }
}


onMounted(async () => {
  await setGroup()
})



</script>