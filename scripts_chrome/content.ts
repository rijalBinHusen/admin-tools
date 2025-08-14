import { type messageCrossScript } from "./scripts_chrome.types";
import { GoogleSpreadsheet } from "./utils/googleSpreadsheet";

chrome.runtime.onMessage.addListener( async (message: messageCrossScript, sender, sendResponse) => {
  if (message.action === 'btc-run-hello-world') {
    alert('Content script function executed!');
    // reply message to background ts and forward to sidepanel
    sendActionToBackgrouond({ action: 'ctb-run-hello-world', data: 'Hello from content.js!' })
  }

  if(message.action === 'btc-get-spreadsheet-data') {
    const sS = new GoogleSpreadsheet();
    const getData = await sS.getValueOnSpreadsheet();
    sendActionToBackgrouond({ action: 'ctb-get-spreadsheet-data', data: getData.data })
  }
});

function sendActionToBackgrouond (data: messageCrossScript) {
  chrome.runtime.sendMessage({ action: data.action, data: data.data });
}