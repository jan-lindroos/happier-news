import type { Message } from "../background/background.types.ts";
import { prepareRuntime } from "./prepare-runtime.ts";

const pipeline = await prepareRuntime()

chrome.runtime.onMessage.addListener((message: Message<string>, _, sendResponse) => {
  if (message.type !== 'INFERENCE_TASK')
    return;

  (async () => {
    const sentiment = await pipeline(message.content)
    const response: Message<number> = {
      type: sentiment ? 'INFERENCE_RESPONSE' : 'INFERENCE_ERROR',
      content: sentiment ?? 0
    }
    sendResponse(response)
  })();

  return true;
});