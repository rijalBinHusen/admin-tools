import { Antrian2BackgroundJS } from "./app/antrian2/antrian2Background";
import { type messageCrossScript } from "./scripts_chrome.types";

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message: messageCrossScript, sender, sendResponse) => {
 
  // trigger from sidepanel
  // Send message to content script to show hello world
  // do switch statement
  switch (message.action) {
    case 'stb-absen-function':
      backgroundToContent('btc-absen-function', message.data);
      break;
    case 'ctb-absen-function':
      toSidePanel(message);
      break;
    case 'stb-upah-bl':
      if(message)
      backgroundToContent('btc-upah-bl', message.data);
      break;
    case 'ctb-upah-bl':
      toSidePanel(message);
      break;
    case 'stb-antrian2-function':
      if(message)
      backgroundToContent('btc-antrian2-function', message.data);
      break;
    case 'ctb-antrian2-function':
      const d = new Antrian2BackgroundJS(toSidePanel);
      break;
    default:
      break;
  }
});

function toSidePanel(yourAction: messageCrossScript) {
  chrome.runtime.sendMessage({
    ...yourAction,
    action: yourAction.action.replace("ctb", "bts")
  })
}

function backgroundToContent (yourActionName: string, data?: any) {
  
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