import type { Message } from "./background.types.ts";

const CHECK_DELAY = 50;
const CHECK_COUNT = 10;

let offscreenIsReady: Promise<void> | null = null;

export async function ensureOffscreenIsReady(): Promise<void> {
  if (offscreenIsReady) 
    return offscreenIsReady;
  
  await createOffscreen();
  await checkIsLoaded();
  
  offscreenIsReady = null;
}

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
