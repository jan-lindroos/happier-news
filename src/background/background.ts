import { ensureOffscreenIsReady } from "./create-offscreen.ts";
import type { Message, StorageOperation } from "./background.types.ts";
import { getNewsDomains, storage } from "./storage.ts";

/**
 * Sends a message to perform an inference task with the given text and returns the inferred result.
 *
 * @param {string} text - The input text for the inference task.
 * @return {Promise<number | null>} A promise that resolves to the inferred result as a number, or null if the request fails.
 */
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

/**
 * Sends a specified message to all open browser tabs.
 *
 * @param {Message<T>} message - The message object to be sent to the tabs.
 * @return {Promise<void>} A promise that resolves once the message has been sent to all eligible tabs, or rejects if an error occurs.
 */
async function sendToTabs<T>(message: Message<T>): Promise<void> {
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