<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import Sidepanel from "./sidepanel.vue"
import { markRaw, ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import Absen from "./pages/Absen.vue";
import Stock from './pages/Stock.vue';
import UpahBL from './pages/UpahBL.vue';
import Antrian2 from './pages/Antrian2.vue';
import AdminSC from './pages/AdminSC.vue';

const pages = {
  absen: markRaw(Absen),
  stock: markRaw(Stock),
  upahBL: markRaw(UpahBL),
  antrian2: markRaw(Antrian2),
  adminSC: markRaw(AdminSC),
}
type PageOption = keyof typeof pages;
const currentPage = ref<PageOption>('adminSC')

const menu = ['Stock Control', 'Absen', 'Upah borongan', 'Antrian report', 'Stock'] as const;
type MenuOption = typeof menu[number];

function handleChangePages (page: MenuOption) {
  switch (page) {
    case 'Absen':
      currentPage.value = 'absen';
      break;
    case 'Stock':
      currentPage.value = 'stock';
      break;
    case 'Upah borongan':
      currentPage.value = 'upahBL';
      break;
    case 'Antrian report':
      currentPage.value = 'antrian2';
      break;
    case 'Stock Control':
      currentPage.value = 'adminSC';
      break;
    default:
      break;
  }
}


    const messageFromContentJS = ref<string[]>([]);

    onMounted(() => {
        // @ts-ignore
        chrome.runtime.onMessage.addListener((message: messageCrossScriptAbsen, sender, sendResponse) => {

          const isNeedToShow = message.action.includes("bts") || message.action == "send-message";
          if(isNeedToShow) messageFromContentJS.value.push(message.message + '');
        });
    })

</script>

<template>
  <div>
    <Navbar :menu="menu" @select-menu="handleChangePages" />
    <component :is="pages[currentPage]"></component>
    
    <input 
        v-if="messageFromContentJS.length"
        class="btn btn-c btn-sm smooth" 
        type="button" name="clear" id="clear" 
        @click="messageFromContentJS.length = 0"
        value="Clear message"
    >
    <div class="msg" v-if="messageFromContentJS.length">
        <div style="word-break: break-all;color: black;overflow-wrap: break-word;width: 95%;" v-for="msg of messageFromContentJS">{{ msg }}</div>
    </div>
  </div>
</template>