<script lang="ts">
  export let text: string
</script>

<div class="w-full min-h-[4rem] flex gap-4 md:gap-8 p-4 md:p-8 bg-accent bg-opacity-10">
  {#if text}
    <p class="text-2xl h-12 w-12 text-center p-2 text-accent bg-green-950 rounded-xl">
      CG
    </p>
    <p class="max-w-5xl text-xl text-accent">
      {text}
    </p>
  {:else}
    <div class="flex items-center justify-center space-x-2">
      <div class="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400" />
      <div class="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400" />
      <div class="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400" />
    </div>
  {/if}
</div>
