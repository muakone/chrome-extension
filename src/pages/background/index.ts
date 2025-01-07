import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script installed!");
});


// Send a message to the content script of the active tab
// chrome.action.onClicked.addListener(function (tab) {
//   console.log("Extension icon was clicked!", chrome);
//   chrome.scripting
//     .executeScript({
//       target: { tabId: tab.id },
//       files: ["src/pages/content/index.js"],
//     })
//     .then(() => {
//       console.log("Injected content script");
//     });
// });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CHECK_AUTH_STATUS") {
    chrome.storage.local.get("isAuthenticated", (result) => {
      const isAuthenticated = result.isAuthenticated || false;
      sendResponse({ isAuthenticated });
    });
    return true; // Indicate async response
  }

  if (message.action === "SET_AUTH_STATUS") {
    const { isAuthenticated, authDetails, redirectUrl } = message;

    console.log("Received SET_AUTH_STATUS message:", message);

    // Save authentication status and details
    chrome.storage.local.set({ isAuthenticated, authDetails }, () => {
      // Focus or create the tab for redirectUrl
      chrome.tabs.query({}, (tabs) => {
        const targetTab = tabs.find((tab) => tab.url === redirectUrl);

        if (targetTab) {
          chrome.tabs.update(targetTab.id, { active: true });
          sendResponse({ status: "focused" });
        } else {
          chrome.tabs.create({ url: redirectUrl }, (newTab) => {
            sendResponse({ status: "created", tabId: newTab.id });
          });
        }
        console.log("Authentication details saved to local storage.");
        sendResponse({ status: "success" });
      });
    });
    return true; // Indicate async response
  }
});

  // Listen for postMessage from the Next.js app
  chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
      // if (message.action === "FOCUS_OR_CREATE_TAB") {
      //   const { redirectUrl } = message;
  
      //   chrome.tabs.query({}, (tabs) => {
      //     const targetTab = tabs.find((tab) => tab.url === redirectUrl);
  
      //     if (targetTab) {
      //       chrome.tabs.update(targetTab.id, { active: true });
      //       sendResponse({ status: "focused" });
      //     } else {
      //       chrome.tabs.create({ url: redirectUrl }, (newTab) => {
      //         sendResponse({ status: "created", tabId: newTab.id });
      //       });
      //     }
      //   });
      //   return true;
      // }
      if (message.action === "CHECK_AUTH_STATUS") {
        chrome.storage.local.get("isAuthenticated", (result) => {
          const isAuthenticated = result.isAuthenticated || false;
          sendResponse({ isAuthenticated });
        });
        return true; // Indicate async response
      }
    
      if (message.action === "SET_AUTH_STATUS") {
        const { isAuthenticated, authDetails, redirectUrl } = message;
    
        // Save authentication status and details
        chrome.storage.local.set({ isAuthenticated, authDetails }, () => {
          // Focus or create the tab for redirectUrl
          chrome.tabs.query({}, (tabs) => {
            const targetTab = tabs.find((tab) => tab.url === redirectUrl);
    
            if (targetTab) {
              chrome.tabs.update(targetTab.id, { active: true });
              sendResponse({ status: "focused" });
            } else {
              chrome.tabs.create({ url: redirectUrl }, (newTab) => {
                sendResponse({ status: "created", tabId: newTab.id });
              });
            }
          });
        });
        return true; // Indicate async response
      }
    }
  );

  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(`Storage key "${key}" in namespace "${namespace}" changed.`, {
        oldValue,
        newValue,
      });
    }
  });
  
  
  
  
