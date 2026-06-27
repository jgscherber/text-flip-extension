const toggle = document.getElementById("flipToggle");

// Reflect current state on open
chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
  toggle.checked = response?.enabled ?? false;
});

toggle.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_FLIP" });
});
