import { extractHeadlines } from "./extract-headlines";
import type { Headline } from "../content.types";
import type {Message, StorageOperation} from "../../background/background.types.ts";
import { blurHeadline, unblurHeadline } from "../style/headline-blur.ts";

export async function isNewsFeed(href: string) {
  const request: Message<null> = {
    type: 'GET_NEWS_DOMAINS',
    content: null
  };

  const response: Message<string[]> = await chrome.runtime.sendMessage(request)
  return response.content.includes(href);
}

async function getSentiment(headline: Headline){
  const request: Message<string> = {
    type: 'INFERENCE_REQUEST',
    content: headline.title
  };

  const response: Message<number | null> = await chrome.runtime.sendMessage(request);
  return response.content;
}

export async function analyseNewsFeed(container: HTMLElement) {
  const headlines = extractHeadlines(container);
  // This only controls the initial value (not the display value, which is in StrengthSlider.svelte).
  const DEFAULT_THRESHOLD = 0.6;

  for (let headline of headlines) {
    const sentiment = await getSentiment(headline);
    if (!sentiment)
      return;

    const getRequest: Message<StorageOperation<number>> = {
      type: 'STORAGE',
      content: {
        method: 'get',
        key: 'THRESHOLD',
        data: DEFAULT_THRESHOLD,
      }
    }
    const { content: threshold }: Message<number> = await chrome.runtime.sendMessage(getRequest);

    if (sentiment >= threshold) {
      blurHeadline(headline);
    } else {
      unblurHeadline(headline);
    }
  }
}