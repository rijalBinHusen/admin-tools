<template>
  <div>
    <h2>Vue Side Panel</h2>
    <button @click="sendAlert">Send Alert to Main Page!</button>
  </div>
</template>

<script lang="ts" setup>
    function sendAlert() {
      // @ts-ignore
      chrome.runtime.sendMessage({ action: 'trigger-content-function' }, res);
      // chrome.runtime.sendMessage({ action: 'show-alert' }, res);
    }

    function res(msg: any) {
      alert(msg)
    }
</script>

<style scoped>
button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}
</style>