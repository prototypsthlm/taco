<script lang="ts">
  import { fade } from 'svelte/transition'
  import { markdownToHtml } from '$lib/utils/markdown'

  export let text: string | null

  const transitionDelay = 250
</script>

<div class="w-full min-h-[4rem] p-4 md:p-8 bg-accent bg-opacity-10">
  {#if text}
    <div in:fade={{ delay: transitionDelay }} class="flex gap-4 md:gap-8">
      <div class="text-2xl h-12 w-12 text-center p-2 text-accent bg-green-950 rounded-xl">CG</div>
      <!-- We need to force prose-invert, which is the dark mode for the prose class due to not having a non dark option -->
      <div class="max-w-5xl text-xl text-accent prose prose-invert">
        {#await markdownToHtml(text) then parsedText}
          {@html parsedText}
        {/await}
      </div>
    </div>
  {:else}
    <div
      out:fade={{ duration: transitionDelay }}
      class="flex items-center justify-center space-x-2"
    >
      <div class="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400" />
      <div class="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400" />
      <div class="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400" />
    </div>
  {/if}
</div>
