import { Antrian2BackgroundJS } from "./app/antrian2/antrian2Background";
import { type messageCrossScript } from "./scripts_chrome.types";

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message: messageCrossScript, sender, sendResponse) => {
 
  // trigger from sidepanel
  if(message.action == 'ctb-antrian2-function') {
      const d = new Antrian2BackgroundJS(toSidePanel);
      d.generateReport(message)
  } 

  else if(message.action.includes("ctb")) toSidePanel(message);
  else if(message.action.includes("stb")) backgroundToContent(message);
  
});

function toSidePanel(yourAction: messageCrossScript) {
  chrome.runtime.sendMessage({
    ...yourAction,
    action: yourAction.action.replace("ctb", "bts")
  })
}

function backgroundToContent (param: messageCrossScript) {
  
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { ...param, action: param.action.replace("stb", "btc")});
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
                await chrome.tabs.sendMessage(tabs[0].id!, { ...param, action: param.action.replace("stb", "btc")});
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