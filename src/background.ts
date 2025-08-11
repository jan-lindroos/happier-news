import type { Message } from "./content/content.types.ts";

chrome.runtime?.onMessage.addListener((message, _, sendResponse) => {
  if (message?.type === 'GET_SCORE') {
    (async () => {
      try {
        await ensureHasInferenceOffscreen();

        const inferenceRequest: Message<string> = {
          type: 'INFERENCE',
          content: message.headline.title,
        };

        const response: Message<number> = await chrome.runtime.sendMessage(inferenceRequest);
        sendResponse(response);
      } catch (error) {
        console.error('Inference routing failed:', error);
      }
    })();
  }

  return true;
});

let ensureOffscreenPromise: Promise<void> | null = null;

/**
 * Ensures that an offscreen document is available for inference operations. If no offscreen
 * document currently exists, it creates a new offscreen document with the necessary configuration
 * to support persistent inference tasks.
 *
 * @return {Promise<void>} A promise that resolves once the offscreen document is ensured to exist
 * and is properly configured. If the offscreen document already exists, the promise resolves immediately.
 */
async function ensureHasInferenceOffscreen(): Promise<void> {
  if (ensureOffscreenPromise) return ensureOffscreenPromise;

  ensureOffscreenPromise = (async () => {
    const hasDoc = (await chrome.offscreen.hasDocument?.()) ?? false;
    if (!hasDoc) {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('inference/inference.html'),
        reasons: ['WORKERS', 'BLOBS'],
        justification: 'Run Transformers.js with WebGPU/WASM persistently.',
      });
    }
  })().finally(() => {
    ensureOffscreenPromise = null;
  });

  return ensureOffscreenPromise;
}