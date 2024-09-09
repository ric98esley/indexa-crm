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
        <Header :name="user?.username" :logout="() => auth.reset()" />
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
    ability: [
      'assets:read',
      'assets:checkout',
      'assets:checking',
      'assets:create',
    ],
    groups: [
      {
        title: 'Lista de activos',
        items: [
          {
            ability: [
              'assets:read'
            ],
            title: 'Todos los activos',
            route: { path: '/assets' }
          },
          {
            ability: [
              'geolocation:read'
            ],
            title: 'Alertas',
            route: { path: '/assets/alerts' }
          },
        ]
      }
    ],
    submenus: [
      {
        title: 'Acciones',
        icon: 'ep:element-plus',
        ability: [
          'assets:read',
          'assets:checkout',
          'assets:checking',
          'assets:create',
        ],
        items: [
          {
            title: 'Agregar',
            route: { path: '/assets/add' },
            ability: [
              'assets:create',
            ],
          },
          {
            title: 'Asignar',
            route: { path: '/assets/assign' },
            ability: [
              'assets:checkout',
            ],
          },
          {
            title: 'Recibir',
            route: { path: '/assets/get' },
            ability: [
              'assets:checking',
            ],
          },
        ]
      }
    ]
  },
  {
    title: 'Mantenimientos',
    icon: 'ep:tools',
    ability: [
      'maintenances:read',
      'maintenances:create',
    ],
    groups: [
      {
        title: 'Ver y crear',
        items: [
          {
            ability: [
              'maintenances:read',
              'maintenances:create',
            ],
            title: 'Mantenimientos',
            route: { path: '/maintenances' }
          },
          {
            ability: [
              'maintenances:read',
              'maintenances:create',
            ],
            title: 'Tipos',
            route: { path: '/maintenances/type' }
          }
        ]
      }
    ],
  },
  {
    title: 'Usuarios',
    icon: 'ep:user',
    ability: [
      'users:read',
      'users:create',
    ],
    groups: [
      {
        title: 'Ver y crear',
        items: [
          {
            ability: [
              'users:read',
              'users:create',
            ],
            title: 'Usuarios',
            route: { path: '/users' }
          },
          {
            ability: [
              'customers:read',
              'customers:create',
            ],
            title: 'Contactos',
            route: { path: '/users/contacts' }
          }
        ]
      },
    ],
  },
  {
    title: 'Consumibles',
    icon: 'ep:brush',
    ability: [
      'consumables:read',
      'consumables:create',
    ],
    groups: [
      {
        title: 'Ver y crear',
        items: [
          {
            ability: [
              'consumables:read',
              'consumables:create',
            ],
            title: 'Inventario',
            route: { path: '/consumables' }
          },
          {
            ability: [
              'consumables:read',
              'consumables:create',
            ],
            title: 'Productos',
            route: { path: '/consumables/products' }
          },
        ]
      }
    ],
  },
  {
    title: 'Lugares',
    icon: 'ep:school',
    ability: [
      'locations:read',
      'locations:create',
    ],
    groups: [
      {
        title: 'Ver y crear agencias',
        items: [
          {
            ability: [
              'locations:read',
              'locations:create',
            ],
            title: 'Agencias',
            route: { path: '/places' }
          },
          {
            ability: [
              'warehouses:read',
              'warehouses:create',
            ],
            title: 'Almacenes',
            route: { path: '/config/warehouse' }
          },
          {
            ability: [
              'locations_types:read',
              'locations_types:create',
            ],
            title: 'Tipos',
            route: { path: '/places/type' }
          },
          {
            ability: [
              'zones:read',
              'zones:create',
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
    ability: [
      'movements:read',
      'movements:create',
    ],
    groups: [
      {
        title: 'Ver',
        items: [
          {
            ability: [
              'movements:read',
              'movements:create',
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
            ability: [
              'movements:read',
              'movements:create',
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
    ability: [
      'categories:read',
      'categories:create',
      'brands:read',
      'brands:create',
      'models:read',
      'models:create',
      'warehouses:read',
      'warehouses:create',
      'groups:read',
      'groups:create',
      'paths:read',
      'paths:create',
    ],
    submenus: [
      {
        title: 'Categorías',
        icon: 'ep:memo',
        ability: [
          'categories:read',
          'categories:create',
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
        ability: [
          'brands:read',
          'brands:create',
        ],
        items: [
          {
            title: 'Ver y crear',
            route: { path: '/config/brand' }
          }
        ]
      },
      {
        title: 'Modelos',
        icon: 'ep:coin',
        ability: [
          'models:read',
          'models:create',
        ],
        items: [
          {
            title: 'Ver y crear',
            route: { path: '/config/model' }
          }
        ]
      },
      {
        title: 'Rutas de escaneo',
        icon: 'ep:document',
        ability: [
          'paths:read',
          'paths:create',
        ],
        items: [
          {
            title: 'Ver y crear',
            route: { path: '/config/paths' }
          }
        ]
      },
      {
        title: 'Depósitos',
        icon: 'ep:house',
        ability: [
          'warehouses:read',
          'warehouses:create',
        ],
        items: [
          {
            title: 'Ver y crear',
            route: { path: '/config/warehouse' }
          }
        ]
      },
      {
        title: 'Grupos',
        icon: 'ep:connection',
        ability: [
          'groups:read',
          'groups:create',
        ],
        items: [
          {
            title: 'Ver grupos',
            route: { path: '/config/group' }
          },
          {
            title: 'Árbol',
            route: { path: '/config/group/tree' }
          }
        ]
      }
    ]
  }
])

</script>

<style scoped>
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

<style>
.el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  background-color: var(--el-color-primary-light-7);
}

li.highlighted {
  background-color: var(--el-color-primary-light-7);
}
</style>