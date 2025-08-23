<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import Sidepanel from "./sidepanel.vue"
import { markRaw, ref } from 'vue';
import Navbar from './components/Navbar.vue';
import Absen from "./pages/Absen.vue";
import Stock from './pages/Stock.vue';

const pages = {
  absen: markRaw(Absen),
  stock: markRaw(Stock)
}
type PageOption = keyof typeof pages;
const currentPage = ref<PageOption>('stock')

const menu = ['Absen', 'Stock', 'Detail muat'] as const;
type MenuOption = typeof menu[number];

function handleChangePages (page: MenuOption) {
  switch (page) {
    case 'Absen':
      currentPage.value = 'absen';
      break;
    case 'Stock':
      currentPage.value = 'stock';
      break;
    default:
      break;
  }
}

</script>

<template>
  <div>
    <Navbar :menu="menu" @select-menu="handleChangePages" />
    <component :is="pages[currentPage]"></component>
  </div>
</template>