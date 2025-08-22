<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import Sidepanel from "./sidepanel.vue"
import Navbar from './components/Navbar.vue';

const menu = ['Absen', 'Stock', 'Detail muat']

</script>

<template>
  <div>
    <Navbar :menu="menu" />
  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
  <!-- <Sidepanel /> -->
</template>