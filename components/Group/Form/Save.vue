<script setup lang="ts">
import { FormInstance } from 'element-plus';

const props = defineProps({
  id: { type: Number || undefined, }
});

const emit = defineEmits([
  'onSubmit'
]);

const group = reactive<Group>({
  name: '',
  code: '',
  parentId: undefined,
  managerId: undefined,
});

const saveGroupRef =  ref<FormInstance>();


const GroupService = useGroups();
const UserService = useUsers();
const groupService = new GroupService();
const userService = new UserService();

const parents = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
});

const users = reactive<{
  rows: User[],
  total: number
}>({
  rows: [],
  total: 0
});

const loadingParent = ref(false);
const loadingUser = ref(false);

const rules = {
  name: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
  ],
  code: [
    { required: true, message: 'El código es requerido', trigger: 'blur' },
  ],
  parentId: [
    { required: true, message: 'El padre es requerido', trigger: 'blur' },
  ],
};

const setParent = async (query: string) => {
  loadingParent.value = true;
  const data = await groupService.getGroups({
    limit: 10,
    offset: 1,
    name: query,
  });
  parents.rows = data?.rows || [];
  parents.total = data?.total || 0;
  loadingParent.value = false;
};

const setUser = async (query: string) => {
  loadingUser.value = true;
  const data = await userService.getUsers({
    limit: 10,
    offset: 1,
    search: query,
  });
  users.rows = data?.rows || [];
  users.total = data?.total || 0;
  loadingUser.value = false;
};

const patchGroup = async () => {
  try {
    await groupService.updateGroup(group);
  } catch (error) {
    console.log(error)
  }
}

const createGroup = async () => {
  try {
    await groupService.createGroup(group);
  } catch (error) {
    console.log(error)
  }
}

const saveGroup = async () => {
  try {
    if (props.id && props.id > 0) {
      await patchGroup();
    } else {
      await createGroup();
    }
    emit('onSubmit');
    saveGroupRef.value?.resetFields();
  } catch (error) {
    console.log(error)
  }
}

const setPlace = async () => {
  try {
    loadingParent.value = true;
    if (!props.id || props.id <= 0) return saveGroupRef.value?.resetFields();

    const data = await groupService.getGroup(props.id);

    parents.rows = [];
    users.rows = [];

    if(data?.parent) parents.rows.push(data.parent);
    if(data?.manager) users.rows.push(data.manager);

    group.code = data?.code || '';
    group.name = data?.name || '';
    group.parentId = data?.parent?.id || undefined;
    group.managerId = data?.manager?.id || undefined;

    loadingParent.value = false;
  } catch (error) {
    loadingParent.value = false;
    console.log(error)
  }
}

watch(() => props.id, async () => {
  await setPlace();
});

onMounted(async () => {
  await setPlace();
});

</script>

<template>
  <el-form label-position="top" label-width="auto" autocomplete="off" status-icon :model="group"
    @submit.prevent="saveGroup()" ref="saveGroupRef" :rules="rules">
    <el-form-item label="Nombre">
      <el-input v-model="group.name" placeholder="Ingrese aquí el nombre"></el-input>
    </el-form-item>
    <el-form-item label="Código" >
      <el-input v-model="group.code" placeholder="Ingrese aquí el código" :disabled="!!(props.id)"></el-input>
    </el-form-item>
    <el-form-item label="Padre">
      <el-select class="w-full" v-model="group.parentId" filterable remote placeholder="Elige un padre"
        :loading="loadingParent" :remote-method="setParent">
        <el-option v-for="item in parents.rows" :key="item.id" :label="item.name" :value="item.id!">
          <span style="float: left">{{ item.name }}</span>
          <span style="
                            float: right;
                            color: var(--el-text-color-secondary);
                            font-size: 13px;
                        ">{{ item.code }}</span> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Receptor">
      <el-select class="w-full" v-model="group.managerId" filterable remote placeholder="Elige un receptor"
        :loading="loadingUser" :remote-method="setUser">
        <el-option v-for="item in users.rows" :key="item.id" :value="item.id!" :label="`${item.username}`">
          <span style="float: left">{{ item.username }}</span>
          <span style="
                            float: right;
                            color: var(--el-text-color-secondary);
                            font-size: 13px;
                        ">{{ item.profile?.name }} {{ item.profile?.lastName }}</span> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="!group.name && !group.code" native-type="submit">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>