chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content.js receive a message: ", message)
  if (message.action === 'runContentFunction') {
    alert('Content script function executed!');
    sendResponse({ result: 'This is from content.js, Content script function executed!' });
  }
});