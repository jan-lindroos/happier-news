import { analyseFeed, isNewsFeed } from "./news/news-feed";

document.addEventListener('DOMContentLoaded', () => onContentUpdate(document.body));

const observer = new MutationObserver((mutations) => {
  mutations.forEach(async (mutation) => {
    if (mutation.target instanceof HTMLElement) await onContentUpdate(mutation.target);
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

/**
 * Handles updates to the given content container, performing actions
 * specific to a news feed if the current domain qualifies as one.
 *
 * @param {HTMLElement} container - The HTML element containing the updates.
 */
async function onContentUpdate(container: HTMLElement) {
  const domain = window.location.hostname;

  if (!isNewsFeed(domain)) return;
  await analyseFeed(container);
}