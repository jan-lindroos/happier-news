import { ensureOffscreenIsReady } from "./create-offscreen.ts";
import type { Message, StorageOperation } from "./background.types.ts";
import { getNewsDomains, storage } from "./storage.ts";

async function makeInferenceRequest(text: string): Promise<number | null> {
  await ensureOffscreenIsReady();

  const request: Message<string> = {
    type: 'INFERENCE_TASK',
    content: text,
  };

  try {
    const { content }: Message<number | null> = await chrome.runtime.sendMessage(request);
    return content;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.type) {
    case 'INFERENCE_REQUEST':
      (async () => {
        const score = await makeInferenceRequest(message.content);
        const inferenceResponse: Message<number | null> = {
          type: score ? 'INFERENCE_RESPONSE' : 'INFERENCE_ERROR',
          content: score
        }
        sendResponse(inferenceResponse);
      })();
      return true;

    case 'STORAGE':
      (async () => {
        const operation: StorageOperation<any> = message.content;
        const storageResponse: Message<any> = {
          type: 'STORAGE_RESPONSE',
          content: await storage[operation.method](operation.key, operation.data)
        }
        sendResponse(storageResponse);
      })();
      return true;

    case 'GET_NEWS_DOMAINS':
      (async () => {
        const newsDomainsResponse: Message<string[]> = {
          type: 'NEWS_DOMAINS_LIST',
          content: await getNewsDomains()
        }
        sendResponse(newsDomainsResponse);
      })();
      return true;
  }
});