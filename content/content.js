const STYLE_ID = "text-flip-extension-style";

const FLIP_CSS = `
body.text-flip-active p:nth-of-type(2n) {
  transform: scale(-1, -1) !important;
  display: block !important;
  margin-bottom: 2px !important;
}
body.text-flip-active p:nth-of-type(2n-1) {
  display: block !important;
  margin-bottom: 2px !important;
  margin-top: 2px !important;
  text-align: right !important;
}
`;

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = FLIP_CSS;
  document.head.appendChild(style);
}

function setFlip(enabled) {
  injectStyle();
  if (enabled) {
    document.body.classList.add("text-flip-active");
  } else {
    document.body.classList.remove("text-flip-active");
  }
}

// Restore state on page load
chrome.storage.local.get(["flipEnabled"], (result) => {
  if (result.flipEnabled) {
    setFlip(true);
  }
});

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SET_FLIP") {
    setFlip(message.enabled);
  }
});
