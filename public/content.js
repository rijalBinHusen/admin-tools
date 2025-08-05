chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runContentFunction') {
    alert('Content script function executed!');
    // reply message to background ts and forward to sidepanel
    chrome.runtime.sendMessage({ action: 'reply-to-sidepanel', data: 'Hello from content.js!' });
  }
});