<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { onMount } from "svelte";
  import type { Message, StorageOperation } from "../../background/background.types.ts";

  let checked = $state(false);
  let currentDomain = $state<string>("");

  let displayDomain = $derived.by(() => {
    const firstDotIndex = currentDomain.indexOf('.');
    return firstDotIndex === -1 ? currentDomain : currentDomain.slice(firstDotIndex + 1);
  });

  onMount(async () => {
    currentDomain = await getDomain()
    await loadDomainStatus();
  });

  async function getDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab?.url) {
        const url = new URL(tab.url);
        return url.hostname;
      }
    } catch (error) {}

    return "this website";
  }

  async function loadDomainStatus() {
    const getRequest: Message<StorageOperation<null>> = {
      type: 'STORAGE',
      content: {
        method: 'get',
        key: 'NEWS_DOMAINS',
        data: null,
      }
    }
    const response: Message<string[]> = await chrome.runtime.sendMessage(getRequest);
    checked = response.content.includes(currentDomain);
  }

  async function onCheckedChange(value: boolean) {
    const editRequest: Message<StorageOperation<string>> = {
      type: 'STORAGE',
      content: {
        method: value ? 'add' : 'remove',
        key: 'NEWS_DOMAINS',
        data: currentDomain,
      }
    }
    await chrome.runtime.sendMessage(editRequest);
    await chrome.runtime.sendMessage({ type: "REFRESH", content: null });
  }
</script>

<Label class="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
    <Checkbox
        id="toggle-2"
        bind:checked
        {onCheckedChange}
        class="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
    />
    <div class="grid gap-1.5 font-normal">
        <p class="text-sm font-medium leading-none pt-[1px]">
            {checked ? "Enabled" : "Disabled"} on {displayDomain}
        </p>
        <p class="text-muted-foreground text-sm">
            Tap here to toggle headline blurring on this website.
        </p>
    </div>
</Label>
