import type { Message } from "../content/content.types.ts";

chrome.runtime.onMessage.addListener((message: Message<string>, _, sendResponse) => {
  if (message.type !== 'INFERENCE') return;

  (async () => {
    try {
      await ensureReady();

      const negativityScore = await runInference(message.content);
      const response: Message<number> = {
        type: "SCORE",
        content: negativityScore
      }

      sendResponse(response);
    } catch (error) {
      console.error('Inference failed:', error);
    }
  })();

  return true;
});

let isInitialised = false;

async function ensureReady() {
  if (isInitialised) return;

  // init logic

  isInitialised = true;
}

async function runInference(text: string): Promise<number> {
  if (!text) return 0;
  return Math.random();
}

try {
  await ensureReady();
} catch (error) {
  console.warn('Offscreen pre-init failed: ', error);
}
