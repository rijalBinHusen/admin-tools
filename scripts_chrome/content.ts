import { type messageCrossScript } from "./scripts_chrome.types";
import { Absen } from "./app/absen";

chrome.runtime.onMessage.addListener( async (message: messageCrossScript, sender, sendResponse) => {
  if (message.action === 'btc-run-hello-world') {
    alert('Content script function executed!');
    // reply message to background ts and forward to sidepanel
    sendActionToBackground({ action: 'ctb-run-hello-world', data: 'Hello from content.js!' })
  }

  if(message.action === "btc-absen-function") {
    const abs = new Absen(sendActionToBackground);
    abs.startGetAbsen(message.data);
  }
});

function sendActionToBackground (data: messageCrossScript) {
  chrome.runtime.sendMessage({ action: data.action, data: data.data });
}
