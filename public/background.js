
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   sendResponse("Message from background.js")
//   if (message.action === 'trigger-content-function') {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs.length === 0) return;
//       chrome.tabs.sendMessage(tabs[0].id, { action: 'runContentFunction'  }, sendResponse);
//     });
//   }
// });

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // trigger from sidepanel
  if (message.action === 'trigger-content-function') {
    // Send message to content script to show hello world
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id, {
            action: 'runContentFunction'
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
                await chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'runContentFunction'
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

  // reply from content.js
  if (message.action === 'reply-to-sidepanel') {
    // Send to all side panel views
    chrome.runtime.sendMessage({ action: 'content-response', data: message.data });
  }
});