<template>
  <el-container class="layout-container-demo h-screen">
    <el-aside width="14rem" class="max-lg:hidden">
      <Logo width="w-20" margin="m-0" />
      <div>
        <el-scrollbar max-height="90vh">
          <TabMenu :menus="menusA" />
        </el-scrollbar>
      </div>
    </el-aside>
    <el-drawer v-model="app.$state.tabMenu" direction="ltr" size="100%">
      <template #header>
        <Logo width="w-32" margin="m-0" />
      </template>
      <el-aside width="max">
        <div>
          <el-scrollbar max-height="90vh">
            <TabMenu :menus="menusA" />
          </el-scrollbar>
        </div>
      </el-aside>
    </el-drawer>
    <el-container>
      <el-header
        class="flex max-md:justify-between lg:justify-end items-center text-sm relative bg-cyan-800 text-slate-300">
        <div class="lg:hidden w-12" @click="app.$state.tabMenu = !app.$state.tabMenu">
          <Icon name="ep:menu" size="24px" />
        </div>
        <Header :name="user.username" :logout="() => auth.reset()" />
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
import { useAppStore } from '@/stores/appStore';

const app = useAppStore();

const auth = useAuthStore();

const user = auth.getUser;

const menusA = reactive([
  {
    title: 'Activos',
    icon: 'ep:files',
    roles: [
      'superuser',
      'auditor',
      'tecnico',
      'receptor'
    ],
    groups: [
      {
        title: 'Lista de activos',
        items: [
          {
            roles: [
              'superuser',
              'auditor',
              'tecnico',
              'receptor'
            ],
            title: 'Todos los activos',
            route: { path: '/assets' }
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
            route: { path: '/assets/add' },
            roles: [
              'superuser',
              'auditor',
            ],
          },
          {
            title: 'Asignar',
            route: { path: '/assets/assign' },
            roles: [
              'superuser',
              'auditor',
            ],
          },
          {
            title: 'Recibir',
            route: { path: '/assets/get' },
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
    title: 'Usuarios',
    icon: 'ep:user',
    roles: [
      'superuser',
      'auditor',
      'receptor'
    ],
    groups: [
      {
        title: 'Ver y crear usuarios',
        items: [
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Usuarios',
            route: { path: '/users' }
          }
        ]
      }
    ],
  },
  {
    title: 'Consumibles',
    icon: 'ep:brush',
    roles: [
      'superuser',
      'auditor',
      'receptor'
    ],
    groups: [
      {
        title: 'Ver y crear',
        items: [
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Inventario',
            route: { path: '/consumables' }
          },
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Productos',
            route: { path: '/consumables/products' }
          },
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Historial',
            route: { path: '/consumables/history' }
          }
        ]
      }
    ],
  },
  {
    title: 'Agencias',
    icon: 'ep:school',
    roles: [
      'superuser',
      'auditor',
      'receptor'
    ],
    groups: [
      {
        title: 'Ver y crear agencias',
        items: [
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Agencias',
            route: { path: '/places' }
          },
          {
            roles: [
              'superuser',
              'auditor',
            ],
            title: 'Tipos',
            route: { path: '/places/type' }
          },
          {
            roles: [
              'superuser',
              'auditor',
            ],
            title: 'Zonas',
            route: { path: '/places/zone' }
          }
        ]
      }
    ],
  },
  {
    title: 'Reportes',
    icon: 'ep:document-copy',
    roles: [
      'superuser',
      'auditor',
      'receptor'
    ],
    groups: [
      {
        title: 'Ver',
        items: [
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Salidas',
            route: {
              path: '/assignments',
              query: {
                type: 'checkout'
              }
            }
          },
          {
            roles: [
              'superuser',
              'auditor',
              'receptor'
            ],
            title: 'Entradas',
            route: {
              path: '/assignments',
              query: {
                type: 'checking'
              }
            }
          },
        ]
      }
    ],
  },
  {
    title: 'Configuración',
    icon: 'ep:setting',
    roles: [
      'superuser',
      'auditor',
      'receptor'
    ],
    submenus: [
      {
        title: 'Categorías',
        icon: 'ep:memo',
        roles: [
          'superuser',
          'auditor'
        ],
        items: [
          {
            title: 'Ver',
            route: { path: '/config/category' }
          },
          {
            title: 'Campos personalizados',
            route: { path: '/config/category/specification' }
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
            route: { path: '/config/brand' }
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
            route: { path: '/config/model' }
          }
        ]
      },
      {
        title: 'Depósitos',
        icon: 'ep:house',
        roles: [
          'superuser',
          'auditor',
          'admin'
        ],
        items: [
          {
            title: 'Ver grupos',
            route: { path: '/config/deposit' }
          }
        ]
      },
      {
        title: 'Grupos',
        icon: 'ep:connection',
        roles: [
          'superuser',
          'auditor',
          'admin',
          'receptor'
        ],
        items: [
          {
            title: 'Ver grupos',
            route: { path: '/config/group' }
          }
        ]
      }
    ]
  }
])

</script>

<style scoped >
.layout-container-demo .el-main {
  padding: 0;
}

:deep() .el-drawer .el-drawer__body {
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