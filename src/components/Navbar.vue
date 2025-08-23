<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
  menu: readonly string[]
}>();
const emit = defineEmits(['selectMenu'])
const currentPage = ref("");

  function handleSelectMenu(menu: string) {
    emit('selectMenu', menu);
    currentPage.value = menu;
  }
</script>

<template>
  <div>
    <nav class="nav" tabindex="-1" onclick="this.focus()">
    <div class="container">
        <a href="#" class="pagename current">{{ currentPage == '' ? 'Home' : currentPage }}</a>
        <a 
          v-for="option in props.menu" 
          href="#"
          @click="handleSelectMenu(option)"
        >
          {{ option }}
        </a>
    </div>
    </nav>
  </div>
</template>