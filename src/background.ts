/** registerContext */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'default',
    title: "Chant-GPT_Prompt",
    contexts: ["selection"],
  });
});
chrome.contextMenus.onClicked.addListener(async () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tabId = tabs[0]?.id;
    if(!tabId) return;
    chrome.tabs.sendMessage(tabId, {});
  });
});
