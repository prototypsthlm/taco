<script lang="ts">
  export let title: string
  export let description: string
  export let emoji: string
  export let isImplemented: boolean
</script>

<div class="flex flex-col justify-between gap-4 p-4 bg-primary rounded-xl max-w-sm">
  <div class="flex items-center gap-4">
    <p class="text-4xl">
      {emoji}
    </p>
    <div class="flex flex-col">
      <h1 class="text-accent text-2xl font-bold">{title}</h1>
      <p class="text-accent text-xl">{description}</p>
    </div>
  </div>
  <div class="text-center">
    {#if isImplemented}
      <p class="text-accent text-xl">✅ Implemented</p>
    {:else}
      <p class="text-accent text-xl">💻 Under development</p>
    {/if}
  </div>
</div>
