<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'

  export let emails: string[] = []
</script>

{#if emails.length}
  <div class="flex -space-x-1 overflow-hidden">
    {#each emails as email}
      <Gravatar
        title={email}
        class="w-6 rounded-full overflow-hidden ring-2 ring-[#262e3c]"
        value={email}
      />
      <span
        class="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"
      />
    {/each}
  </div>
{/if}
