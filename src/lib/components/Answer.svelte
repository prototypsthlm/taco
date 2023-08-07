<script lang="ts">
  import { fade } from 'svelte/transition'
  import { ArrowPathIcon } from '@babeard/svelte-heroicons/solid'
  import { markdownToHtml } from '$lib/utils/markdown'

  export let text: string | null
</script>

<div class="w-full p-4 md:p-8 bg-accent bg-opacity-10">
  <div class="flex gap-4 md:gap-8">
    <p class="h-10 w-10 text-accent bg-green-950 rounded-xl flex items-center justify-center">CG</p>
    {#if text}
      <!-- We need to force prose-invert, which is the dark mode for the prose class due to not having a non dark option -->
      <div in:fade class="max-w-5xl text-accent prose prose-invert">
        {#await markdownToHtml(text) then parsedText}
          {@html parsedText}
        {/await}
      </div>
    {:else}
      <div in:fade class="flex items-center justify-center space-x-2">
        <ArrowPathIcon class="h-6 w-6 text-white animate-spin" />
      </div>
    {/if}
  </div>
</div>
