import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */


console.log("background loaded");

// Send a message to the content script of the active tab
chrome.action.onClicked.addListener(function(tab) {
    console.log("Extension icon was clicked!", chrome);
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["src/pages/content/index.js"]
    }).then(() => {
        console.log("Injected content script");
    });
});
