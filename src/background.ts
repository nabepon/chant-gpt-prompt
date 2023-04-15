/** registerContext */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'default',
    title: "Chant-GPT_Prompt",
    contexts: ["selection"],
  });
});

const chantGptPrompt = async () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tabId = tabs[0]?.id;
    if(!tabId) return;
    chrome.tabs.sendMessage(tabId, { command: 'Chant-GPT_Prompt' });
  });
}
chrome.contextMenus.onClicked.addListener(chantGptPrompt);
chrome.commands.onCommand.addListener(async (command) => {
  if(command !== 'Chant-GPT_Prompt') return;
  await chantGptPrompt()
});