<template>
  <el-container class="layout-container-demo h-screen">
    <TabMenu :menus="menusA" />
    <el-container>
      <el-header style="text-align: right; font-size: 12px" class="relative bg-cyan-800 text-slate-300">
        <Header :name="user.name" />
      </el-header>
      <ClientOnly>
        <el-main>
          <el-scrollbar>
            <slot />
          </el-scrollbar>
        </el-main>
      </ClientOnly>
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
    roles: [
      'superuser',
      'auditor',
      'tecnico'
    ],
    groups: [
      {
        title: 'Lista de activos',
        items: [
          {
            roles: [
              'superuser',
              'auditor',
              'tecnico'
            ],
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
        roles: [
          'superuser',
          'auditor'
        ],
        items: [
          {
            title: 'Agregar',
            path: '/assets/add',
            roles: [
              'superuser',
              'auditor',
            ],
          },
          {
            title: 'Asignar',
            path: '/assets/assign',
            roles: [
              'superuser',
              'auditor',
            ],
          },
          {
            title: 'Recibir',
            path: '#',
            roles: [
              'superuser',
              'auditor',
            ],
          },
        ]
      }
    ]
  },
  {
    title: 'Configuración',
    icon: 'ep:setting',
    roles: [
      'superuser',
      'auditor'
    ],
    submenus: [
      {
        title: 'Categorias',
        icon: 'ep:memo',
        roles: [
          'superuser',
          'auditor'
        ],
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
        roles: [
          'superuser',
          'auditor'
        ],
        items: [
          {
            title: 'Ver marcas',
            path: '/config/brand'
          }
        ]
      },
      {
        title: 'Modelos',
        icon: 'ep:coin',
        roles: [
          'superuser',
          'auditor'
        ],
        items: [
          {
            title: 'Ver modelos',
            path: '/config/model'
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