<script lang="ts">
  import SiteToggle from "$lib/SiteToggle.svelte";
  import StrengthSlider from "$lib/StrengthSlider.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { ModeWatcher } from "mode-watcher";
</script>

<ModeWatcher />
<main class="p-4 grid gap-4 text-left">
  <div class="flex w-full justify-start items-center gap-3">
    <h3 class="text-xl font-semibold tracking-tight">
      Happier (News)
    </h3>
    <Badge variant="secondary">Beta</Badge>
  </div>

  <StrengthSlider />
  <SiteToggle />
</main>