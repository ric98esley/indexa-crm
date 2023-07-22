<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi';

interface Menu {
  icon: string;
  title: string;
  submenus?: Submenu[];
  groups?: Group[];
}

interface MenuItem {
  path: string;
  title: string
}

interface Submenu {
  title: string;
  icon: string;
  items: MenuItem[];
}

interface Group {
  title: string;
  items: MenuItem[];
}
const props = defineProps({
  menus: Array as PropType<Menu[]>,
  collapse: { type: Boolean, default: false }
})

</script>

<template>
  <div>
    <Logo width="w-32" margin="m-0" />
    <el-aside width="13rem">
      <el-scrollbar height="90%" noresize>
        <el-menu :router="true" :collapse="props.collapse">
          <el-sub-menu v-for="(menu, indexMenu) in props.menus" :index="`${indexMenu}`">
            <template #title>
              <el-icon>
                <Icon :name="menu.icon" class="mx-1 text-lg" />
              </el-icon>
              <span> {{ menu.title }} </span>
            </template>
            <el-menu-item-group v-for="(group, indexGroup) in menu.groups" :index="`g-${indexMenu}-${indexGroup}`">
              <template #title>
                {{ group.title }}
              </template>
              <el-menu-item :index="`${indexMenu}-${indexGroup}`" v-for="menu in group.items" :route="menu.path">
                {{ menu.title }}
              </el-menu-item>
            </el-menu-item-group>
            <el-sub-menu v-if="menu.submenus" v-for="(submenu, indexSubmenu) in menu.submenus"
              :index="`${indexMenu}-${indexSubmenu}`">
              <template #title>
                <Icon :name="submenu.icon" class="mx-1 text-lg" />{{ submenu.title }}
              </template>
              <el-menu-item v-for="(item, indexItem) in submenu.items " :route="item.path"
                :index="`sub-${indexMenu}-${indexSubmenu}-${indexItem}`">{{ item.title }}</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
  </div>
</template>
