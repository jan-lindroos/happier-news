import {
  AutoModelForSequenceClassification,
  AutoTokenizer,
  env,
  PreTrainedModel,
  PreTrainedTokenizer
} from "@huggingface/transformers";

function configureRuntime() {
  env.useBrowserCache = false;
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  env.localModelPath = chrome.runtime.getURL('models/');

  if (env.backends.onnx.wasm) {
    env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('ort/');
    env.backends.onnx.wasm.numThreads = 1;
  }
}

function createPipeline(tokeniser: PreTrainedTokenizer, model: PreTrainedModel) {
  const cache = new Map<string, number>();
  const inflight = new Map<string, Promise<number>>();

  const pipeline = async (text: string): Promise<number> => {
    const inputs = await tokeniser(text, {return_tensors: 'pt'});
    const outputs = await model(inputs);
    return outputs.logits.data[0];
  };

  return async (text: string) => {
    if (cache.has(text))
      return cache.get(text)!;

    let task: Promise<number>;
    if (inflight.has(text)) {
      task = inflight.get(text)!;
    } else {
      task = pipeline(text);
      inflight.set(text, task);
    }

    try {
      const result = await task;
      cache.set(text, result);
      return result;
    } catch {
      return null;
    } finally {
      // Avoid poisoning the cache.
      inflight.delete(text);
    }
  }
}

export async function prepareRuntime() {
  configureRuntime();

  const base = chrome.runtime.getURL('models/minilm-l12-news/');
  const tokeniser = await AutoTokenizer.from_pretrained(base);
  const model = await AutoModelForSequenceClassification.from_pretrained(base, { dtype: 'fp32' });

  return createPipeline(tokeniser, model);
}