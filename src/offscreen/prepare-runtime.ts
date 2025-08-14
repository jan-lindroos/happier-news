import {
  AutoModelForSequenceClassification,
  AutoTokenizer,
  env,
  PreTrainedModel,
  PreTrainedTokenizer
} from "@huggingface/transformers";

/**
 * Configures the runtime environment for model execution.
 * Adjusts caching settings, model source preferences, backend configurations,
 * and sets the preferred backend for execution based on browser capabilities.
 *
 * @return {void} No return value.
 */
function configureRuntime(): void {
  env.useBrowserCache = false;
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  env.localModelPath = chrome.runtime.getURL('models/');

  if (env.backends?.onnx?.wasm) {
    // Causes issues with blobs due to chrome's security policy.
    env.backends.onnx.wasm.proxy = false;
    env.backends.onnx.wasm.numThreads = 1;

    env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('ort/');
  }

  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

  if (hasWebGPU && env.backends.onnx.webgpu) {
    env.backends.onnx.preferredBackend = 'webgpu';
  } else if (env.backends.onnx.wasm) {
    env.backends.onnx.preferredBackend = 'wasm';
  }
}

/**
 * Creates a pipeline for processing text using the provided tokeniser and model.
 *
 * @param {PreTrainedTokenizer} tokeniser - The tokeniser used to preprocess input text into tensors.
 * @param {PreTrainedModel} model - The pre-trained model used to generate output logits from input tensors.
 * @return {function(string): Promise<number|null>} An asynchronous function that takes a text input and returns a Promise resolving to a numerical result or null in case of an error.
 */
function createPipeline(tokeniser: PreTrainedTokenizer, model: PreTrainedModel): (arg0: string) => Promise<number | null> {
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

/**
 * Prepares and initialises the runtime environment by configuring it and loading any
 * required resources such as the tokeniser and model for sequence classification.
 *
 * @return {Promise<Object>} A promise that resolves to the pipeline created using the loaded tokenizer and model.
 */
export async function prepareRuntime(): Promise<object> {
  configureRuntime();

  const base = chrome.runtime.getURL('models/minilm-l12-news/');
  const tokeniser = await AutoTokenizer.from_pretrained(base);
  const model = await AutoModelForSequenceClassification.from_pretrained(base, { dtype: 'fp32' });

  return createPipeline(tokeniser, model);
}