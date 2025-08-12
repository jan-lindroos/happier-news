import type { Message } from "../content/content.types.ts";
import { env, AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';

// TODO: Move cache here
// TODO: If this approach works, move ort-wasm-simd-threaded + model files dynamically
env.useBrowserCache = false;
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = chrome.runtime.getURL('models/');

if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('ort/');
  env.backends.onnx.wasm.numThreads = 1;
}

const base = chrome.runtime.getURL('models/minilm-l12-news/');
const tokeniser = await AutoTokenizer.from_pretrained(base);
const model = await AutoModelForSequenceClassification.from_pretrained(base, { dtype: 'fp32' });

chrome.runtime.onMessage.addListener((message: Message<string>, _, sendResponse) => {
  if (message.type !== 'INFERENCE') return;

  (async () => {
    try {
      const negativityScore = await runInference(message.content);
      const response: Message<number> = {
        type: "SCORE",
        content: negativityScore
      }

      sendResponse(response);
    } catch (error) {
      console.warn('Inference failed:', message.content);
    }
  })();

  return true;
});

async function runInference(text: string): Promise<number> {
  const inputs = await tokeniser(text, { return_tensors: 'pt' });
  const outputs = await model(inputs);
  const logits = outputs.logits.data;

  return logits[0];
}