import { extractHeadlines } from "./extract-headlines";
import type { Headline, Message } from "../content.types";
import { blurHeadline, unblurHeadline } from "./headline-blur";

/**
 * Determines whether the given href string represents a news feed.
 *
 * @param {string} href - The URL or string to be checked.
 * @return {boolean} Returns true if the provided href is not an empty string, otherwise false.
 */
export function isNewsFeed(href: string): boolean {
  return href !== '';
}

/**
 * Analyses the headlines within a specified container element to determine their negativity score.
 * Headlines with a negativity score exceeding the threshold are blurred, while others are unblurred.
 *
 * @param {HTMLElement} container - The container element from which headlines will be extracted for analysis.
 * @return {Promise<void>} A promise that resolves when the headlines have been fully processed and modified as needed.
 */
export async function analyseFeed(container: HTMLElement): Promise<void> {
  const headlines = extractHeadlines(container);

  for (let headline of headlines) {
    const negativityScore = await getNegativityScore(headline);

    if (!negativityScore) return;

    if (negativityScore >= 0.7) {
      blurHeadline(headline);
    } else {
      unblurHeadline(headline);
    }
  }
}

let scoreCache = new Map<string, number | null>();

/**
 * Calculates and retrieves the negativity score for a given headline. If the score is not already
 * cached, it requests the score through an inference process and updates the cache.
 *
 * @param {Headline} headline - The headline object for which the negativity score is required.
 * @return {Promise<number>} A promise resolving to the negativity score of the given headline.
 */
async function getNegativityScore(headline: Headline): Promise<number | null> {
  if (!scoreCache.has(headline.title)) {
    // Prevent inference being started multiple times while waiting on result.
    scoreCache.set(headline.title, null);

    const headlineInferenceRequest: Message<string> = {
      type: "GET_SCORE",
      content: headline.title
    };

    try {
      const response: Message<number> = await chrome.runtime.sendMessage(headlineInferenceRequest);
      scoreCache.set(headline.title, response.content);
    }
    catch (_) {
      return null;
    }
  }

  return scoreCache.get(headline.title)!
}