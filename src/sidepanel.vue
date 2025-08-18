<template>
  <div>
    <h2>Vue Side Panel</h2>
    <button @click="sendAction">Send Alert to Main Page!</button>
    <button @click="sendAction2">Get spreadsheet data</button>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';

  function sendAction() {
    // @ts-ignore
    chrome.runtime.sendMessage({ action: 'stb-run-hello-world' });
    // chrome.runtime.sendMessage({ action: 'show-alert' }, res);
  }
  function sendAction2() {
    // @ts-ignore
    chrome.runtime.sendMessage({ action: 'stb-get-spreadsheet-data' });
    // chrome.runtime.sendMessage({ action: 'show-alert' }, res);
  }

  onMounted(() => {
    // @ts-ignore
    chrome.runtime.onMessage.addListener((message:messageCrossScript, sender, sendResponse) => {
      if (message.action === 'bts-run-hello-world') {
        alert('Sidepanel received: ' + message.data);
      }
      if(message.action === 'bts-get-spreadsheet-data') {
        
        alert('Sidepanel received spreadsheet data: ' + message.data);
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