<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi';

interface Menu {
  icon: string;
  title: string;
  roles?: string[];
  submenus?: Submenu[];
  groups?: Group[];
}

interface MenuItem {
  path: string;
  roles?: string[];
  title: string;
}

interface Submenu {
  title: string;
  roles?: string[];
  icon: string;
  items: MenuItem[];
}

interface Group {
  title: string;
  roles?: string[];
  items: MenuItem[];
}
const props = defineProps({
  menus: Array as PropType<Menu[]>,
  collapse: { type: Boolean, default: false }
})

</script>

<template>
  <el-menu :router="true" :collapse="props.collapse">
    <el-sub-menu v-for="(menu, indexMenu) in props.menus" :index="`${indexMenu}`" v-role="menu.roles">
      <template #title>
        <el-icon>
          <Icon :name="menu.icon" class="mx-1 text-lg" />
        </el-icon>
        <span> {{ menu.title }} </span>
      </template>
      <el-menu-item-group v-for="(group, indexGroup) in menu.groups" :index="`g-${indexMenu}-${indexGroup}`"
        v-role="group.roles">
        <template #title>
          {{ group.title }}
        </template>
        <el-menu-item :index="`${indexMenu}-${indexGroup}-${indexItem}`" v-for="(Item, indexItem) in group.items" :route="Item.path"
          v-role="Item.roles">
          {{ Item.title }}
        </el-menu-item>
      </el-menu-item-group>
      <el-sub-menu v-if="menu.submenus" v-for="(submenu, indexSubmenu) in menu.submenus"
        :index="`${indexMenu}-${indexSubmenu}`" v-role="submenu.roles">
        <template #title>
          <Icon :name="submenu.icon" class="mx-1 text-lg" />{{ submenu.title }}
        </template>
        <el-menu-item v-for="(item, indexItem) in submenu.items " :route="item.path"
          :index="`sub-${indexMenu}-${indexSubmenu}-${indexItem}`" v-role="item.roles">{{ item.title }}</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
  </el-menu>
</template>
