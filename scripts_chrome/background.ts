import { type messageCrossScript, sidepanelCommunication } from "./scripts_chrome.types";
import { GoogleSpreadsheet } from "./utils/googleSpreadsheet";

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message: messageCrossScript, sender, sendResponse) => {
 
  // trigger from sidepanel
  // Send message to content script to show hello world
  // do switch statement
  switch (message.action) {
    case 'stb-run-hello-world':
      forwardActionToContentTS('btc-run-hello-world');
      break;
    case 'ctb-run-hello-world':
      forwardActionToSidePanel(message);
      break;
    case 'stb-get-spreadsheet-data':
      getSpreadsheetData(message.data);
      break;
    case 'stb-absen-function':
      forwardActionToContentTS('btc-absen-function', message.data);
      break;
    case 'ctb-absen-function':
      forwardActionToSidePanel(message);
      break;
    case 'stb-upah-bl':
      forwardActionToContentTS('btc-upah-bl', message.data);
      break;
    case 'ctb-upah-bl':
      forwardActionToSidePanel(message);
      break;
    default:
      break;
  }
});

function forwardActionToSidePanel(yourAction: messageCrossScript) {
  chrome.runtime.sendMessage({
    ...yourAction,
    action: yourAction.action.replace("ctb", "bts")
  })
}

function forwardActionToContentTS (yourActionName: sidepanelCommunication, data?: any) {
  
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, {
            action: yourActionName,
            data
          });
        } catch (error) {
          // If content script not ready, inject it and try again
          console.log('Content script not ready, injecting...');
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            });
            // Try sending message again after a short delay
            setTimeout(async () => {
              try {
                await chrome.tabs.sendMessage(tabs[0].id!, {
                  action: yourActionName,
                  data
                });
              } catch (e) {
                console.log('Still unable to connect to content script');
              }
            }, 100);
          } catch (injectError) {
            console.log('Cannot inject content script:', injectError);
          }
        }
      }
    });
}

async function getSpreadsheetData(url: string) {

    let message = "Spreadsheet URL invalid" + url;

    // if url valid, get data on spreadsheet, and overwrite message above
    if(url) {

      const sS = new GoogleSpreadsheet();
      const getData = await sS.getValueOnSpreadsheet(url);
      message = getData.data
    }
      
    forwardActionToSidePanel({ action: "bts-get-spreadsheet-data", data: message });
}
