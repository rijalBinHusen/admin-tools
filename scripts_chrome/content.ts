import { type messageCrossScript } from "./scripts_chrome.types";
import { Absen } from "./app/absen/absen";
import { UpahBorongan } from "./app/warehouses/upahBorongan/checkAndGenerate";
import { Antrian2ContentJS } from "./app/antrian2/antrian2Content";
import { GoodsIsueContent } from "./app/warehouses/goodsIssues/goodsIssueContent"
import { UpahBoronganApprove } from "./app/warehouses/upahBorongan/approve"

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
    case 'btc-approve-upah-bl':
      const h = new UpahBoronganApprove(sendActionToBackground)
      h.startApproveUpah(message)
      break;
    case 'btc-antrian2-function':
      const antrian2 = new Antrian2ContentJS(sendActionToBackground);
      antrian2.doGetData(message);
      break;
    case 'btc-goods-issue':
      const g = new GoodsIsueContent(sendActionToBackground);
      g.getOutputData();
      break;
    default:
      break;
  }

});

function sendActionToBackground (data: messageCrossScript) {
  chrome.runtime.sendMessage(data);
}
