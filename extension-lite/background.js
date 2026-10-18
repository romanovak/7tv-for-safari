const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "emotes") return;
  loadEmotes(msg.channel).then((emotes) => sendResponse({ emotes }));
  return true;
});
