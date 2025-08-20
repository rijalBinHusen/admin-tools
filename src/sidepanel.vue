<template>
  <div>
    <h2>Vue Side Panel</h2>
    <button 
      @click="sendActionToChrome('stb-run-hello-world')"
      class="btn btn-b btn-sm smooth"
    >
      Send Alert to Main Page!
    </button>

    <button 
      @click="sendActionToChrome('stb-get-spreadsheet-data')"
      class="btn btn-b btn-sm smooth"
    >
      Get spreadsheet data
    </button>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';

  function sendActionToChrome(action: sidepanelCommunication) {
    let dataToSend = "";
    if(action === "stb-get-spreadsheet-data") {
      dataToSend = import.meta.env.VITE_SPREADSHEET_TO_ACCESS;
    }
    // @ts-ignore
    chrome.runtime.sendMessage({ action: action, data: dataToSend });
  }

  onMounted(() => {
    // @ts-ignore
    chrome.runtime.onMessage.addListener((message:messageCrossScript, sender, sendResponse) => {
      if (message.action === 'bts-run-hello-world') {
        alert('Sidepanel received: ' + message.data);
      }
      else if(message.action === 'bts-get-spreadsheet-data') {
        
        alert('Sidepanel received spreadsheet data: ' + message.data);
      }
    });
  })
</script>