import type { Message } from "./content/content.types.ts";

chrome.runtime.onMessage.addListener((message: Message<string>, _, sendResponse) => {
  if (message?.type === 'GET_SCORE') {
    (async () => {
      try {
        await ensureHasInferenceOffscreen();
        await waitForOffscreenReady();

        const inferenceRequest: Message<string> = {
          type: 'INFERENCE',
          content: message.content,
        };

        const response: Message<number> = await chrome.runtime.sendMessage(inferenceRequest);
        sendResponse(response);
      } catch (error) {
        console.error('Inference routing failed:', error);
        sendResponse({ type: "SCORE", content: NaN } as Message<number>);
      }
    })();
    return true; // keep the channel open for async sendResponse
  }
});

let ensureOffscreenPromise: Promise<void> | null = null;
let offscreenReadyPromise: Promise<void> | null = null;

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

async function waitForOffscreenReady(): Promise<void> {
  if (offscreenReadyPromise) return offscreenReadyPromise;

  offscreenReadyPromise = (async () => {
    // Try a few quick pings; if they fail, recreate the doc once.
    const ping = async () => chrome.runtime.sendMessage({ type: 'PING_OFFSCREEN' }).then(() => true).catch(() => false);

    for (let attempt = 0; attempt < 40; attempt++) {
      if (await ping()) return;
      await new Promise(r => setTimeout(r, 150));
    }

    // If we got here, the offscreen likely crashed or never loaded—recreate it.
    try {
      await chrome.offscreen.closeDocument?.();
    } catch {}
    await ensureHasInferenceOffscreen();

    for (let attempt = 0; attempt < 40; attempt++) {
      if (await ping()) return;
      await new Promise(r => setTimeout(r, 150));
    }

    throw new Error('Offscreen not responding');
  })().finally(() => {
    // Keep the promise for reuse only if successful; on failure, allow retry next call
    // (no-op here; leaving it set is fine too if you prefer)
  });

  return offscreenReadyPromise;
}