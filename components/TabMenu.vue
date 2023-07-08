<template>
  <el-aside width="13rem">
    <Logo width="w-32" margin="m-0" />
      <el-scrollbar height="90%" noresize>
        <el-menu>
          <el-sub-menu v-for="(menu, indexMenu) in menus" :index="`${indexMenu}`">
            <template #title>
              <Icon :name="menu.icon" class="mx-1 text-lg" /> {{ menu.title }}
            </template>
            <el-menu-item-group v-for="(group, indexGroup) in menu.groups" :index="`g-${indexMenu}-${indexGroup}`">
              <template #title>
                {{ group.title }}
              </template>
              <el-menu-item :index="`${indexMenu}-${indexGroup}`" v-for="menu in group.menus">
                {{ menu.title }}
              </el-menu-item>
            </el-menu-item-group>
            <el-sub-menu v-if="menu.submenus" v-for="(submenu, indexSubmenu) in menu.submenus"
              :index="`${indexMenu}-${indexSubmenu}`">
              <template #title>{{ submenu.title }}</template>
              <el-menu-item v-for="(item, indexItem) in submenu.items "
                :index="`sub-${indexMenu}-${indexSubmenu}-${indexItem}`">{{ item.title }}</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
  </el-aside>
</template>

<script setup lang="ts">
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'

const menus = reactive([
  {
    icon: 'ep:message',
    title: 'Mensajes',
    submenus: [
      {
        title: 'sub',
        items: [
          {
            title: 'sub-1'
          }
        ]
      }
    ],
    groups: [
      {
        title: 'Mensajes nuevos',
        menus: [
          {
            title: 'Prueba'
          }
        ]
      }
    ],
  },
  {
    icon: 'ep:message',
    title: 'Mensajes',
    submenus: [
      {
        title: 'sub',
        items: [
          {
            title: 'sub-1'
          }
        ]
      }
    ],
    groups: [
      {
        title: 'Mensajes nuevos',
        menus: [
          {
            title: 'Prueba'
          }
        ]
      }
    ],
  },
  {
    icon: 'ep:message',
    title: 'Mensajes',
    submenus: [
      {
        title: 'sub',
        items: [
          {
            title: 'sub-1'
          }
        ]
      }
    ],
    groups: [
      {
        title: 'Mensajes nuevos',
        menus: [
          {
            title: 'Prueba'
          }
        ]
      }
    ],
  },
  {
    icon: 'ep:message',
    title: 'Mensajes',
    submenus: [
      {
        title: 'sub',
        items: [
          {
            title: 'sub-1'
          }
        ]
      }
    ],
    groups: [
      {
        title: 'Mensajes nuevos',
        menus: [
          {
            title: 'Prueba'
          }
        ]
      }
    ],
  },
  {
    icon: 'ep:message',
    title: 'Mensajes',
    submenus: [
      {
        title: 'sub',
        items: [
          {
            title: 'sub-1'
          }
        ]
      }
    ],
    groups: [
      {
        title: 'Mensajes nuevos',
        menus: [
          {
            title: 'Prueba'
          }
        ]
      }
    ],
  },
  {
    icon: 'ep:message',
    title: 'Mensajes',
    submenus: [
      {
        title: 'sub',
        items: [
          {
            title: 'sub-1'
          }
        ]
      }
    ],
    groups: [
      {
        title: 'Mensajes nuevos',
        menus: [
          {
            title: 'Prueba'
          }
        ]
      }
    ],
  }
])

</script>

