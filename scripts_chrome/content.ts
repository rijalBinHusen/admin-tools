import { type messageCrossScript } from "./scripts_chrome.types";
import { Absen } from "./app/absen";
import { UpahBorongan } from "./app/upahBorongan";
import { Antrian2ContentJS } from "./app/antrian2/antrian2Content";

chrome.runtime.onMessage.addListener( async (message: messageCrossScript, sender, sendResponse) => {
  switch (message.action) {
    case 'btc-absen-function':
      const abs = new Absen(sendActionToBackground);
      abs.startGetAbsen(message);
      break;
    case 'btc-upah-bl':
      const upahBL = new UpahBorongan(sendActionToBackground);
      upahBL.runUpahFunction(message);
      break;
    case 'btc-antrian2-function':
      const antrian2 = new Antrian2ContentJS(sendActionToBackground);
      antrian2.doGetData(message);
      break;
    default:
      break;
  }

});

function sendActionToBackground (data: messageCrossScript) {
  chrome.runtime.sendMessage(data);
}
