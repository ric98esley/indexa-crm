<template >
  <el-container direction="vertical" class="p-3">
    <el-row :gutter="4">
      <PageHeader name="Árbol del sistema">
      </PageHeader>
      <el-col>
        <el-alert title="Esta funcionalidad esta en desarrollo" type="warning" />
        <el-row :span="24" class="p-8">
          <el-input v-model="filterTree" placeholder="Buscar" />
        </el-row>
        <el-row>
          <el-card class="w-120">
            <el-tree
              :data="tree.rows"
              node-key="id"
              accordion
              :default-expanded-keys="[1]"
              >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span>{{ data.name }}</span> -
                  <span> {{ data.code }}</span>
                </span>
              </template>
            </el-tree>
          </el-card>
        </el-row>
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts">
import Node from 'element-plus/es/components/tree/src/model/node';

const GroupService = useGroups();
const groupService = new GroupService();

const filterTree = ref<string>('');

const groups = reactive<{
  rows: Group[],
  total: number
}>({
  rows: [],
  total: 0
})

const tree = reactive<{
  rows: object[],
}>({
  rows: [],
})

const getGroups = async () => {
  try {
    const data = await groupService.getGroups({
    });
    groups.rows = data?.rows || [];
    groups.total = data?.total || 0;
  } catch (error) {
  } finally {
  }
};

const handleNodeClick = (data: any) => {
  console.log(data)
}

const makeTree = (rows: Group[]) => {
  // Crear un objeto para almacenar los nodos por su id
  const nodosById = {};

  // Primero, crear un mapa de nodos por su id para facilitar la búsqueda
  rows.forEach((row) => {
    nodosById[row.id] = row;
    row.children = []; // Agregar una propiedad para almacenar los hijos de este nodo
  });

  // Luego, recorrer los nodos para construir el árbol
  rows.forEach((row) => {
    const parentId = row.parent ? row.parent.id : null;

    if (parentId) {
      // Si el nodo tiene un parent, agregarlo como hijo del parent correspondiente
      const parent = nodosById[parentId];
      if (parent) {
        parent.children.push(row);
      }
    }
  });

  // En este punto, los nodos en el array "rows" están organizados en un árbol
  // Puedes acceder a los nodos raíz a través de la variable "rows" o "nodosById",
  // dependiendo de tus necesidades.

  // Por ejemplo, si deseas acceder a los nodos raíz (sin parents):
  const nodosRaiz = rows.filter((row) => !row.parent);

  return nodosRaiz;
}

const loadNode = (node: Node, resolve: (data: Group[]) => void) => {
  if (node.level === 0) {
    const groups = groupService.getGroups({
      parent: 'null'
    });
    return resolve(groups);
  }
  resolve(node.data.children);
}


const setTree = async () => {
  await getGroups();
  const arbol = makeTree(groups.rows);
  tree.rows = arbol;
}

onMounted(async () => {
  await setTree();
});

</script>