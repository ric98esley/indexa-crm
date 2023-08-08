<template>
  <el-container class="layout-container-demo h-screen">
    <TabMenu :menus="menusA" />
    <el-container >
      <el-header style="text-align: right; font-size: 12px" class="relative bg-cyan-800 text-slate-300">
        <Header :name="user.name"/>
      </el-header>
      <el-main>
        <el-scrollbar>
          <slot />
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/authStore';


const auth = useAuthStore();

const user = auth.getUser;

const menusA = reactive([
  {
    title: 'Activos',
    icon: 'ep:files',
    groups: [
      {
        title: 'Lista de activos',
        items: [
          {
            title: 'Todos los activos',
            path: '/assets'
          }
        ]
      }
    ],
    submenus: [
      {
        title: 'Acciones',
        icon: 'ep:element-plus',
        items: [
          {
            title: 'Agregar',
            path: '/assets/add'
          },
          {
            title: 'Recibir',
            path: '#'
          },
          {
            title: 'Agregar',
            path: '#'
          }
        ]
      }
    ]
  },
  {
    title: 'Configuración',
    icon: 'ep:setting',

    submenus: [
      {
        title: 'Categorias',
        icon: 'ep:memo',
        items: [
          {
            title: 'Ver Categorias',
            path: '/config/category'
          },
          {
            title: 'Campos personalizados',
            path: '/config/category/specification'
          }
        ]
      },
      {
        title: 'Marcas',
        icon: 'ep:collection',
        items: [
          {
            title: 'Ver marcas'
          }
        ]
      },
      {
        title: 'Modelos',
        icon: 'ep:coin',
        items: [
          {
            title: 'Ver modelos'
          }
        ]
      },
    ]
  }
])

</script>

<style scoped>
.layout-container-demo .el-main {
  padding: 0;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>