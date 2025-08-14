<script lang="ts">
  import { Slider } from "$lib/components/ui/slider/index.js";
  import type { Message, StorageOperation } from "../../background/background.types.ts";
  import {onMount} from "svelte";

  // This only controls the default display value (not the initial value, which is in news-feed.ts).
  const DEFAULT_STRENGTH = 0.4;
  let strength = $state(DEFAULT_STRENGTH);

  onMount(loadStrength);

  async function loadStrength() {
    const getRequest: Message<StorageOperation<number>> = {
      type: 'STORAGE',
      content: {
        method: 'get',
        key: 'THRESHOLD',
        data: 1 - DEFAULT_STRENGTH,
      }
    }
    const response: Message<number> = await chrome.runtime.sendMessage(getRequest);

    // Convert the threshold to strength.
    strength = 1 - response.content;
  }

  async function onValueCommit(newStrength: number) {
    const editRequest: Message<StorageOperation<number>> = {
      type: 'STORAGE',
      content: {
        method: 'set',
        key: 'THRESHOLD',
        data: 1 - newStrength,
      }
    }
    await chrome.runtime.sendMessage(editRequest);
    await chrome.runtime.sendMessage({ type: "REFRESH", content: null });
  }
</script>

<div class="grid gap-1.5 font-normal">
    <p class="text-sm font-medium leading-none">
        Strength
    </p>
    <p class="text-muted-foreground text-sm">
        The higher the strength, the more articles will be blurred.
    </p>
    <Slider class="pt-1.5 pb-1.5" type="single" {onValueCommit} bind:value={strength} min={0.2} max={0.7} step={0.005}/>
</div>