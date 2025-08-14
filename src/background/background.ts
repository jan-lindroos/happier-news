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

async function sendToTabs<T>(message: Message<T>) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id)
      return;

    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch (error) {
      console.log(`Could not send refresh to tab ${tab.id}:`, error);
    }
  }
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log("Received: ", message.type);
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

    // Storage does not handle this due to loading defaults on first fetch.
    case 'GET_NEWS_DOMAINS':
      (async () => {
        const newsDomainsResponse: Message<string[]> = {
          type: 'NEWS_DOMAINS_LIST',
          content: await getNewsDomains()
        }
        sendResponse(newsDomainsResponse);
      })();
      return true;

    case 'REFRESH':
      (async () => {
        await sendToTabs(message);
        sendResponse();
      })();
      return true;
  }
});