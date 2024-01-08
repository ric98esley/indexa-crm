<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi';

interface Menu {
  icon: string;
  title: string;
  ability?: string[];
  submenus?: Submenu[];
  groups?: Group[];
}

interface MenuItem {
  route: {
    path: string,
    query?: {}
  };
  ability?: string[];
  title: string;
}

interface Submenu {
  title: string;
  ability?: string[];
  icon: string;
  items: MenuItem[];
}

interface Group {
  title: string;
  ability?: string[];
  items: MenuItem[];
}
const props = defineProps({
  menus: Array as PropType<Menu[]>,
  collapse: { type: Boolean, default: false }
})

</script>

<template>
  <el-menu :router="false" :collapse="props.collapse" unique-opened>
    <el-sub-menu v-for="(menu, indexMenu) in props.menus" :index="`${indexMenu}`" v-can="menu.ability">
      <template #title>
        <p class="underline underline-offset-8 font-black decoration-green-500">
          <el-icon>
            <Icon :name="menu.icon" class="mx-1 text-lg" />
          </el-icon>
          <span> {{ menu.title }} </span>
        </p>
      </template>
      <el-menu-item-group v-for="(group, indexGroup) in menu.groups" :index="`g-${indexMenu}-${indexGroup}`"
        v-can="group.ability">
        <template #title>
          {{ group.title }}
        </template>
        <NuxtLink :to="Item.route" v-for="(Item, indexItem) in group.items">
          <el-menu-item :index="`${indexMenu}-${indexGroup}-${indexItem}`" :route="Item.route" v-can="Item.ability">
            {{ Item.title }}
          </el-menu-item>
        </NuxtLink>

      </el-menu-item-group>
      <el-sub-menu v-if="menu.submenus" v-for="(submenu, indexSubmenu) in menu.submenus"
        :index="`${indexMenu}-${indexSubmenu}`" v-can="submenu.ability">
        <template #title>
          <p class="underline underline-offset-8 font-black decoration-green-500">
            <Icon :name="submenu.icon" class="mx-1 text-lg" />{{ submenu.title }}
          </p>
        </template>
        <NuxtLink :to="item.route" v-for="(item, indexItem) in submenu.items">
          <el-menu-item :index="`sub-${indexMenu}-${indexSubmenu}-${indexItem}`" :route="item.route" v-can="item.ability">
            {{ item.title }}
          </el-menu-item>
        </NuxtLink>
      </el-sub-menu>
    </el-sub-menu>
  </el-menu>
</template>
