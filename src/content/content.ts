import { analyseNewsFeed, isNewsFeed } from "./news/news-feed";

document.addEventListener('DOMContentLoaded', () => onContentUpdate(document.body));

const observer = new MutationObserver((mutations) => {
  mutations.forEach(async (mutation) => {
    if (mutation.target instanceof HTMLElement)
      await onContentUpdate(mutation.target);
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type !== 'REFRESH')
    return;

  (async () => {
    await onContentUpdate(document.body);
    sendResponse();
  })();
  return true;
});

const CONTENT_UPDATE_DELAY = 100;
let lastContentUpdate = Date.now();
let updateLock = false;

async function onContentUpdate(container: HTMLElement) {
  if (updateLock)
    return;
  updateLock = true;

  const elapsedTime = Date.now() - lastContentUpdate;
  const isCooldownActive = elapsedTime < CONTENT_UPDATE_DELAY;
  if (isCooldownActive)
    await new Promise(r => setTimeout(r, CONTENT_UPDATE_DELAY - elapsedTime))

  const domain = window.location.hostname;

  try {
    if (await isNewsFeed(domain))
        await analyseNewsFeed(isCooldownActive ? document.body : container);

    lastContentUpdate = Date.now()
  } catch (error) {
    console.warn("Encountered following error while analysing feed:", error);
  } finally {
    updateLock = false;
  }
}