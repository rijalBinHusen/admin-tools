<template>
  <div>
    <h2>Vue Side Panel</h2>
    <button @click="sendAlert">Send Alert to Main Page!</button>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';

  function sendAlert() {
    // @ts-ignore
    chrome.runtime.sendMessage({ action: 'trigger-content-function' });
    // chrome.runtime.sendMessage({ action: 'show-alert' }, res);
  }

  onMounted(() => {
    // @ts-ignore
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'content-response') {
        alert('Sidepanel received: ' + message.data);
      }
    });
  })
</script>

<style scoped>
button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}
</style>