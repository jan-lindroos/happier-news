import { extractHeadlines } from "./extract-headlines";
import type { Headline } from "../content.types";
import type { Message } from "../../background/background.types.ts";
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

  for (let headline of headlines) {
    const sentiment = await getSentiment(headline);
    if (!sentiment)
      return;

    if (sentiment >= 0.45) {
      blurHeadline(headline);
    } else {
      unblurHeadline(headline);
    }
  }
}