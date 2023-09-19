<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import { scale } from 'svelte/transition'

  export let emails: string[] = []
</script>

{#if emails.length}
  <div class="{$$restProps?.class} flex-shrink-0 flex -space-x-1">
    {#each emails as email}
      <div class="relative" in:scale={{ duration: 500 }}>
        <Gravatar
          title={email}
          class="w-5 rounded-full overflow-hidden ring-2 ring-[#262e3c]"
          value={email}
        />
        <span
          title="Connected!"
          class="absolute bottom-0 left-0.5 block h-1.5 w-1.5 rounded-full bg-red-400 ring-1 ring-white"
        />
      </div>
    {/each}
  </div>
{/if}
