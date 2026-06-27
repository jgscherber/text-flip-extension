// Relay toggle state to the active tab's content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_FLIP") {
    chrome.storage.local.get(["flipEnabled"], (result) => {
      const next = !result.flipEnabled;
      chrome.storage.local.set({ flipEnabled: next }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "SET_FLIP", enabled: next });
          }
          sendResponse({ enabled: next });
        });
      });
    });
    return true; // keep channel open for async sendResponse
  }

  if (message.type === "GET_STATE") {
    chrome.storage.local.get(["flipEnabled"], (result) => {
      sendResponse({ enabled: !!result.flipEnabled });
    });
    return true;
  }
});
