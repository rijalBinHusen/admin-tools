<<<<<<< HEAD
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runContentFunction') {
    alert('Content script function executed!');
    // reply message to background ts and forward to sidepanel
    chrome.runtime.sendMessage({ action: 'reply-to-sidepanel', data: 'Hello from content.js!' });
  }
});
=======
import { type messageCrossScript } from "./scripts_chrome.types";

chrome.runtime.onMessage.addListener( async (message: messageCrossScript, sender, sendResponse) => {
  if (message.action === 'btc-run-hello-world') {
    alert('Content script function executed!');
    // reply message to background ts and forward to sidepanel
    sendActionToBackgrouond({ action: 'ctb-run-hello-world', data: 'Hello from content.js!' })
  }
});

function sendActionToBackgrouond (data: messageCrossScript) {
  chrome.runtime.sendMessage({ action: data.action, data: data.data });
}
>>>>>>> feat-google-account-access
