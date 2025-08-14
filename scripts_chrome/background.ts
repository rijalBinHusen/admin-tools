import { type messageCrossScript, sidepanelCommunication } from "./scripts_chrome.types";

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message: messageCrossScript, sender, sendResponse) => {
 
  // trigger from sidepanel
  // Send message to content script to show hello world
  // do switch statement
  switch (message.action) {
    case 'stb-run-hello-world':
       chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, {
            action: 'btc-run-hello-world'
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
                  action: 'btc-run-hello-world'
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
    break;
    case 'stb-get-spreadsheet-data':
      forwardActionToContentTS('btc-get-spreadsheet-data');
    break;
    case 'ctb-get-spreadsheet-data':
      forwardActionToSidePanel(message)
    break;
    case 'ctb-run-hello-world':
      forwardActionToSidePanel(message);
      break;
    default:
      break;
  }
});

function forwardActionToSidePanel(yourAction: messageCrossScript) {
  chrome.runtime.sendMessage(yourAction)
}

function forwardActionToContentTS (yourActionName: sidepanelCommunication) {
  
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, {
            action: yourActionName
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
                  action: yourActionName
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