import type { Message } from "./background.types.ts";

const CHECK_DELAY = 50;
const CHECK_COUNT = 10;

let offscreenIsReady: Promise<void> | null = null;

/**
 * Ensures that the offscreen component or context is properly initialised
 * and ready to use. If it is already ready, the promise resolves immediately.
 * Otherwise, it invokes the necessary functions to create and validate the offscreen setup.
 *
 * @return {Promise<void>} A promise that resolves once the offscreen context is ready.
 */
export async function ensureOffscreenIsReady(): Promise<void> {
  if (offscreenIsReady) 
    return offscreenIsReady;
  
  await createOffscreen();
  await checkIsLoaded();
  
  offscreenIsReady = null;
}

/**
 * Creates an offscreen document if it does not already exist. The offscreen document is necessary to
 * allow operations such as loading sentiment analysis models that can:
 * - stay in memory
 * - use webGPU
 *
 * @return {Promise<void>} A promise that resolves when the offscreen document has been created or
 * if it already exists.
 */
async function createOffscreen(): Promise<void> {
  const isCreated = await chrome.offscreen.hasDocument();
  if (isCreated)
    return;
  
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('offscreen/offscreen.html'),
    reasons: ['WORKERS', 'BLOBS'],
    justification: 'Load sentiment analysis models persistently.',
  });
}

/**
 * Checks if a certain process or element has loaded by sending a message and awaiting a response.
 * Retries the check a specified number of times with a delay if a failure occurs.
 *
 * @param {number} checkLeft - The number of retry attempts remaining to check if the process or element is loaded. Defaults to `CHECK_COUNT`.
 * @return {Promise<void>} A promise that resolves when the process or element is successfully loaded or when all retry attempts are exhausted.
 */
async function checkIsLoaded(checkLeft: number = CHECK_COUNT): Promise<void> {
  try {
    const ping: Message<string> = {
      type: 'PING',
      content: 'OFFSCREEN',
    }
    const response = await chrome.runtime.sendMessage(ping);
    if (response)
      return;
  } catch {
    await new Promise(resolve => setTimeout(resolve, CHECK_DELAY));
    if (checkLeft)
      await checkIsLoaded(checkLeft--);
  }
}
