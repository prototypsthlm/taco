<script lang="ts">
  import { fade } from 'svelte/transition'
  import { ArrowPathIcon } from '@babeard/svelte-heroicons/solid'
  import { markdownToHtml } from '$lib/utils/markdown'

  export let text: string | null
</script>

<div class="w-full min-h-[4rem] p-4 md:p-8 bg-accent bg-opacity-10">
  <div class="flex gap-4 md:gap-8">
    <p class="text-2xl h-12 w-12 text-center p-2 text-accent bg-green-950 rounded-xl">CG</p>
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
