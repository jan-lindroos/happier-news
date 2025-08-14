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
  console.log("Received: ", message.type);
  if (message.type !== "REFRESH")
    return;

  (async () => {
    await onUserRefresh();
    sendResponse();
  })();
  return true;
});

const CONTENT_UPDATE_DELAY = 100;
const domain = window.location.hostname;
let lastContentUpdate = Date.now();
let updateLock = false;

/**
 * Handles content updates within the specified container element. Ensures content processing
 * respects a cooldown period and prevents simultaneous updates.
 *
 * @param {HTMLElement} container - The container element where the content update should be applied.
 * @return {Promise<void>} A promise that resolves when the content update logic is completed.
 */
async function onContentUpdate(container: HTMLElement): Promise<void> {
  if (updateLock)
    return;
  updateLock = true;

  const elapsedTime = Date.now() - lastContentUpdate;
  const isCooldownActive = elapsedTime < CONTENT_UPDATE_DELAY;
  if (isCooldownActive)
    await new Promise(r => setTimeout(r, CONTENT_UPDATE_DELAY - elapsedTime))

  try {
    if (await isNewsFeed(window.location.hostname))
      await analyseNewsFeed(isCooldownActive ? document.body : container);

    lastContentUpdate = Date.now()
  } catch (error) {
    console.warn("Encountered following error while analysing feed:", error);
  } finally {
    updateLock = false;
  }
}

/**
 * Handles refreshing the user's page by removing blur (in case less strict parameters are set) and
 * triggering an update if the current page is identified as a news feed.
 *
 * @return {Promise<void>} A promise that resolves when all refresh operations have completed.
 */
async function onUserRefresh(): Promise<void> {
  document.querySelectorAll(".headline-blur").forEach(el => {
    el.classList.remove("headline-blur");
  });

  if (await isNewsFeed(domain)) {
    await onContentUpdate(document.body);
  }
}