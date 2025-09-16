import { type messageCrossScript } from "./scripts_chrome.types";
import { Absen } from "./app/absen";
import { UpahBorongan } from "./app/upahBorongan";
import { Antrian2 } from "./app/antrian2/indexAntrian2";

chrome.runtime.onMessage.addListener( async (message: messageCrossScript, sender, sendResponse) => {
  switch (message.action) {
    case 'btc-run-hello-world':
      alert('Content script function executed!');
      // reply message to background ts and forward to sidepanel
      sendActionToBackground({ action: 'ctb-run-hello-world', data: 'Hello from content.js!' })
      break;
    case 'btc-absen-function':
      const abs = new Absen(sendActionToBackground);
      abs.startGetAbsen(message.data);
      break;
    case 'btc-upah-bl':
      const upahBL = new UpahBorongan(sendActionToBackground);
      upahBL.runUpahFunction(message.data);
      break;
    case 'btc-antrian2-function':
      const antrian2 = new Antrian2(sendActionToBackground);
      antrian2.generateReport(message.data);
      break;
    default:
      break;
  }

});

function sendActionToBackground (data: messageCrossScript) {
  chrome.runtime.sendMessage({ action: data.action, data: data.data, message: data.message });
}
